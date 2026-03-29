# AFSO Backend API

**Adaptive Field Service Orchestrator** - Backend API server built with NestJS, PostgreSQL, MongoDB, Redis, and BullMQ.

## Overview

The AFSO backend is a monolithic NestJS application that provides RESTful APIs for managing field service operations, including ticket management, automatic assignment, SLA enforcement, and real-time queue management.

## Documentation

- **[API Documentation](./docs/API.md)** - Complete API endpoint reference with request/response examples
- **[Database Schema](./docs/DATABASE_SCHEMA.md)** - PostgreSQL tables, MongoDB collections, Redis structures, and entity relationships

### Technology Stack

- **Framework**: NestJS 11 with TypeScript
- **Primary Database**: PostgreSQL 14+ (relational data)
- **Event Store**: MongoDB 6+ (audit logs, change history)
- **Cache & Sessions**: Redis 7+ (caching, real-time counters)
- **Task Queue**: BullMQ with Redis backend (async jobs, SLA timers)
- **ORM**: TypeORM with migrations support

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- MongoDB 6+
- Redis 7+
- npm or yarn

## Installation

```bash
npm install --legacy-peer-deps
```

Note: `--legacy-peer-deps` is required due to NestJS 11 compatibility with some dependencies.

## Configuration

Create a `.env` file in the root directory based on `.env.example`:

```bash
cp .env.example .env
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Environment mode |
| `PORT` | `3000` | API server port |
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_USERNAME` | `postgres` | PostgreSQL user |
| `DB_PASSWORD` | `postgres` | PostgreSQL password |
| `DB_NAME` | `afso_dev` | PostgreSQL database name |
| `REDIS_HOST` | `localhost` | Redis host |
| `REDIS_PORT` | `6379` | Redis port |
| `REDIS_PASSWORD` | `` | Redis password (optional) |
| `JWT_SECRET` | `your-secret-key-change-in-production` | JWT signing secret |
| `JWT_EXPIRATION` | `24h` | JWT token expiration |

## Running the Application

### Development

```bash
npm run start:dev
```

Starts the application in watch mode with hot-reload enabled.

### Production

```bash
npm run build
npm run start:prod
```

## Database Management

### Running Migrations

```bash
npm run migration:run
```

Applies all pending migrations to the database.

### Generating Migrations

```bash
npm run migration:generate -- src/migrations/CreateTableName
```

Generates a new migration based on entity changes.

### Reverting Migrations

```bash
npm run migration:revert
```

Reverts the last executed migration.

## Project Structure

```
src/
├── app.module.ts              # Root application module
├── main.ts                    # Application entry point
├── database.config.ts         # TypeORM configuration
├── queue.config.ts            # BullMQ configuration
├── migrations/                # Database migrations
│   └── .gitkeep
├── modules/                   # Feature modules (to be created)
│   ├── auth/
│   ├── tickets/
│   ├── assignments/
│   ├── queues/
│   ├── sla/
│   └── ...
├── entities/                  # TypeORM entities
├── dto/                       # Data transfer objects
├── services/                  # Business logic
├── controllers/               # API endpoints
└── common/                    # Shared utilities, guards, interceptors
```

## Key Modules (To Be Implemented)

- **Auth Module**: User authentication and JWT tokens
- **Tickets Module**: Ticket creation, status management
- **Assignments Module**: Auto-assignment logic and load balancing
- **Queue Module**: Queue management and distribution
- **SLA Module**: SLA policy configuration and escalation
- **Notifications Module**: Email, Telegram, webhook integrations
- **Events Module**: Event sourcing and audit logging

## API Conventions

- **Base URL**: `http://localhost:3000/api`
- **Authentication**: JWT Bearer token in Authorization header
- **Content-Type**: `application/json`
- **Response Format**: Standard JSON with status codes

### Standard Response Format

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {}
}
```

### Error Response Format

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "BadRequest"
}
```

## Development Commands

```bash
npm run start          # Start application
npm run start:dev      # Start with watch mode
npm run start:debug    # Start with debugger
npm run build          # Build for production
npm run lint           # Run ESLint
npm run format         # Format code with Prettier
```

## Database Schema

### Core Tables (PostgreSQL)

- `users` - System users and operators
- `organizations` - Multi-tenant organizations
- `teams` - Teams within organizations
- `tickets` - Service tickets/requests
- `assignments` - Ticket assignments to agents
- `sla_policies` - SLA rules and timelines
- `invoices` - Billing and invoicing

### Event Store (MongoDB)

- `events` - Complete audit trail of all changes
- `event_snapshots` - Snapshots for performance

### Cache (Redis)

- Session tokens
- Queue statistics
- Rate limiting counters
- List caches

## Queue Jobs (BullMQ)

- `auto-assign-ticket` - Automatic ticket assignment based on load
- `sla-escalation` - SLA timer and escalation checks
- `send-notification` - Email and Telegram notifications
- `integration-webhook` - Third-party integrations
- `generate-report` - Analytics and report generation

## Testing

### Running Tests

```bash
# Unit tests
npm run test

# Unit tests in watch mode
npm run test:watch

# Test coverage
npm run test:cov

# E2E tests
npm run test:e2e

# Debug tests
npm run test:debug
```

### Test Structure

```
src/
├── modules/
│   └── auth/
│       ├── auth.service.ts
│       ├── auth.service.spec.ts    # Unit tests
│       └── auth.controller.ts
test/
├── jest-e2e.json                    # E2E test configuration
└── auth.e2e-spec.ts                 # E2E tests
```

### Writing Tests

#### Unit Tests

Unit tests are located alongside the source files with `.spec.ts` extension:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

#### E2E Tests

E2E tests are located in the `test/` directory:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200);
  });
});
```

### Test Coverage

Run `npm run test:cov` to generate a coverage report in the `coverage/` directory.

### Installing Test Dependencies

```bash
npm install --save-dev @nestjs/testing jest ts-jest @types/jest supertest @types/supertest
```

## Debugging

### Enable Detailed Logging

Set `NODE_ENV=development` to enable TypeORM query logging.

### Debug Mode

```bash
npm run start:debug
```

Then attach your debugger to `localhost:9229`.

## Performance Considerations

- Connection pooling configured for PostgreSQL
- Redis caching for frequently accessed data
- BullMQ for async processing to prevent blocking
- Database indexes on frequently queried columns
- Event sourcing for audit trail without performance impact

## Security

- JWT-based authentication
- Rate limiting (to be implemented)
- Input validation with class-validator
- SQL injection prevention via TypeORM parameterized queries
- CORS configuration (to be implemented)

## Deployment

### Docker

A Dockerfile will be provided for containerized deployment.

### Environment-Specific Configuration

- Development: Local PostgreSQL, MongoDB, Redis
- Staging: Cloud-hosted databases with staging credentials
- Production: Managed database services with encryption

## Contributing

1. Create a feature branch from `develop`
2. Implement changes with proper typing
3. Follow NestJS best practices
4. Update documentation as needed
5. Create a pull request for review

## License

Apache-2.0

## Support

For issues or questions, refer to the main project README or contact the development team.
