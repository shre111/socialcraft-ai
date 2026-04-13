from __future__ import annotations
from datetime import datetime
import pandas as pd


PLATFORM_MAP = {
    "instagram": 0, "facebook": 1, "youtube": 2,
    "linkedin": 3, "threads": 4, "pinterest": 5,
}

LANGUAGE_MAP = {
    "english": 0, "hindi": 1, "gujarati": 2,
    "hinglish": 3, "marathi": 4, "punjabi": 5, "tamil": 6,
}


def extract_features(events: list[dict], captions: dict[str, dict]) -> pd.DataFrame:
    """
    Convert raw user_events + captions into a feature DataFrame for ML training.

    Features per event:
    - hour_of_day  (0-23)
    - day_of_week  (0=Mon … 6=Sun)
    - platform_enc (int-encoded)
    - language_enc (int-encoded)
    - topic_length (char count)
    - target        was_liked (bool → int)
    """
    rows = []
    for event in events:
        caption = captions.get(event["caption_id"])
        if caption is None:
            continue
        ts = datetime.fromisoformat(event["created_at"])
        rows.append(
            {
                "hour_of_day": ts.hour,
                "day_of_week": ts.weekday(),
                "platform_enc": PLATFORM_MAP.get(caption.get("platform", ""), -1),
                "language_enc": LANGUAGE_MAP.get(caption.get("language", ""), -1),
                "topic_length": len(caption.get("topic", "")),
                "target": int(event["event_type"] == "liked"),
            }
        )
    return pd.DataFrame(rows)
