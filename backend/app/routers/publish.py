from __future__ import annotations
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.database import get_supabase
from app.utils.auth import get_current_user_id
import uuid
from datetime import datetime

router = APIRouter()


class SchedulePostRequest(BaseModel):
    caption_id: str
    platform: str
    scheduled_at: datetime


@router.post("/post", response_model=dict)
async def publish_post(
    caption_id: str,
    platform: str,
    user_id: str = Depends(get_current_user_id),
):
    """Phase 2: integrate real social platform APIs."""
    return {
        "success": False,
        "data": None,
        "error": "Social publishing is coming in Phase 2.",
    }


@router.post("/schedule", response_model=dict)
async def schedule_post(
    req: SchedulePostRequest,
    user_id: str = Depends(get_current_user_id),
):
    db = get_supabase()
    row = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "caption_id": req.caption_id,
        "platform": req.platform,
        "scheduled_at": req.scheduled_at.isoformat(),
        "status": "pending",
        "created_at": datetime.utcnow().isoformat(),
    }
    db.table("scheduled_posts").insert(row).execute()
    return {"success": True, "data": row}


@router.get("/scheduled", response_model=dict)
async def get_scheduled(user_id: str = Depends(get_current_user_id)):
    db = get_supabase()
    result = (
        db.table("scheduled_posts")
        .select("*, captions(generated_text, final_text, topic)")
        .eq("user_id", user_id)
        .order("scheduled_at", desc=False)
        .execute()
    )
    return {"success": True, "data": result.data or []}
