# Atrio Backend Implementation Plan

## Objective

Build the backend project inside `api/` using the Nest template already imported into the repository. The backend must implement the REST contract defined in `expected-rest-apis.md`, run in Docker, follow the template conventions, use English names for code and database tables, expose versioned APIs with complete Swagger documentation, and maintain `100%` unit test coverage.

## Scope

- Backend project root: `api/`
- Runtime stack: NestJS
- Infrastructure via Docker Compose
- Services in Compose: `api`, `postgres`, `redis`
- Persistence: PostgreSQL
- Cache and local queue backend: Redis
- Contract source: `api/expected-rest-apis.md`

## Architecture Principles

- Keep the code modular and aligned with Nest conventions.
- Separate responsibilities by module, entity, repository, service, controller, DTO, mapper, and shared infrastructure.
- Use English for:
  - table names
  - entity names
  - class names
  - variable names
  - enums and status values stored internally
- Keep external API payloads compatible with the expected contract.
- Centralize validation, error handling, serialization, logging, and authentication concerns.
- Prefer deterministic business rules and testable services.

## Infrastructure Plan

### Docker

- Keep the backend runnable through Docker Compose.
- Compose must include:
  - `api`
  - `postgres`
  - `redis`
- Create a dedicated Docker network for the Atrio backend stack.
- Explicitly define a custom subnet for this network to avoid collisions with existing Docker networks and IP ranges already present on the machine.
- Add healthchecks and startup ordering for dependent services.
- Use named volumes for persistent local database data.

### Configuration

- Standardize environment variables for:
  - application port
  - database connection
  - redis connection
  - JWT/auth settings
  - Swagger metadata
  - storage driver
  - queue driver
  - S3 settings
  - SQS settings
- Keep local development defaults documented in the API README.

## Environment-Specific Integrations

### File Uploads

- Production and non-local environments:
  - uploads must use Amazon S3
- Local development:
  - uploads must be stored only in local storage/file system
- Implement storage access behind an abstraction so controllers and services do not depend directly on S3 or local disk behavior.
- Ensure generated URLs and file metadata are normalized regardless of storage driver.

### Queues

- Production and non-local environments:
  - queues must use Amazon SQS
- Local development:
  - queues must use Redis-backed FIFO queues with high throughput characteristics
- Implement queue publishing and consumption behind an abstraction so business modules remain independent from the concrete queue provider.
- Preserve FIFO semantics for operations that require ordering and idempotent processing.

## Backend Foundation

- Configure API versioning with `/v1`.
- Configure complete Swagger documentation with:
  - tags by module
  - request DTO schemas
  - response DTO schemas
  - query/path parameter documentation
  - auth scheme documentation
  - error response documentation
  - representative examples aligned with the contract
- Add global request validation and transformation.
- Add consistent exception handling with the error envelope defined in `expected-rest-apis.md`.
- Add authentication guard strategy for protected routes.
- Add shared utilities for pagination, date formatting support, and response mapping.

## Persistence Plan

- Use PostgreSQL as the primary relational database.
- Implement migrations for schema evolution.
- Implement seeds for local and test data bootstrap.
- Review the imported template persistence setup and adapt it to the domain model.
- Keep seed data aligned with the examples used in the REST contract.
- Use the mocked datasets currently present in `ui/src/mocks` as the primary source for the initial seed set, adapting them to the relational model and preserving consistency with the app screens.

## Domain Modeling Plan

The data model will support the contract with modules and tables equivalent to the business domain below:

- hotels
- guests
- stays
- stay access challenges
- guest sessions or authenticated context support
- services
- stay requests
- experiences
- experience collections
- experience availability slots
- reservations
- concierge messages
- consumption items
- useful stay information

Supporting tables may be added where necessary for normalization, auditability, or integrity.

## Module Implementation Plan

### 1. Stay Access Module

Implement:

- `POST /stay-access/identify`
- `POST /stay-access/verify`
- `POST /stay-access/resend-code`

Responsibilities:

- identify stay by hotel, room number, and last name
- issue and persist challenge state
- enforce expiration and resend cooldown
- simulate or abstract SMS delivery
- authenticate the guest and issue tokens on verification

### 2. Session Module

Implement:

- `GET /me/session`

Responsibilities:

- restore authenticated guest session
- validate token and stay ownership context

### 3. Stays Module

Implement:

- `GET /stays/{stayId}`
- `GET /stays/{stayId}/dashboard`
- `GET /stays/{stayId}/wifi`
- `GET /stays/{stayId}/consumption`

Responsibilities:

- return stay summary
- aggregate dashboard content
- expose wifi info
- expose consumption states: `ready`, `empty`, `unavailable`

### 4. Experiences Module

Implement:

- `GET /experiences/collections`
- `GET /experiences/collections/{collectionId}`
- `GET /experiences/{experienceId}`
- `GET /experiences/{experienceId}/availability`

Responsibilities:

- editorial collections
- featured content
- experience detail
- availability calendar and slots

### 5. Reservations Module

Implement:

- `POST /stays/{stayId}/reservations`
- `GET /stays/{stayId}/reservations`
- `GET /stays/{stayId}/reservations/{reservationId}`

Responsibilities:

- validate slot availability
- prevent duplicate or conflicting reservations
- return summary and detail shapes expected by the app

### 6. Services Module

Implement:

- `GET /services`
- `GET /services/{serviceId}`

Responsibilities:

- expose available hotel services
- expose request schema metadata consumed by the client

### 7. Requests Module

Implement:

- `POST /stays/{stayId}/requests`
- `GET /stays/{stayId}/requests`
- `GET /stays/{stayId}/requests/{requestId}`

Responsibilities:

- create hotel service requests
- track request status lifecycle
- return confirmation payloads and listing payloads

### 8. Concierge Module

Implement:

- `GET /stays/{stayId}/concierge/messages`
- `POST /stays/{stayId}/concierge/messages`

Responsibilities:

- message history
- quick suggestions
- message creation
- automatic acknowledgement reply
- pagination support for conversation history

## Cross-Cutting Concerns

### Authentication and Authorization

- Use bearer token authentication for protected endpoints.
- Ensure the authenticated guest can only access resources related to the active stay they own.
- Return `401` for invalid or missing authentication.
- Return `403` when the stay does not belong to the authenticated guest context.

### Validation and Errors

- Use DTO validation for all inputs.
- Map business rule failures to the expected HTTP status codes:
  - `400`
  - `401`
  - `403`
  - `404`
  - `409`
  - `422`
  - `429`
- Return the standard error envelope consistently.

### Pagination and Filtering

- Support the recommended filters and cursor-based pagination where described in the contract.
- Standardize pagination DTOs and response objects.

### Logging and Observability

- Reuse the template logging approach where applicable.
- Keep request and business error logs structured.
- Ensure background jobs and queue consumers are observable.

## Testing Strategy

- Reach `100%` unit test coverage for:
  - statements
  - branches
  - functions
  - lines
- Cover:
  - services
  - controllers
  - repositories
  - guards
  - filters
  - mappers
  - utility classes
  - queue and storage adapters
- Use deterministic fixtures and mocks.
- Keep tests isolated from real external infrastructure.
- Add coverage thresholds in the test configuration so the target is enforced automatically.

## Delivery Sequence

1. Audit the template and normalize project conventions.
2. Configure Docker, dedicated network, PostgreSQL, and Redis.
3. Configure app foundation: versioning, Swagger, validation, errors, auth, config.
4. Design the relational schema.
5. Implement migrations and seeds.
6. Implement infrastructure abstractions for storage and queues.
7. Implement domain modules and endpoints in contract priority order.
8. Add and complete unit tests until coverage reaches `100%`.
9. Validate the generated API against `expected-rest-apis.md`.
10. Finalize API README with setup, commands, migrations, seeds, queue/storage behavior, and test instructions.

## Acceptance Criteria

- `api/` is the backend project root.
- The backend starts with Docker Compose.
- Compose includes `api`, `postgres`, and `redis`.
- The stack uses a dedicated non-conflicting Docker network.
- PostgreSQL is the primary database.
- Redis is available for cache and local queue execution.
- Uploads use S3 outside local development and local storage in local development.
- Queues use SQS outside local development and Redis FIFO high-throughput queues in local development.
- All endpoints in `expected-rest-apis.md` are implemented.
- API versioning and Swagger are complete.
- Migrations and seeds are implemented.
- Initial seeds are derived from the mocked data currently used by the UI.
- Code follows project conventions and backend best practices.
- Table names and code identifiers are in English.
- Unit test coverage is `100%`.
