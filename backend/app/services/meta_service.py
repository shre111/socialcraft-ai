from __future__ import annotations
import httpx
from datetime import datetime, timedelta, timezone
from app.config import settings

META_GRAPH_URL = "https://graph.facebook.com/v21.0"
META_AUTH_URL = "https://www.facebook.com/v21.0/dialog/oauth"
SCOPES = "pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish,pages_show_list"


def get_authorization_url(redirect_uri: str, state: str) -> str:
    return (
        f"{META_AUTH_URL}"
        f"?client_id={settings.meta_app_id}"
        f"&redirect_uri={redirect_uri}"
        f"&scope={SCOPES}"
        f"&state={state}"
        f"&response_type=code"
    )


async def exchange_code_for_token(code: str, redirect_uri: str) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{META_GRAPH_URL}/oauth/access_token",
            params={
                "client_id": settings.meta_app_id,
                "client_secret": settings.meta_app_secret,
                "redirect_uri": redirect_uri,
                "code": code,
            },
        )
        resp.raise_for_status()
        return resp.json()


async def get_long_lived_token(short_lived_token: str) -> dict:
    """Exchange a short-lived user token for a 60-day long-lived token."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{META_GRAPH_URL}/oauth/access_token",
            params={
                "grant_type": "fb_exchange_token",
                "client_id": settings.meta_app_id,
                "client_secret": settings.meta_app_secret,
                "fb_exchange_token": short_lived_token,
            },
        )
        resp.raise_for_status()
        return resp.json()


async def get_user_pages(user_access_token: str) -> list[dict]:
    """Return pages the user manages, each with its non-expiring page access token."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{META_GRAPH_URL}/me/accounts",
            params={"fields": "id,name,access_token", "access_token": user_access_token},
        )
        resp.raise_for_status()
        return resp.json().get("data", [])


async def get_instagram_account(page_id: str, page_access_token: str) -> dict | None:
    """Return the Instagram Business Account linked to a Facebook Page, or None."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{META_GRAPH_URL}/{page_id}",
            params={
                "fields": "instagram_business_account{id,username}",
                "access_token": page_access_token,
            },
        )
        resp.raise_for_status()
        return resp.json().get("instagram_business_account")


async def publish_facebook_photo(
    page_id: str, page_access_token: str, image_url: str, caption: str
) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{META_GRAPH_URL}/{page_id}/photos",
            data={"url": image_url, "caption": caption, "access_token": page_access_token},
        )
        resp.raise_for_status()
        return resp.json()


async def publish_facebook_post(page_id: str, page_access_token: str, text: str) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{META_GRAPH_URL}/{page_id}/feed",
            data={"message": text, "access_token": page_access_token},
        )
        resp.raise_for_status()
        return resp.json()


async def publish_instagram_post(
    ig_user_id: str, page_access_token: str, image_url: str, caption: str
) -> dict:
    """Two-step Instagram publish: create media container then publish it."""
    async with httpx.AsyncClient() as client:
        container = await client.post(
            f"{META_GRAPH_URL}/{ig_user_id}/media",
            data={"image_url": image_url, "caption": caption, "access_token": page_access_token},
        )
        container.raise_for_status()
        container_id = container.json().get("id")
        if not container_id:
            raise ValueError(f"Instagram container creation returned no id: {container.text}")

        publish = await client.post(
            f"{META_GRAPH_URL}/{ig_user_id}/media_publish",
            data={"creation_id": container_id, "access_token": page_access_token},
        )
        publish.raise_for_status()
        return publish.json()


def token_expires_at(expires_in: int) -> str:
    return (datetime.now(timezone.utc) + timedelta(seconds=expires_in)).isoformat()
