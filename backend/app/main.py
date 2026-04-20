from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import captions, users, publish, feedback, ml


@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"\n  SocialCraft AI backend ready")
    print(f"  Supabase : {settings.supabase_url}")
    print(f"  Claude   : {'configured' if settings.anthropic_api_key else 'MISSING'}")
    print(f"  CORS     : {settings.frontend_url}\n")
    yield


app = FastAPI(
    title="SocialCraft AI API",
    version="1.0.0",
    description="Multilingual social media caption generator with AI personalization",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(captions.router, prefix="/api/captions", tags=["captions"])
app.include_router(users.router,    prefix="/api/users",    tags=["users"])
app.include_router(publish.router,  prefix="/api/publish",  tags=["publish"])
app.include_router(feedback.router, prefix="/api/captions", tags=["feedback"])
app.include_router(ml.router,       prefix="/api/ml",       tags=["ml"])


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "SocialCraft AI"}
