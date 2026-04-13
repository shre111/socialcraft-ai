from __future__ import annotations
from fastapi import APIRouter, Depends
from app.database import get_supabase
from app.utils.auth import get_current_user_id
from app.ml.trainer import ModelTrainer
from app.ml.predictor import PersonalizationEngine
from app.models.user import UserMLProfile
from datetime import datetime

router = APIRouter()


@router.get("/profile", response_model=dict)
async def get_ml_profile(user_id: str = Depends(get_current_user_id)):
    db = get_supabase()
    engine = PersonalizationEngine(db)
    profile = await engine.build_user_profile(user_id)

    ml = UserMLProfile(
        predicted_tone=profile.get("preferred_tone", "casual"),
        predicted_language=profile.get("preferred_language", "english"),
        predicted_emoji_level=profile.get("emoji_usage", "medium"),
        training_data_points=profile.get("data_points", 0),
        last_updated=datetime.utcnow(),
    )
    return {"success": True, "data": ml.model_dump()}


@router.post("/retrain", response_model=dict)
async def retrain_model(user_id: str = Depends(get_current_user_id)):
    db = get_supabase()
    trainer = ModelTrainer(db)
    result = await trainer.train(user_id)
    if "error" in result:
        return {"success": False, "data": None, "error": result["error"]}
    return {"success": True, "data": result}
