# SocialCraft AI

Multilingual social media caption generator with self-learning personalization.

## Stack

| Layer    | Tech |
|----------|------|
| Frontend | Next.js 14 · TypeScript · Tailwind CSS · shadcn/ui · Zustand · React Query |
| Backend  | FastAPI · Pydantic v2 · Uvicorn · Anthropic SDK |
| Database | Supabase (PostgreSQL + pgvector) |
| Auth     | Supabase Auth (Google OAuth + Email) |
| ML       | scikit-learn · sentence-transformers · pandas |
| Hosting  | Vercel (frontend) · Railway (backend) · Supabase (DB) |

## Supported Languages

English · Hindi · Gujarati · Hinglish · Marathi · Punjabi · Tamil

## Supported Tones

Funny · Professional · Emotional · Motivational · Casual · Promotional

## Supported Platforms

Instagram · Facebook · YouTube · LinkedIn · Threads · Pinterest (soon)

---

## Quick Start

### 1. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run `schema.sql` in the Supabase SQL Editor
3. Enable Google OAuth in Authentication → Providers

### 2. Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env        # fill in SUPABASE_URL, SUPABASE_SERVICE_KEY, ANTHROPIC_API_KEY
uvicorn app.main:app --reload --port 8000
```

Swagger docs: http://localhost:8000/docs

### 3. Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local   # fill in Supabase keys
npm run dev
```

Open http://localhost:3000

---

## Project Structure

```
socialcraft/
├── frontend/               # Next.js 14 App Router
│   ├── app/
│   │   ├── (auth)/         # Login, Signup pages
│   │   └── (dashboard)/    # Generator, History, Scheduler, Settings
│   ├── components/
│   │   ├── caption/        # CaptionGenerator, CaptionCard, FeedbackButtons, LanguageSelector
│   │   ├── layout/         # Navbar, Sidebar
│   │   └── shared/         # PlatformSelector, ToneSelector
│   ├── hooks/              # useCaption, useAuth, useUserPreferences
│   ├── store/              # Zustand: captionStore, userStore
│   ├── lib/                # Axios instance, Supabase client, utils
│   ├── types/              # Shared TypeScript types
│   └── constants/          # Languages, tones, platforms
│
├── backend/                # FastAPI
│   └── app/
│       ├── routers/        # captions, users, publish, feedback, ml
│       ├── services/       # ClaudeService, PersonalizationService, EmbeddingService
│       ├── models/         # Pydantic models (caption, user, feedback)
│       ├── ml/             # predictor, trainer, feature_extractor
│       └── utils/          # JWT auth dependency
│
├── schema.sql              # Supabase database schema + RLS policies
└── README.md
```

---

## Phase 1 (MVP — Complete)

- [x] Full folder structure
- [x] Supabase auth (Google + email)
- [x] Caption generator UI
- [x] FastAPI + Claude integration
- [x] Save captions to Supabase
- [x] Feedback buttons (👍 👎 ✏️)
- [x] Caption history page
- [x] Rule-based personalization (frequency counting)

## Phase 2 (Planned)

- [ ] Social media publishing APIs (Instagram, LinkedIn, Facebook)
- [ ] sklearn ML model training from user behaviour
- [ ] pgvector semantic caption similarity
- [ ] Post scheduler with cron execution
- [ ] Analytics dashboard

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/captions/generate` | Generate captions |
| GET  | `/api/captions/history` | Fetch caption history |
| POST | `/api/captions/feedback` | Submit feedback event |
| GET  | `/api/users/profile` | Get user profile |
| PUT  | `/api/users/preferences` | Update preferences |
| POST | `/api/publish/schedule` | Schedule a post |
| GET  | `/api/publish/scheduled` | List scheduled posts |
| GET  | `/api/ml/profile` | Get ML personalization insights |
| POST | `/api/ml/retrain` | Trigger model retraining |

All requests require `Authorization: Bearer <supabase_jwt>` header.

All responses follow `{ success: bool, data: any, error?: string }`.
