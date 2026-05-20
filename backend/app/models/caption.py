from __future__ import annotations
from pydantic import BaseModel, Field, model_validator
from typing import Literal, Optional
from datetime import datetime
import uuid

Language = Literal["english", "hindi", "gujarati", "hinglish", "marathi", "punjabi", "tamil"]
Tone     = Literal["funny", "professional", "emotional", "motivational", "casual", "promotional"]
Platform = Literal["instagram", "facebook", "youtube", "linkedin", "threads", "pinterest"]


class GenerateCaptionRequest(BaseModel):
    topic: Optional[str] = Field(default=None, max_length=500)
    image_base64: Optional[str] = None
    image_media_type: Optional[str] = Field(default=None, pattern=r"^image/(jpeg|png|gif|webp)$")
    language: Language
    tone: Tone
    platform: Platform
    count: int = Field(default=3, ge=1, le=5)

    @model_validator(mode="after")
    def topic_or_image_required(self) -> GenerateCaptionRequest:
        if not self.topic and not self.image_base64:
            raise ValueError("Provide either a topic or an image.")
        return self


class CaptionItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    topic: str
    generated_text: str
    language: Language
    tone: Tone
    platform: Platform
    hashtags: list[str] = []
    was_used: bool = False
    was_liked: bool = False
    was_edited: bool = False
    original_text: Optional[str] = None
    final_text: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class GenerateCaptionResponse(BaseModel):
    captions: list[CaptionItem]
    personalization_used: bool = False
    confidence_score: float = 0.0


class CaptionHistoryResponse(BaseModel):
    captions: list[CaptionItem]
    total: int
