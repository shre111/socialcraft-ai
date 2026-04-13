from __future__ import annotations
from fastapi import APIRouter, Depends
from app.models.feedback import FeedbackRequest
from app.database import get_supabase
from app.utils.auth import get_current_user_id
import uuid
from datetime import datetime

router = APIRouter()


@router.post("/feedback", response_model=dict)
async def submit_feedback(
    req: FeedbackRequest,
    user_id: str = Depends(get_current_user_id),
):
    db = get_supabase()

    # Record event for ML training
    event = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "event_type": req.feedback_type,
        "caption_id": req.caption_id,
        "metadata": {"edited_text": req.edited_text} if req.edited_text else {},
        "created_at": datetime.utcnow().isoformat(),
    }
    db.table("user_events").insert(event).execute()

    # Update caption flags
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

    return {"success": True, "data": {"ok": True}}
