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
