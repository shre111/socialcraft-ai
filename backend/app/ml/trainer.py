from __future__ import annotations
import json
from datetime import datetime
from supabase import Client
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from app.ml.feature_extractor import extract_features
from app.ml.predictor import PersonalizationEngine


class ModelTrainer:
    def __init__(self, db: Client) -> None:
        self._db = db
        self._engine = PersonalizationEngine(db)

    async def train(self, user_id: str) -> dict:
        """
        Full sklearn training flow.
        Only runs when user has 10+ events (enforced by caller).
        Saves model params to user_ml_models table.
        Returns training summary.
        """
        # Fetch events
        events_result = (
            self._db.table("user_events")
            .select("*")
            .eq("user_id", user_id)
            .execute()
        )
        events = events_result.data or []

        if len(events) < PersonalizationEngine.MIN_EVENTS_FOR_TRAINING:
            return {"error": "Not enough training data", "required": 10, "current": len(events)}

        # Fetch related captions (keyed by id)
        caption_ids = list({e["caption_id"] for e in events if e.get("caption_id")})
        caps_result = (
            self._db.table("captions")
            .select("id, language, platform, topic, generated_text")
            .in_("id", caption_ids)
            .execute()
        )
        captions_map = {r["id"]: r for r in (caps_result.data or [])}

        # Extract features
        df = extract_features(events, captions_map)
        if df.empty or df["target"].nunique() < 2:
            return {"error": "Not enough class diversity for training"}

        feature_cols = ["hour_of_day", "day_of_week", "platform_enc", "language_enc", "topic_length"]
        X = df[feature_cols]
        y = df["target"]

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        model = LogisticRegression(max_iter=500)
        model.fit(X_train, y_train)

        accuracy = float(accuracy_score(y_test, model.predict(X_test)))
        importance = dict(zip(feature_cols, model.coef_[0].tolist()))

        # Persist model params (serialised as JSON)
        model_data = {
            "coef": model.coef_.tolist(),
            "intercept": model.intercept_.tolist(),
            "classes": model.classes_.tolist(),
        }

        payload = {
            "user_id": user_id,
            "model_data": model_data,
            "feature_importance": importance,
            "accuracy": accuracy,
            "training_samples": len(df),
            "last_trained_at": datetime.utcnow().isoformat(),
        }

        # Upsert
        existing = (
            self._db.table("user_ml_models")
            .select("id")
            .eq("user_id", user_id)
            .execute()
        ).data
        if existing:
            self._db.table("user_ml_models").update(payload).eq("user_id", user_id).execute()
        else:
            self._db.table("user_ml_models").insert(payload).execute()

        return {"accuracy": accuracy, "samples": len(df), "feature_importance": importance}
