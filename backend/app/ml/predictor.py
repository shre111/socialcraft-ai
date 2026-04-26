from __future__ import annotations
from collections import Counter
from supabase import Client


class PersonalizationEngine:
    """
    Phase 1: frequency-counting rule-based profile.
    Phase 2 (trainer.py): upgrade to sklearn LogisticRegression.
    """

    MIN_EVENTS_FOR_PROFILE = 3
    MIN_EVENTS_FOR_TRAINING = 10

    def __init__(self, db: Client) -> None:
        self._db = db

    async def build_user_profile(self, user_id: str) -> dict:
        """
        Query user_events and captions tables.
        Calculate most-used language, most-liked tone, avg caption length,
        emoji pattern, hashtag count preference.
        Returns a profile dict used in prompt building.
        """
        # Fetch liked captions
        liked = (
            self._db.table("captions")
            .select("language, tone, platform, generated_text, final_text, hashtags")
            .eq("user_id", user_id)
            .eq("was_liked", True)
            .execute()
        ).data or []

        # Fetch all captions for language frequency
        all_caps = (
            self._db.table("captions")
            .select("language, tone, hashtags, generated_text")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .limit(50)
            .execute()
        ).data or []

        # Fetch event count
        events = (
            self._db.table("user_events")
            .select("id")
            .eq("user_id", user_id)
            .execute()
        ).data or []

        if not all_caps:
            return {"data_points": 0}

        # Most used language
        lang_counts = Counter(c["language"] for c in all_caps)
        preferred_language = lang_counts.most_common(1)[0][0]

        # Most liked tone
        if liked:
            tone_counts = Counter(c["tone"] for c in liked)
            preferred_tone = tone_counts.most_common(1)[0][0]
        else:
            tone_counts = Counter(c["tone"] for c in all_caps)
            preferred_tone = tone_counts.most_common(1)[0][0] if tone_counts else "casual"

        # Average hashtag count from liked or all
        source = liked if liked else all_caps
        avg_hashtags = round(
            sum(len(c.get("hashtags") or []) for c in source) / max(len(source), 1)
        )
        avg_hashtags = max(avg_hashtags, 3)  # minimum 3

        # Emoji usage — heuristic from text
        emoji_scores = []
        for c in source:
            text = c.get("final_text") or c.get("generated_text", "")
            emoji_count = sum(1 for ch in text if ord(ch) > 0x1F300)
            words = len(text.split()) or 1
            emoji_scores.append(emoji_count / words)
        avg_emoji = sum(emoji_scores) / max(len(emoji_scores), 1)
        if avg_emoji < 0.05:
            emoji_usage = "low"
        elif avg_emoji < 0.15:
            emoji_usage = "medium"
        else:
            emoji_usage = "high"

        # Average caption length
        lengths = [len((c.get("generated_text") or "").split()) for c in source]
        avg_length = round(sum(lengths) / max(len(lengths), 1))

        return {
            "preferred_language": preferred_language,
            "preferred_tone": preferred_tone,
            "emoji_usage": emoji_usage,
            "avg_caption_length": avg_length,
            "hashtag_count": avg_hashtags,
            "preferred_platforms": [],
            "data_points": len(events),
        }

    async def get_similar_liked_captions(self, user_id: str, topic: str) -> list[str]:
        """
        Phase 2: pgvector cosine similarity — finds liked captions semantically
        similar to the current topic. Falls back to recency if no embeddings exist yet.
        """
        try:
            from app.services import embedding_service
            query_embedding = embedding_service.embed(topic)
            result = self._db.rpc(
                "match_liked_captions",
                {
                    "query_embedding": query_embedding,
                    "match_user_id": user_id,
                    "match_count": 3,
                },
            ).execute()
            rows = result.data or []
            if rows:
                return [r.get("final_text") or r["generated_text"] for r in rows]
        except Exception:
            pass

        # Fallback: most recent liked captions (no embeddings yet)
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

    def should_retrain(self, user_id: str) -> bool:
        """Check if user has 10+ new events since last training."""
        model_row = (
            self._db.table("user_ml_models")
            .select("last_trained_at, training_samples")
            .eq("user_id", user_id)
            .execute()
        ).data
        if not model_row:
            # Count total events; train if ≥ threshold
            count = (
                self._db.table("user_events")
                .select("id", count="exact")
                .eq("user_id", user_id)
                .execute()
            ).count or 0
            return count >= self.MIN_EVENTS_FOR_TRAINING

        last = model_row[0]
        new_events = (
            self._db.table("user_events")
            .select("id", count="exact")
            .eq("user_id", user_id)
            .gt("created_at", last["last_trained_at"])
            .execute()
        ).count or 0
        return new_events >= self.MIN_EVENTS_FOR_TRAINING
