# CreatorOS AI Architecture

## High-level architecture

Browser
-> React frontend
-> Express REST API
-> Service layer
-> Repository layer
-> PostgreSQL

AI requests:
React -> Express -> AIService -> Mock/Provider adapter -> result -> database/UI

## Boundaries

Frontend handles presentation and client-side interaction.

Backend handles authentication, authorization, validation, business rules and persistence.

Database stores durable application data.

AI provider is isolated behind AIService.

## Reliability

- health endpoint
- structured errors
- database migrations
- automated tests
- CI
- Docker
- environment-based configuration
- mock AI fallback for demonstration
