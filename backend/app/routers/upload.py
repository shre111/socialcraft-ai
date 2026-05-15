from __future__ import annotations
import logging
import traceback
import uuid
import mimetypes
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from app.database import get_supabase
from app.utils.auth import get_current_user_id

log = logging.getLogger(__name__)

router = APIRouter()

BUCKET = "post-images"
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_BYTES = 10 * 1024 * 1024  # 10 MB


@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPEG, PNG, WebP, and GIF images are allowed.",
        )

    data = await file.read(MAX_BYTES + 1)
    if len(data) > MAX_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image must be under 10 MB.",
        )

    ext = mimetypes.guess_extension(file.content_type) or ".jpg"
    if ext == ".jpe":
        ext = ".jpg"
    filename = f"{user_id}/{uuid.uuid4()}{ext}"

    db = get_supabase()
    try:
        db.storage.from_(BUCKET).upload(
            path=filename,
            file=data,
            file_options={"content-type": file.content_type},
        )
    except Exception:
        log.error("Supabase storage upload failed:\n%s", traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Image storage failed. Make sure the 'post-images' bucket exists in Supabase.",
        )

    url = db.storage.from_(BUCKET).get_public_url(filename)
    return {"success": True, "data": {"url": url}}
