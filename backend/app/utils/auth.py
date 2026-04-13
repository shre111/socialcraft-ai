from __future__ import annotations
from fastapi import Header, HTTPException, status
from app.database import get_supabase


async def get_current_user_id(authorization: str = Header(...)) -> str:
    """
    Validate Supabase JWT from Authorization: Bearer <token> header.
    Returns the user's UUID.
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format",
        )
    token = authorization.removeprefix("Bearer ").strip()
    db = get_supabase()
    try:
        user_response = db.auth.get_user(token)
        user = user_response.user
        if user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        return user.id
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
