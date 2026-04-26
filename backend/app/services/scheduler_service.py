from __future__ import annotations
import logging
from datetime import datetime, timezone
from app.database import get_supabase
from app.services import linkedin_service

log = logging.getLogger(__name__)


async def run_scheduler() -> dict:
    """Check scheduled_posts for due pending posts and publish them."""
    db = get_supabase()
    now = datetime.now(timezone.utc).isoformat()

    pending = (
        db.table("scheduled_posts")
        .select("*, captions(generated_text, final_text, hashtags)")
        .eq("status", "pending")
        .lte("scheduled_at", now)
        .execute()
    ).data or []

    published, failed = 0, 0

    for post in pending:
        try:
            platform = post["platform"]
            user_id = post["user_id"]
            caption_data = post.get("captions") or {}
            text = caption_data.get("final_text") or caption_data.get("generated_text", "")
            hashtags = caption_data.get("hashtags") or []
            if hashtags:
                text += "\n\n" + " ".join(h if h.startswith("#") else f"#{h}" for h in hashtags)

            post_id = None
            if platform == "linkedin":
                token_row = (
                    db.table("oauth_tokens")
                    .select("access_token, platform_user_id")
                    .eq("user_id", user_id)
                    .eq("platform", "linkedin")
                    .execute()
                ).data
                if token_row:
                    result = await linkedin_service.publish_text_post(
                        access_token=token_row[0]["access_token"],
                        person_urn=token_row[0]["platform_user_id"],
                        text=text,
                    )
                    post_id = result.get("id")

            db.table("scheduled_posts").update({
                "status": "published",
                "platform_post_id": post_id,
            }).eq("id", post["id"]).execute()

            db.table("user_events").insert({
                "user_id": user_id,
                "event_type": "published",
                "caption_id": post["caption_id"],
                "metadata": {"platform": platform, "scheduled": True},
            }).execute()

            published += 1
            log.info("Scheduled post %s published to %s", post["id"], platform)

        except Exception:
            log.exception("Failed to publish scheduled post %s", post["id"])
            db.table("scheduled_posts").update({"status": "failed"}).eq("id", post["id"]).execute()
            failed += 1

    return {"checked": len(pending), "published": published, "failed": failed}
