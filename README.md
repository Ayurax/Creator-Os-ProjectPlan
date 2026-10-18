# CreatorOS AI — Project Starter Plan

This folder is the working blueprint for the SEML mini-project.

## Goal
Build a web prototype for CreatorOS AI: a creator–brand collaboration platform with role-based workflows and practical AI-assisted features.

## Recommended stack
- Frontend: React + Vite + TypeScript
- UI: Tailwind CSS + shadcn/ui (or equivalent)
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL + Prisma
- Authentication: JWT + bcrypt
- AI: provider API through a server-side service adapter; keep a mock mode for demos
- Testing: Vitest/Jest + Supertest + Playwright
- DevOps: Docker + GitHub Actions
- UML: StarUML
- Version control: Git + GitHub

## Build order
1. Project scaffold
2. Database schema
3. Authentication/RBAC
4. Creator and Brand profiles
5. Campaigns
6. Creator discovery
7. Collaboration requests
8. Contract flow
9. Tasks/deliverables
10. AI features
11. Analytics/content calendar
12. Notifications/messages
13. Testing
14. Docker/deployment pipeline
15. SEML documentation and demo preparation

## Scope control
Do not build a real payment gateway. Model payment records/status only.
Do not build a social-media scraping system. Use seeded/demo creator data.
Do not make AI autonomous. AI should provide suggestions that users can review and accept.

## Deployment

The local backend continues to use SQLite through `backend/prisma/schema.prisma` and
`DATABASE_URL="file:./dev.db"`. Production uses the separate
`backend/prisma/schema.postgresql.prisma` and Neon PostgreSQL.

### Vercel

- Root directory: `frontend`
- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_URL=https://<render-service>.onrender.com/api`

`frontend/vercel.json` keeps React Router routes working on refresh.

### Render

- Blueprint: `render.yaml`, or configure the service with root directory `backend`
- Build command: `npm ci && npm run build:render`
- Start command: `npm start`
- Pre-deploy command: `npm run prisma:initialize:postgres`
- Health check path: `/api/health`

Set `DATABASE_URL` to the Neon pooled connection string with
`?sslmode=require`, plus `JWT_SECRET`, `FRONTEND_URL` (the Vercel origin),
`CORS_ORIGINS` (the same origin, or comma-separated allowed origins), and the
optional server-side Groq variables. Never put database or JWT secrets in Vercel.
