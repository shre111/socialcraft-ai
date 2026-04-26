from __future__ import annotations
import logging
from fastapi import APIRouter, BackgroundTasks, Depends
from app.models.feedback import FeedbackRequest
from app.database import get_supabase
from app.utils.auth import get_current_user_id
from app.ml.trainer import ModelTrainer
from app.ml.predictor import PersonalizationEngine
import uuid
from datetime import datetime

router = APIRouter()
log = logging.getLogger(__name__)


def _auto_retrain(user_id: str) -> None:
    try:
        db = get_supabase()
        engine = PersonalizationEngine(db)
        if engine.should_retrain(user_id):
            import asyncio
            trainer = ModelTrainer(db)
            result = asyncio.run(trainer.train(user_id))
            log.info("Auto-retrain for %s: %s", user_id, result)
    except Exception:
        log.exception("Auto-retrain failed for %s", user_id)


@router.post("/feedback", response_model=dict)
async def submit_feedback(
    req: FeedbackRequest,
    background_tasks: BackgroundTasks,
    user_id: str = Depends(get_current_user_id),
):
    db = get_supabase()

    event = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "event_type": req.feedback_type,
        "caption_id": req.caption_id,
        "metadata": {"edited_text": req.edited_text} if req.edited_text else {},
        "created_at": datetime.utcnow().isoformat(),
    }
    db.table("user_events").insert(event).execute()

    updates: dict = {}
    if req.feedback_type == "liked":
        updates["was_liked"] = True
    elif req.feedback_type == "edited" and req.edited_text:
        updates["was_edited"] = True
        updates["final_text"] = req.edited_text
    elif req.feedback_type in ("copied", "published"):
        updates["was_used"] = True

    if updates:
        db.table("captions").update(updates).eq("id", req.caption_id).execute()

    background_tasks.add_task(_auto_retrain, user_id)

    return {"success": True, "data": {"ok": True}}
