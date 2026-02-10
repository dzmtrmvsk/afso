# Adaptive Field Service Orchestrator (AFSO)

**SaaS platform for managing field teams and internal service processes with automatic assignment, SLA control, queues, and analytics.**

## Overview

AFSO is an enterprise-grade field service management platform that automatically distributes work tickets among field agents and ensures timely completion. The system replaces manual "who is free, assign to them" processes with intelligent queue-based distribution, business rules, and SLA timers.

### Target Market

- Companies with field services (IT outsourcing, repair, HVAC, mobile healthcare)
- Logistics and delivery services
- Facility management companies
- Any organization with mobile workforce coordination needs

### Value Proposition

- **Reduced response time**: Automatic assignment eliminates coordination delays
- **SLA compliance**: Built-in timers and escalation prevent violations
- **Cost savings**: Less FTE required for dispatch and coordination
- **Service quality**: Real-time visibility and automated workflows
- **Revenue model**: Subscription-based SaaS ($15/user/month or $99/month for teams up to 10)

### Key Differentiators

Unlike traditional task trackers, AFSO provides:
- **Active orchestration**: Tasks live in intelligent queues, not just storage
- **Autonomous decision-making**: System automatically assigns based on load and skills
- **SLA enforcement**: Timers, escalations, and automatic reassignment
- **Event-driven architecture**: Complete audit trail and real-time updates

## Technical Architecture

### Stack Overview

**Monolith architecture** with modular structure in a single repository.

#### Backend (`server/`)
- **NestJS**: RESTful API, background workers, cron jobs
- **PostgreSQL**: Primary relational database (users, orgs, tickets, assignments, sla_policies, invoices)
- **MongoDB**: Event store, change history, unstructured logs (fast append/read)
- **Redis**: Caching, sessions, rate limiting, real-time counters
- **BullMQ**: Task queues for auto-assignment, SLA timers, escalations, integrations

#### Frontend (`client/`)
- **React**: UI framework
- **Material-UI (MUI)**: Component library
- **SCSS**: Styling
- **Socket.IO**: Real-time updates via WebSocket
- **Optimistic UI**: Immediate feedback for user actions

### Technical Complexity Points

- Task queue management with BullMQ
- Delayed/scheduled tasks (SLA timers)
- Multi-tier caching strategy
- Event sourcing and audit logging
- Scalable queue architecture
- Real-time bidirectional communication

## Project Structure

```
project/
├── client/              # React frontend application
├── server/              # NestJS backend application
├── .gitignore          # Root gitignore
└── README.md           # This file
```

## Feature Epics

### 1. Auth & Multi-Organization
- User authentication and authorization
- Multi-tenant organization support
- Role-based access control (RBAC)

### 2. Projects / Teams / Roles
- Project management
- Team structure and hierarchy
- Role definitions and permissions

### 3. Tickets
- Ticket creation with priority, location, and metadata
- Custom fields and forms
- Status workflow management

### 4. Queue Manager & Assignment Rules
- Intelligent queue distribution
- Auto-assignment based on skills and load
- Manual assignment override
- Load balancing (<=10% difference threshold)

### 5. SLA & Escalation
- SLA policy configuration
- Automatic timer initiation
- Breach detection and escalation
- Reassignment on SLA violations

### 6. Notifications & Integrations
- Email notifications
- Telegram integration
- Webhook support
- Third-party API integrations

### 7. Audit / Events / History
- Complete event log in MongoDB
- Change tracking for all entities
- Audit trail for compliance
- Historical data retrieval

### 8. Analytics & Reports
- SLA compliance reports
- Agent performance metrics
- Queue statistics
- Custom dashboards

### 9. Frontend: Queue UI, Kanban, Mobile
- Real-time queue view
- Kanban board for ticket management
- Mobile-responsive design
- Optimistic UI updates

### 10. DevOps
- CI/CD pipeline
- Automated testing
- Docker containerization
- Deployment automation

## Key User Stories

### US-01: Create Ticket with Auto-Assignment
**As a dispatcher**, I want to create a ticket with priority and location, so that a field agent can be assigned and reach the site.

**Acceptance Criteria**:
- POST /api/tickets returns 201
- Ticket stored in PostgreSQL
- Event appended in MongoDB
- Ticket appears in frontend queue within 2 seconds

### US-02: Automatic Assignment Based on Load
**As a system**, I want to auto-assign tickets based on team skill and current load, so that manual distribution decreases.

**Acceptance Criteria**:
- Worker receives ticket from BullMQ
- Selects executor with lowest load (<=10% difference)
- Creates Assignment record in database

### US-03: SLA Timer and Escalation
**As a manager**, I want SLA timer to start on ticket creation and escalate at breach, so that I get notified if SLA is violated.

**Acceptance Criteria**:
- SLA job scheduled in BullMQ on ticket creation
- On timer expiration, escalation event is created
- Notification sent to manager

### US-04: Ticket Status Management
**As an operator**, I want to take a ticket and change status to In Progress, so that others see it is occupied.

**Acceptance Criteria**:
- PATCH /api/tickets/:id/status updates PostgreSQL
- Event written to MongoDB
- UI shows "In Progress" in real-time

## Real-World Use Case

**Scenario**: Office equipment repair company

1. **Client submits ticket**: "Printer not printing"
2. **System automatically**:
   - Places ticket in queue
   - Assigns available technician based on location and skills
   - Starts SLA timer (e.g., 2 hours for response)
3. **If technician does not start on time**:
   - System sends notification to manager
   - Can automatically reassign to another available technician
4. **Manager dashboard shows**:
   - Total active tickets
   - Agents with highest load
   - SLA violations and near-breach tickets

**Benefits**:
- Zero lost tickets
- Faster response times
- Reduced coordination overhead
- Fewer SLA penalties
- No manual tracking via calls or Excel

## Development Workflow

### Agile Process
```
Backlog → User Stories → Sprint Planning → Development → Sprint Demo
```

This aligns with academic requirements for backlog management and sprint execution.

### Git Workflow
- Feature branches from `main`
- Pull requests with code review
- CI/CD runs tests automatically
- Merge to `main` triggers deployment

## Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- MongoDB 6+
- Redis 7+
- Docker (optional, recommended)

### Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Configure database connections in .env
npm run migration:run
npm run dev
```

### Frontend Setup
```bash
cd client
npm install
cp .env.example .env
# Configure API endpoint in .env
npm run dev
```

### Docker Setup
```bash
docker-compose up -d
```

## Testing Strategy

- **Unit tests**: Jest for business logic
- **Integration tests**: Test database interactions
- **E2E tests**: Test full user workflows
- **Load tests**: Validate queue performance under load

## Contributing

1. Create feature branch from `main`
2. Implement changes with tests
3. Ensure all tests pass
4. Create pull request with description
5. Wait for code review and CI/CD checks

## License

Proprietary - All rights reserved

## Project Status

Currently in initial development phase. Setting up infrastructure and core modules.

---

**Note**: This is an educational project demonstrating enterprise-grade SaaS development practices with complex technical requirements including queue management, SLA enforcement, and event-driven architecture.
