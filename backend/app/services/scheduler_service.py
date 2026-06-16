from __future__ import annotations
import logging
import uuid
from datetime import datetime, timezone
from app.database import get_supabase
from app.services import linkedin_service, meta_service

log = logging.getLogger(__name__)

_PLATFORMS = ("linkedin", "facebook", "instagram")


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

    # Batch-fetch OAuth tokens for every platform that has pending posts
    tokens: dict[str, dict[str, dict]] = {p: {} for p in _PLATFORMS}
    for platform in _PLATFORMS:
        user_ids = list({p["user_id"] for p in pending if p["platform"] == platform})
        if user_ids:
            rows = (
                db.table("oauth_tokens")
                .select("user_id, access_token, platform_user_id")
                .in_("user_id", user_ids)
                .eq("platform", platform)
                .execute()
            ).data or []
            tokens[platform] = {row["user_id"]: row for row in rows}

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

            token_row = tokens.get(platform, {}).get(user_id)

            if not token_row:
                log.warning("Skipping post %s — no token for %s", post["id"], platform)
                db.table("scheduled_posts").update({"status": "failed"}).eq("id", post["id"]).execute()
                failed += 1
                continue

            post_id = None

            if platform == "linkedin":
                result = await linkedin_service.publish_text_post(
                    access_token=token_row["access_token"],
                    person_urn=token_row["platform_user_id"],
                    text=text,
                )
                post_id = result.get("id")

            elif platform == "facebook":
                result = await meta_service.publish_facebook_post(
                    page_id=token_row["platform_user_id"],
                    page_access_token=token_row["access_token"],
                    text=text,
                )
                post_id = result.get("id")

            elif platform == "instagram":
                image_url = post.get("image_url")
                if not image_url:
                    log.warning("Skipping Instagram post %s — no image_url", post["id"])
                    db.table("scheduled_posts").update({"status": "failed"}).eq("id", post["id"]).execute()
                    failed += 1
                    continue
                result = await meta_service.publish_instagram_post(
                    ig_user_id=token_row["platform_user_id"],
                    page_access_token=token_row["access_token"],
                    image_url=image_url,
                    caption=text,
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
