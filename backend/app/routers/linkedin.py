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
from app.services import linkedin_service

router = APIRouter()
log = logging.getLogger(__name__)

REDIRECT_URI = "http://localhost:8000/api/linkedin/callback"


@router.get("/connect")
async def linkedin_connect(user_id: str = Depends(get_current_user_id)):
    """Return the LinkedIn OAuth authorization URL."""
    state = secrets.token_urlsafe(16)
    url = linkedin_service.get_authorization_url(REDIRECT_URI, state)
    return {"success": True, "data": {"url": url}}


@router.get("/callback")
async def linkedin_callback(
    code: str = Query(...),
    state: str = Query(...),
    error: str = Query(default=None),
):
    """LinkedIn redirects here with the auth code. Exchange for token and redirect to frontend."""
    if error:
        return RedirectResponse(
            url=f"{settings.frontend_url}/dashboard/settings?linkedin=error&reason={error}"
        )
    try:
        token_data = await linkedin_service.exchange_code_for_token(code, REDIRECT_URI)
        access_token = token_data["access_token"]
        expires_in = token_data.get("expires_in", 5183944)

        profile = await linkedin_service.get_linkedin_profile(access_token)
        person_urn = profile.get("sub")
        username = profile.get("name", "")

        db = get_supabase()
        db.table("oauth_tokens").upsert(
            {
                "platform": "linkedin",
                "access_token": access_token,
                "expires_at": linkedin_service.token_expires_at(expires_in),
                "platform_user_id": person_urn,
                "platform_username": username,
            },
            on_conflict="user_id,platform",
        ).execute()

        return RedirectResponse(
            url=f"{settings.frontend_url}/dashboard/settings?linkedin=connected"
        )
    except Exception:
        log.error("LinkedIn callback failed:\n%s", traceback.format_exc())
        return RedirectResponse(
            url=f"{settings.frontend_url}/dashboard/settings?linkedin=error&reason=token_exchange_failed"
        )


@router.get("/status")
async def linkedin_status(user_id: str = Depends(get_current_user_id)):
    """Check if the current user has a connected LinkedIn account."""
    db = get_supabase()
    result = (
        db.table("oauth_tokens")
        .select("platform_username, expires_at")
        .eq("user_id", user_id)
        .eq("platform", "linkedin")
        .execute()
    )
    if result.data:
        row = result.data[0]
        return {
            "success": True,
            "data": {
                "connected": True,
                "username": row["platform_username"],
                "expires_at": row["expires_at"],
            },
        }
    return {"success": True, "data": {"connected": False}}


@router.delete("/disconnect")
async def linkedin_disconnect(user_id: str = Depends(get_current_user_id)):
    """Remove stored LinkedIn token."""
    db = get_supabase()
    db.table("oauth_tokens").delete().eq("user_id", user_id).eq("platform", "linkedin").execute()
    return {"success": True, "data": {"connected": False}}


class PublishRequest(BaseModel):
    caption_id: str
    text: str


@router.post("/publish")
async def linkedin_publish(
    req: PublishRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Publish a caption to LinkedIn as a text post."""
    db = get_supabase()

    token_row = (
        db.table("oauth_tokens")
        .select("access_token, platform_user_id")
        .eq("user_id", user_id)
        .eq("platform", "linkedin")
        .execute()
    )
    if not token_row.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="LinkedIn account not connected. Please connect first.",
        )

    row = token_row.data[0]
    try:
        result = await linkedin_service.publish_text_post(
            access_token=row["access_token"],
            person_urn=row["platform_user_id"],
            text=req.text,
        )

        db.table("captions").update({"was_used": True}).eq("id", req.caption_id).execute()
        db.table("user_events").insert({
            "user_id": user_id,
            "event_type": "published",
            "caption_id": req.caption_id,
            "metadata": {"platform": "linkedin"},
        }).execute()

        return {"success": True, "data": {"post_id": result.get("id", "")}}
    except Exception as exc:
        log.error("LinkedIn publish failed:\n%s", traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"LinkedIn publish failed: {exc}",
        )
