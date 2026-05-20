from __future__ import annotations
import json
import re
import anthropic
from app.config import settings


def build_system_prompt(user_profile: dict, similar_captions: list[str]) -> str:
    language       = user_profile.get("preferred_language", "english")
    tone           = user_profile.get("preferred_tone", "casual")
    emoji_usage    = user_profile.get("emoji_usage", "medium")
    avg_length     = user_profile.get("avg_caption_length", 100)
    hashtag_count  = user_profile.get("hashtag_count", 6)
    platforms      = ", ".join(user_profile.get("preferred_platforms", [])) or "general"

    examples_block = ""
    if similar_captions:
        examples_block = "\nCAPTIONS THIS USER LOVED (match this style):\n" + "\n".join(
            f"- {cap}" for cap in similar_captions[:3]
        )

    return f"""You are an expert multilingual social media copywriter.

USER STYLE PROFILE (learned from their behavior):
- Preferred language: {language}
- Preferred tone: {tone}
- Emoji usage: {emoji_usage}
- Caption length: ~{avg_length} words
- Hashtags: {hashtag_count} per post
- Platforms: {platforms}
{examples_block}

RULES:
1. Write ONLY in {language} — no language mixing unless hinglish is selected
2. Generate exactly the requested number of variations
3. Each caption must have {hashtag_count} relevant hashtags
4. Match the tone and emoji level exactly
5. Format response as valid JSON ONLY — no explanation, no markdown fences
6. Return schema: {{"captions": [{{"text": "", "hashtags": []}}]}}"""


class ClaudeService:
    def __init__(self) -> None:
        self._client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

    async def generate(
        self,
        topic: str,
        language: str,
        tone: str,
        platform: str,
        count: int,
        user_profile: dict,
        similar_captions: list[str],
        image_base64: str | None = None,
        image_media_type: str | None = None,
    ) -> list[dict]:
        effective_profile = {**user_profile, "preferred_language": language, "preferred_tone": tone}
        system = build_system_prompt(effective_profile, similar_captions)

        if topic:
            user_text = f"Generate {count} {tone} {language} captions for {platform} about: {topic}"
        else:
            user_text = f"Generate {count} {tone} {language} captions for {platform} based on this image."

        if image_base64 and image_media_type:
            content: list = [
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": image_media_type,
                        "data": image_base64,
                    },
                },
                {"type": "text", "text": user_text},
            ]
        else:
            content = user_text

        message = self._client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2048,
            system=system,
            messages=[{"role": "user", "content": content}],
        )

        raw = message.content[0].text.strip()
        raw = re.sub(r"^```(?:json)?\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)

        parsed = json.loads(raw)
        return parsed.get("captions", [])
