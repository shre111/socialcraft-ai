from __future__ import annotations
from collections import Counter
from supabase import Client
from app.ml.predictor import PersonalizationEngine


class PersonalizationService:
    """Rule-based personalization for Phase 1 (no ML training required)."""

    def __init__(self, db: Client) -> None:
        self._db = db
        self._engine = PersonalizationEngine(db)

    async def build_user_profile(self, user_id: str) -> dict:
        return await self._engine.build_user_profile(user_id)

    async def get_similar_liked_captions(self, user_id: str, topic: str) -> list[str]:
        """Return up to 3 captions the user liked (Phase 1: simple fetch, no embeddings)."""
        result = (
            self._db.table("captions")
            .select("generated_text, final_text")
            .eq("user_id", user_id)
            .eq("was_liked", True)
            .order("created_at", desc=True)
            .limit(3)
            .execute()
        )
        rows = result.data or []
        return [r.get("final_text") or r["generated_text"] for r in rows]
