from __future__ import annotations
import logging
import traceback
from collections import Counter
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from app.database import get_supabase
from app.utils.auth import get_current_user_id

router = APIRouter()
log = logging.getLogger(__name__)


@router.get("/summary", response_model=dict)
async def get_analytics_summary(user_id: str = Depends(get_current_user_id)):
    try:
        db = get_supabase()

        captions = (
            db.table("captions").select("*").eq("user_id", user_id).execute()
        ).data or []

        events = (
            db.table("user_events").select("*").eq("user_id", user_id).execute()
        ).data or []

        scheduled = (
            db.table("scheduled_posts").select("*").eq("user_id", user_id).execute()
        ).data or []

        total_captions = len(captions)
        total_liked = sum(1 for c in captions if c.get("was_liked"))
        total_used = sum(1 for c in captions if c.get("was_used"))
        total_edited = sum(1 for c in captions if c.get("was_edited"))
        total_published = sum(1 for s in scheduled if s.get("status") == "published")

        # Events by type
        event_counts = Counter(e["event_type"] for e in events)

        # Captions per day (last 14 days)
        now = datetime.utcnow()
        days_map: dict[str, int] = {}
        for i in range(13, -1, -1):
            d = (now - timedelta(days=i)).strftime("%b %d")
            days_map[d] = 0
        for c in captions:
            try:
                d = datetime.fromisoformat(c["created_at"].replace("Z", "+00:00"))
                key = d.strftime("%b %d")
                if key in days_map:
                    days_map[key] += 1
            except Exception:
                pass
        captions_per_day = [{"date": k, "count": v} for k, v in days_map.items()]

        # Top platforms
        platform_counts = Counter(c["platform"] for c in captions)
        top_platforms = [{"platform": k, "count": v} for k, v in platform_counts.most_common(6)]

        # Top tones
        tone_counts = Counter(c["tone"] for c in captions)
        top_tones = [{"tone": k, "count": v} for k, v in tone_counts.most_common(6)]

        # Top languages
        lang_counts = Counter(c["language"] for c in captions)
        top_languages = [{"language": k, "count": v} for k, v in lang_counts.most_common(7)]

        # Liked vs not liked per platform
        liked_by_platform: dict[str, dict] = {}
        for c in captions:
            p = c["platform"]
            if p not in liked_by_platform:
                liked_by_platform[p] = {"platform": p, "liked": 0, "total": 0}
            liked_by_platform[p]["total"] += 1
            if c.get("was_liked"):
                liked_by_platform[p]["liked"] += 1
        engagement_by_platform = list(liked_by_platform.values())

        return {
            "success": True,
            "data": {
                "totals": {
                    "captions": total_captions,
                    "liked": total_liked,
                    "used": total_used,
                    "edited": total_edited,
                    "published": total_published,
                    "events": len(events),
                },
                "event_counts": dict(event_counts),
                "captions_per_day": captions_per_day,
                "top_platforms": top_platforms,
                "top_tones": top_tones,
                "top_languages": top_languages,
                "engagement_by_platform": engagement_by_platform,
            },
        }
    except Exception:
        log.error("Analytics failed:\n%s", traceback.format_exc())
        raise HTTPException(status_code=500, detail="Analytics query failed")
