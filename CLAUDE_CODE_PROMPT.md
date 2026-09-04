# MASTER PROMPT FOR CLAUDE CODE

You are the lead full-stack engineer for my SEML mini-project, CreatorOS AI.

Read this entire file and PROJECT_PLAN.md before writing code. Do not start by generating a huge amount of code blindly. First inspect the repository and create a concise implementation checklist, then implement in small verified increments.

## PROJECT

CreatorOS AI is a role-based creator-brand collaboration and campaign management platform.

Roles:
- Brand
- Creator
- Freelancer
- Talent Manager

Core flow:
Brand authenticates -> creates campaign -> searches creators -> sends collaboration request -> Creator accepts/rejects -> if accepted, Contract is created -> tasks/deliverables are managed -> payment status is recorded -> campaign completes -> review can be submitted.

AI features:
- Creator/brand recommendations
- Sponsorship price estimation
- Sponsorship email generation
- Analytics summary
- Content plan generation

AI is assistive, not autonomous.

## REQUIRED STACK

Frontend:
- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui or equivalent accessible component library

Backend:
- Node.js
- Express
- TypeScript
- REST API

Database:
- PostgreSQL
- Prisma ORM

Auth:
- JWT or secure session approach
- bcrypt/argon2 password hashing
- role-based authorization

Testing:
- Vitest/Jest
- Supertest
- Playwright for important end-to-end flows

DevOps:
- Docker
- Docker Compose for local development
- GitHub Actions CI
- deployment-ready configuration

## ENGINEERING RULES

1. Use TypeScript strictly.
2. Keep frontend, backend and shared types clearly separated.
3. Use environment variables for secrets/config.
4. Never expose AI API keys in the browser.
5. Validate all external input.
6. Enforce authorization on the server, not only in the UI.
7. Use Prisma migrations; never manually mutate production schema.
8. Use service/repository separation where it improves testability.
9. Centralize error handling.
10. Add request logging in development.
11. Keep controllers thin; business logic belongs in services.
12. Avoid giant files.
13. Use reusable UI components.
14. Keep API responses predictable.
15. Add loading, empty, success and error states.
16. Do not add features outside the project scope without asking.
17. Do not build real payment processing; implement payment records/status only.
18. Do not scrape social media; use seeded/demo data.
19. AI outputs must be editable suggestions.
20. Provide a MOCK_AI=true mode so the project works without a paid AI API.

## DOMAIN MODEL

Implement these entities:

User
Creator
Brand
Freelancer
TalentManager
Campaign
CollaborationRequest
Contract
Task
Payment
Review
Portfolio
ContentCalendar
Analytics
Message
Notification
AIRecommendation

Maintain the conceptual relationships from the StarUML class diagram.

Important rules:
- Creator, Brand, Freelancer and TalentManager are roles extending User conceptually.
- A Brand creates campaigns.
- A campaign can have multiple collaboration requests.
- A collaboration request can be accepted or rejected.
- Contract creation is allowed only after acceptance.
- Rejection never creates a contract.
- Payment is later than contract/deliverables approval.
- Reviews are allowed after campaign completion.

## ARCHITECTURE

Use:

frontend/
backend/
prisma/
docs/
.github/workflows/

Recommended backend structure:

backend/src/
  config/
  controllers/
  middleware/
  routes/
  services/
  repositories/
  validators/
  types/
  utils/
  app.ts
  server.ts

Recommended frontend structure:

frontend/src/
  components/
  pages/
  layouts/
  hooks/
  services/
  types/
  lib/
  App.tsx

## DESIGN PATTERNS

Implement and document patterns only where useful:

1. Strategy Pattern
   - Different recommendation strategies can rank creators by engagement, niche match, budget fit, etc.

2. Factory Pattern
   - AI provider/service factory can select MockAIService or real provider.

3. Repository Pattern
   - Database access isolated behind repositories.

4. Service Layer
   - CampaignService, CollaborationService, ContractService, AIService, etc.

5. Inheritance/polymorphism
   - Keep role-specific behavior behind clean abstractions; do not create unnecessary subclasses for Designer/Writer/Editor.

## DATABASE

Create Prisma schema with:
- UUID IDs
- timestamps
- appropriate indexes
- enums for statuses where useful
- foreign keys
- unique constraints where required
- cascading behavior only where safe

Create seed data:
- at least 2 brands
- at least 6 creators
- at least 3 freelancers
- at least 1 talent manager
- campaigns
- collaboration requests
- sample contracts/tasks
- analytics data
- notifications

Create demo accounts with clearly documented credentials for local development only.

## FRONTEND UX

Create a polished student-project-quality SaaS UI.

Use:
- responsive layout
- sidebar/dashboard navigation
- cards/tables/forms
- status badges
- modal/dialog for important actions
- toast notifications
- confirmation dialogs for destructive actions
- empty states
- loading skeletons where useful

Brand dashboard should make these obvious:
Campaigns, Discover Creators, Collaboration Requests, Contracts, Payments, AI Tools, Analytics.

Creator dashboard:
Campaigns, Requests, Contracts, Tasks, Portfolio, Content Calendar, Analytics, AI Tools.

## AI UI

Create an "AI Assistant" area with separate tools:

1. Find Creators
2. Sponsorship Price Estimator
3. Sponsorship Email Generator
4. Analytics Summary
5. Content Plan

For every AI result:
- show loading state
- show generated result
- allow edit/copy where appropriate
- explain that it is a suggestion
- handle API failures
- support mock mode

## API

Implement REST endpoints according to PROJECT_PLAN.md.

Protect private routes.

Use consistent error format, for example:
{
  "success": false,
  "message": "Human-readable message",
  "code": "SOME_CODE"
}

Use proper HTTP status codes.

## TESTING

At minimum implement tests for:
- registration/login
- role authorization
- campaign creation
- collaboration request
- accept request creates contract
- reject request does not create contract
- payment cannot be marked completed before required campaign stage
- review cannot be submitted before campaign completion
- one AI endpoint in mock mode

Add an end-to-end test for:
Brand login -> create campaign -> send collaboration -> Creator accepts -> contract appears.

## DEVOPS

Create:
- Dockerfile(s)
- docker-compose.yml for local app + PostgreSQL
- .env.example
- GitHub Actions workflow

CI should run:
1. install
2. typecheck
3. lint
4. unit/integration tests
5. build

Add:
GET /api/health

Deployment must be reproducible from a clean checkout.

## DOCUMENTATION

Create/update:
- README.md
- docs/ARCHITECTURE.md
- docs/API.md
- docs/DESIGN_PATTERNS.md
- docs/SETUP.md
- docs/DEMO.md

Document how the implementation maps to:
- SRS
- Use Case Diagram
- Class Diagram
- Sequence Diagram
- OOP concepts
- design patterns
- SDLC
- deployment strategy

Do not invent requirements that conflict with the existing project documents.

## WORKING METHOD

Follow this exact process:

PHASE 1 — Inspect
- Inspect all existing files.
- If an existing project exists, preserve useful work.
- Identify current stack and gaps.

PHASE 2 — Plan
- Produce a concise checklist.
- Explain any important architectural decision.
- Then start implementation.

PHASE 3 — Foundation
- scaffold project
- database
- environment config
- lint/typecheck
- Docker
- health endpoint

PHASE 4 — Auth
- registration/login
- password hashing
- JWT/session
- RBAC
- protected routes

PHASE 5 — Core workflow
- profiles
- campaigns
- creator search
- collaboration
- accept/reject
- contract
- tasks
- payments
- reviews

PHASE 6 — AI
- AIService interface
- MockAIService
- provider adapter
- five AI tools
- AIRecommendation persistence

PHASE 7 — Supporting modules
- analytics
- content calendar
- notifications
- messages

PHASE 8 — Quality
- tests
- validation
- error handling
- accessibility
- responsive behavior

PHASE 9 — Deployment
- Docker
- CI
- deployment instructions
- production environment checklist

After every major phase:
- run tests
- run typecheck
- run lint
- fix errors before moving on

Do not claim a feature is complete unless it is implemented and verified.

## IMPORTANT SEML REQUIREMENT

This is a Software Engineering and Modeling Laboratory project. The implementation must visibly demonstrate software engineering principles, OOP, UML modeling, SDLC, testing, and deployment automation.

Keep the system realistic enough to demonstrate these concepts but controlled enough for a 4-person student team to finish.

Start by inspecting the repository and PROJECT_PLAN.md, then show the implementation checklist before making the first major code change.
