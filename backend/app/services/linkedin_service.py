from __future__ import annotations
import httpx
from datetime import datetime, timedelta
from app.config import settings

LINKEDIN_AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization"
LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken"
LINKEDIN_API_BASE = "https://api.linkedin.com/v2"
SCOPES = "openid profile email w_member_social"


def get_authorization_url(redirect_uri: str, state: str) -> str:
    params = (
        f"response_type=code"
        f"&client_id={settings.linkedin_client_id}"
        f"&redirect_uri={redirect_uri}"
        f"&state={state}"
        f"&scope={SCOPES.replace(' ', '%20')}"
    )
    return f"{LINKEDIN_AUTH_URL}?{params}"


async def exchange_code_for_token(code: str, redirect_uri: str) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            LINKEDIN_TOKEN_URL,
            data={
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": redirect_uri,
                "client_id": settings.linkedin_client_id,
                "client_secret": settings.linkedin_client_secret,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        resp.raise_for_status()
        return resp.json()


async def get_linkedin_profile(access_token: str) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{LINKEDIN_API_BASE}/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        resp.raise_for_status()
        return resp.json()


async def publish_text_post(access_token: str, person_urn: str, text: str) -> dict:
    payload = {
        "author": f"urn:li:person:{person_urn}",
        "lifecycleState": "PUBLISHED",
        "specificContent": {
            "com.linkedin.ugc.ShareContent": {
                "shareCommentary": {"text": text},
                "shareMediaCategory": "NONE",
            }
        },
        "visibility": {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
        },
    }
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{LINKEDIN_API_BASE}/ugcPosts",
            json=payload,
            headers={
                "Authorization": f"Bearer {access_token}",
                "X-Restli-Protocol-Version": "2.0.0",
                "Content-Type": "application/json",
            },
        )
        resp.raise_for_status()
        return resp.json()


def token_expires_at(expires_in: int) -> str:
    return (datetime.utcnow() + timedelta(seconds=expires_in)).isoformat()
