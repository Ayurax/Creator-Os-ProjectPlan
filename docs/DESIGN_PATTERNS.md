# Design Patterns in CreatorOS AI

## Strategy
Recommendation strategies can vary by niche match, engagement, budget fit or audience fit.

## Factory
AIServiceFactory selects MockAIService or a configured provider adapter.

## Repository
Repositories isolate Prisma/database operations from business services.

## Service Layer
CampaignService, CollaborationService, ContractService and AIService hold business logic.

## OOP mapping
Encapsulation: private implementation details inside services/domain structures.
Abstraction: service interfaces and provider interfaces.
Inheritance: User role hierarchy in the conceptual model.
Polymorphism: interchangeable recommendation/AI strategies.

Patterns are included because they solve concrete design problems, not merely to increase pattern count.
