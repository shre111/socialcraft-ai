from __future__ import annotations
from pydantic import BaseModel
from typing import Literal, Optional
from datetime import datetime
import uuid

FeedbackType = Literal["liked", "copied", "edited", "regenerated", "disliked", "published"]


class FeedbackRequest(BaseModel):
    caption_id: str
    feedback_type: FeedbackType
    edited_text: Optional[str] = None


class FeedbackEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    event_type: FeedbackType
    caption_id: str
    metadata: Optional[dict] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


from pydantic import Field  # noqa: E402 — keep import at bottom to avoid circular issues
