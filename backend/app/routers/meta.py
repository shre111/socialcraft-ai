from __future__ import annotations
import logging
import secrets
import traceback
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from app.config import settings
from app.database import get_supabase
from app.utils.auth import get_current_user_id
from app.services import meta_service

router = APIRouter()
log = logging.getLogger(__name__)

REDIRECT_URI = "http://localhost:8000/api/meta/callback"


@router.get("/connect")
async def meta_connect(user_id: str = Depends(get_current_user_id)):
    state = f"{user_id}.{secrets.token_urlsafe(8)}"
    url = meta_service.get_authorization_url(REDIRECT_URI, state)
    return {"success": True, "data": {"url": url}}


@router.get("/callback")
async def meta_callback(
    code: str = Query(...),
    state: str = Query(...),
    error: str = Query(default=None),
):
    if error:
        return RedirectResponse(
            url=f"{settings.frontend_url}/dashboard/settings?meta=error&reason={error}"
        )
    try:
        user_id = state.split(".")[0] if "." in state else None
        if not user_id:
            return RedirectResponse(
                url=f"{settings.frontend_url}/dashboard/settings?meta=error&reason=invalid_state"
            )

        short = await meta_service.exchange_code_for_token(code, REDIRECT_URI)
        long = await meta_service.get_long_lived_token(short["access_token"])
        user_token = long["access_token"]
        expires_at = meta_service.token_expires_at(long.get("expires_in", 5184000))

        pages = await meta_service.get_user_pages(user_token)
        if not pages:
            return RedirectResponse(
                url=f"{settings.frontend_url}/dashboard/settings?meta=error&reason=no_pages"
            )

        page = pages[0]
        page_id = page["id"]
        page_name = page["name"]
        page_token = page["access_token"]  # page tokens don't expire

        db = get_supabase()
        db.table("oauth_tokens").upsert(
            {
                "user_id": user_id,
                "platform": "facebook",
                "access_token": page_token,
                "expires_at": expires_at,
                "platform_user_id": page_id,
                "platform_username": page_name,
            },
            on_conflict="user_id,platform",
        ).execute()

        ig = await meta_service.get_instagram_account(page_id, page_token)
        if ig:
            db.table("oauth_tokens").upsert(
                {
                    "user_id": user_id,
                    "platform": "instagram",
                    "access_token": page_token,
                    "expires_at": expires_at,
                    "platform_user_id": ig["id"],
                    "platform_username": ig.get("username", ""),
                },
                on_conflict="user_id,platform",
            ).execute()

        return RedirectResponse(
            url=f"{settings.frontend_url}/dashboard/settings?meta=connected"
        )
    except Exception:
        log.error("Meta callback failed:\n%s", traceback.format_exc())
        return RedirectResponse(
            url=f"{settings.frontend_url}/dashboard/settings?meta=error&reason=token_exchange_failed"
        )


@router.get("/status")
async def meta_status(user_id: str = Depends(get_current_user_id)):
    db = get_supabase()
    result = (
        db.table("oauth_tokens")
        .select("platform, platform_username")
        .eq("user_id", user_id)
        .in_("platform", ["facebook", "instagram"])
        .execute()
    )
    rows = {r["platform"]: r for r in (result.data or [])}
    return {
        "success": True,
        "data": {
            "facebook": {
                "connected": "facebook" in rows,
                "username": rows.get("facebook", {}).get("platform_username"),
            },
            "instagram": {
                "connected": "instagram" in rows,
                "username": rows.get("instagram", {}).get("platform_username"),
            },
        },
    }


@router.delete("/disconnect")
async def meta_disconnect(user_id: str = Depends(get_current_user_id)):
    db = get_supabase()
    db.table("oauth_tokens").delete().eq("user_id", user_id).in_(
        "platform", ["facebook", "instagram"]
    ).execute()
    return {"success": True}


class FacebookPublishRequest(BaseModel):
    caption_id: str
    text: str
    image_url: str | None = None


class InstagramPublishRequest(BaseModel):
    caption_id: str
    text: str
    image_url: str


@router.post("/publish/facebook")
async def publish_facebook(
    req: FacebookPublishRequest,
    user_id: str = Depends(get_current_user_id),
):
    db = get_supabase()
    row = (
        db.table("oauth_tokens")
        .select("access_token, platform_user_id")
        .eq("user_id", user_id)
        .eq("platform", "facebook")
        .execute()
    ).data
    if not row:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Facebook not connected.")
    caption_check = (
        db.table("captions")
        .select("id")
        .eq("id", req.caption_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not caption_check.data:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Caption not found.")
    try:
        if req.image_url:
            result = await meta_service.publish_facebook_photo(
                page_id=row[0]["platform_user_id"],
                page_access_token=row[0]["access_token"],
                image_url=req.image_url,
                caption=req.text,
            )
        else:
            result = await meta_service.publish_facebook_post(
                page_id=row[0]["platform_user_id"],
                page_access_token=row[0]["access_token"],
                text=req.text,
            )
        db.table("captions").update({"was_used": True}).eq("id", req.caption_id).execute()
        db.table("user_events").insert({
            "user_id": user_id,
            "event_type": "published",
            "caption_id": req.caption_id,
            "metadata": {"platform": "facebook"},
        }).execute()
        return {"success": True, "data": {"post_id": result.get("id", "")}}
    except Exception as exc:
        log.error("Facebook publish failed:\n%s", traceback.format_exc())
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Facebook publish failed: {exc}")


@router.post("/publish/instagram")
async def publish_instagram(
    req: InstagramPublishRequest,
    user_id: str = Depends(get_current_user_id),
):
    db = get_supabase()
    row = (
        db.table("oauth_tokens")
        .select("access_token, platform_user_id")
        .eq("user_id", user_id)
        .eq("platform", "instagram")
        .execute()
    ).data
    if not row:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Instagram not connected.")
    try:
        result = await meta_service.publish_instagram_post(
            ig_user_id=row[0]["platform_user_id"],
            page_access_token=row[0]["access_token"],
            image_url=req.image_url,
            caption=req.text,
        )
        db.table("captions").update({"was_used": True}).eq("id", req.caption_id).execute()
        db.table("user_events").insert({
            "user_id": user_id,
            "event_type": "published",
            "caption_id": req.caption_id,
            "metadata": {"platform": "instagram"},
        }).execute()
        return {"success": True, "data": {"post_id": result.get("id", "")}}
    except Exception as exc:
        log.error("Instagram publish failed:\n%s", traceback.format_exc())
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Instagram publish failed: {exc}")
