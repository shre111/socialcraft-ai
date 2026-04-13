from __future__ import annotations
from fastapi import APIRouter, Depends
from app.models.user import UserProfile, UpdatePreferencesRequest, UserMLProfile
from app.database import get_supabase
from app.utils.auth import get_current_user_id
from app.ml.predictor import PersonalizationEngine
from datetime import datetime

router = APIRouter()


@router.get("/profile", response_model=dict)
async def get_profile(user_id: str = Depends(get_current_user_id)):
    db = get_supabase()
    result = db.table("user_profiles").select("*").eq("id", user_id).single().execute()

    if not result.data:
        # Auto-create profile on first access
        new_profile = {
            "id": user_id,
            "preferred_language": "english",
            "preferred_tone": "casual",
            "preferred_platforms": [],
            "emoji_usage": "medium",
            "avg_caption_length": 100,
            "hashtag_count": 6,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        }
        db.table("user_profiles").insert(new_profile).execute()
        data = new_profile
    else:
        data = result.data

    profile = UserProfile(
        id=data["id"],
        display_name=data.get("display_name"),
        preferred_language=data.get("preferred_language", "english"),
        preferred_tone=data.get("preferred_tone", "casual"),
        preferred_platforms=data.get("preferred_platforms") or [],
        emoji_usage=data.get("emoji_usage", "medium"),
        avg_caption_length=data.get("avg_caption_length", 100),
        hashtag_count=data.get("hashtag_count", 6),
    )
    return {"success": True, "data": profile.model_dump()}


@router.put("/preferences", response_model=dict)
async def update_preferences(
    req: UpdatePreferencesRequest,
    user_id: str = Depends(get_current_user_id),
):
    db = get_supabase()
    updates = req.model_dump(exclude_none=True)
    updates["updated_at"] = datetime.utcnow().isoformat()
    db.table("user_profiles").update(updates).eq("id", user_id).execute()
    result = db.table("user_profiles").select("*").eq("id", user_id).single().execute()
    data = result.data
    profile = UserProfile(
        id=data["id"],
        display_name=data.get("display_name"),
        preferred_language=data.get("preferred_language", "english"),
        preferred_tone=data.get("preferred_tone", "casual"),
        preferred_platforms=data.get("preferred_platforms") or [],
        emoji_usage=data.get("emoji_usage", "medium"),
        avg_caption_length=data.get("avg_caption_length", 100),
        hashtag_count=data.get("hashtag_count", 6),
    )
    return {"success": True, "data": profile.model_dump()}


@router.get("/ml/profile", response_model=dict)
async def get_ml_profile(user_id: str = Depends(get_current_user_id)):
    db = get_supabase()
    engine = PersonalizationEngine(db)
    profile = await engine.build_user_profile(user_id)

    ml_profile = UserMLProfile(
        predicted_tone=profile.get("preferred_tone", "casual"),
        predicted_language=profile.get("preferred_language", "english"),
        predicted_emoji_level=profile.get("emoji_usage", "medium"),
        training_data_points=profile.get("data_points", 0),
        last_updated=datetime.utcnow(),
    )
    return {"success": True, "data": ml_profile.model_dump()}
