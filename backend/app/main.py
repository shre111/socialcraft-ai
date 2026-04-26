from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.config import settings
from app.routers import captions, users, publish, feedback, ml, linkedin, analytics
from app.services.scheduler_service import run_scheduler

scheduler = AsyncIOScheduler()


@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler.add_job(run_scheduler, "interval", minutes=1, id="post_scheduler")
    scheduler.start()
    print(f"\n  SocialCraft AI backend ready")
    print(f"  Supabase : {settings.supabase_url}")
    print(f"  Claude   : {'configured' if settings.anthropic_api_key else 'MISSING'}")
    print(f"  LinkedIn : {'configured' if settings.linkedin_client_id else 'not set'}")
    print(f"  Scheduler: running (every 1 min)")
    print(f"  CORS     : {settings.frontend_url}\n")
    yield
    scheduler.shutdown()


app = FastAPI(
    title="SocialCraft AI API",
    version="2.0.0",
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

app.include_router(captions.router,  prefix="/api/captions",  tags=["captions"])
app.include_router(users.router,     prefix="/api/users",     tags=["users"])
app.include_router(publish.router,   prefix="/api/publish",   tags=["publish"])
app.include_router(feedback.router,  prefix="/api/captions",  tags=["feedback"])
app.include_router(ml.router,        prefix="/api/ml",        tags=["ml"])
app.include_router(linkedin.router,  prefix="/api/linkedin",  tags=["linkedin"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "SocialCraft AI", "version": "2.0.0"}
