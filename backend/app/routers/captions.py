from __future__ import annotations
import logging
import traceback
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from app.models.caption import GenerateCaptionRequest, GenerateCaptionResponse, CaptionItem
from app.services.claude_service import ClaudeService
from app.services.personalization import PersonalizationService
from app.services import embedding_service
from app.database import get_supabase
from app.utils.auth import get_current_user_id
import uuid
from datetime import datetime

router = APIRouter()
log = logging.getLogger(__name__)


def _save_embeddings(caption_ids: list[str], texts: list[str]) -> None:
    """Generate and store embeddings for a batch of captions (runs in background)."""
    try:
        db = get_supabase()
        for caption_id, text in zip(caption_ids, texts):
            embedding = embedding_service.embed(text)
            db.table("captions").update({"embedding": embedding}).eq("id", caption_id).execute()
        log.info("Saved embeddings for %d captions", len(caption_ids))
    except Exception:
        log.exception("Embedding save failed")


@router.post("/generate", response_model=dict)
async def generate_captions(
    req: GenerateCaptionRequest,
    background_tasks: BackgroundTasks,
    user_id: str = Depends(get_current_user_id),
):
    try:
        db = get_supabase()
        personalization = PersonalizationService(db)
        claude = ClaudeService()

        # Build user profile for personalization
        user_profile = await personalization.build_user_profile(user_id)
        similar_captions = await personalization.get_similar_liked_captions(user_id, req.topic)

        # Generate via Claude
        raw_captions = await claude.generate(
            topic=req.topic,
            language=req.language,
            tone=req.tone,
            platform=req.platform,
            count=req.count,
            user_profile=user_profile,
            similar_captions=similar_captions,
        )

        personalization_used = bool(user_profile.get("data_points", 0) >= 3)
        confidence = min(user_profile.get("data_points", 0) / 20, 1.0)

        # Persist to DB
        items: list[CaptionItem] = []
        caption_ids_for_embedding: list[str] = []
        texts_for_embedding: list[str] = []

        for cap in raw_captions:
            caption_id = str(uuid.uuid4())
            now = datetime.utcnow().isoformat()
            row = {
                "id": caption_id,
                "user_id": user_id,
                "topic": req.topic,
                "generated_text": cap["text"],
                "language": req.language,
                "tone": req.tone,
                "platform": req.platform,
                "hashtags": cap.get("hashtags", []),
                "created_at": now,
            }
            db.table("captions").insert(row).execute()
            caption_ids_for_embedding.append(caption_id)
            texts_for_embedding.append(f"{req.topic} {cap['text']}")
            items.append(
                CaptionItem(
                    id=caption_id,
                    topic=req.topic,
                    generated_text=cap["text"],
                    language=req.language,
                    tone=req.tone,
                    platform=req.platform,
                    hashtags=cap.get("hashtags", []),
                    created_at=datetime.fromisoformat(now),
                )
            )

        # Generate embeddings in background — doesn't block the response
        background_tasks.add_task(_save_embeddings, caption_ids_for_embedding, texts_for_embedding)

        return {
            "success": True,
            "data": GenerateCaptionResponse(
                captions=items,
                personalization_used=personalization_used,
                confidence_score=confidence,
            ).model_dump(),
        }

    except HTTPException:
        raise
    except Exception as exc:
        log.error("Caption generation failed:\n%s", traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Generation failed: {type(exc).__name__}: {exc}",
        )


@router.get("/history", response_model=dict)
async def get_history(
    limit: int = 20,
    user_id: str = Depends(get_current_user_id),
):
    try:
        db = get_supabase()
        result = (
            db.table("captions")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        rows = result.data or []
        captions = [
            CaptionItem(
                id=r["id"],
                topic=r["topic"],
                generated_text=r["generated_text"],
                language=r["language"],
                tone=r["tone"],
                platform=r["platform"],
                hashtags=r.get("hashtags") or [],
                was_used=r.get("was_used", False),
                was_liked=r.get("was_liked", False),
                was_edited=r.get("was_edited", False),
                final_text=r.get("final_text"),
                created_at=datetime.fromisoformat(r["created_at"]),
            )
            for r in rows
        ]
        return {"success": True, "data": [c.model_dump() for c in captions]}
    except Exception as exc:
        log.error("History fetch failed:\n%s", traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"History failed: {type(exc).__name__}: {exc}")
