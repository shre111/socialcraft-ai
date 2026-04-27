from __future__ import annotations
import logging
import uuid
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

    linkedin_user_ids = list({p["user_id"] for p in pending if p["platform"] == "linkedin"})
    tokens_by_user: dict[str, dict] = {}
    if linkedin_user_ids:
        token_rows = (
            db.table("oauth_tokens")
            .select("user_id, access_token, platform_user_id")
            .in_("user_id", linkedin_user_ids)
            .eq("platform", "linkedin")
            .execute()
        ).data or []
        tokens_by_user = {row["user_id"]: row for row in token_rows}

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
                token_row = tokens_by_user.get(user_id)
                if token_row:
                    result = await linkedin_service.publish_text_post(
                        access_token=token_row["access_token"],
                        person_urn=token_row["platform_user_id"],
                        text=text,
                    )
                    post_id = result.get("id")

            db.table("scheduled_posts").update({
                "status": "published",
                "platform_post_id": post_id,
            }).eq("id", post["id"]).execute()

            db.table("user_events").insert({
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "event_type": "published",
                "caption_id": post["caption_id"],
                "metadata": {"platform": platform, "scheduled": True},
                "created_at": datetime.now(timezone.utc).isoformat(),
            }).execute()

            published += 1
            log.info("Scheduled post %s published to %s", post["id"], platform)

        except Exception:
            log.exception("Failed to publish scheduled post %s", post["id"])
            db.table("scheduled_posts").update({"status": "failed"}).eq("id", post["id"]).execute()
            failed += 1

    return {"checked": len(pending), "published": published, "failed": failed}
