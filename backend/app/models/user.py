from __future__ import annotations
from pydantic import BaseModel
from typing import Literal, Optional
from datetime import datetime

Language    = Literal["english", "hindi", "gujarati", "hinglish", "marathi", "punjabi", "tamil"]
Tone        = Literal["funny", "professional", "emotional", "motivational", "casual", "promotional"]
Platform    = Literal["instagram", "facebook", "youtube", "linkedin", "threads", "pinterest"]
EmojiUsage  = Literal["low", "medium", "high"]


class UserProfile(BaseModel):
    id: str
    display_name: Optional[str] = None
    preferred_language: Language = "english"
    preferred_tone: Tone = "casual"
    preferred_platforms: list[Platform] = []
    emoji_usage: EmojiUsage = "medium"
    avg_caption_length: int = 100
    hashtag_count: int = 6
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class UpdatePreferencesRequest(BaseModel):
    display_name: Optional[str] = None
    preferred_language: Optional[Language] = None
    preferred_tone: Optional[Tone] = None
    preferred_platforms: Optional[list[Platform]] = None
    emoji_usage: Optional[EmojiUsage] = None
    avg_caption_length: Optional[int] = None
    hashtag_count: Optional[int] = None


class UserMLProfile(BaseModel):
    predicted_tone: Tone = "casual"
    predicted_language: Language = "english"
    predicted_emoji_level: EmojiUsage = "medium"
    training_data_points: int = 0
    last_updated: Optional[datetime] = None
