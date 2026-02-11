# AFSO Database Schema

## PostgreSQL Tables

### users

Stores user accounts and profiles.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique user identifier |
| email | VARCHAR | UNIQUE, NOT NULL | User email address |
| password | VARCHAR | NOT NULL | Hashed password |
| firstName | VARCHAR | NOT NULL | User first name |
| lastName | VARCHAR | NOT NULL | User last name |
| role | ENUM | NOT NULL | User role (admin, manager, dispatcher, agent) |
| status | ENUM | DEFAULT 'active' | Account status (active, inactive, suspended) |
| phone | VARCHAR | NULLABLE | Contact phone number |
| organizationId | UUID | FK, NOT NULL | Reference to organizations table |
| skills | JSONB | NULLABLE | Array of skill tags |
| currentLoad | INTEGER | DEFAULT 0 | Current number of active assignments |
| createdAt | TIMESTAMP | NOT NULL | Creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL | Last update timestamp |

**Indexes:**
- `idx_users_email` on email
- `idx_users_organization_id` on organizationId
- `idx_users_role` on role

---

### organizations

Multi-tenant organization accounts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique organization identifier |
| name | VARCHAR | UNIQUE, NOT NULL | Organization name |
| slug | VARCHAR | UNIQUE, NOT NULL | URL-safe organization identifier |
| description | TEXT | NULLABLE | Organization description |
| isActive | BOOLEAN | DEFAULT true | Active status |
| settings | JSONB | NULLABLE | Organization-specific settings |
| createdAt | TIMESTAMP | NOT NULL | Creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL | Last update timestamp |

**Indexes:**
- `idx_organizations_slug` on slug

---

### teams

Team groupings within organizations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique team identifier |
| name | VARCHAR | NOT NULL | Team name |
| description | TEXT | NULLABLE | Team description |
| organizationId | UUID | FK, NOT NULL | Reference to organizations table |
| skills | JSONB | NULLABLE | Team skill tags |
| createdAt | TIMESTAMP | NOT NULL | Creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL | Last update timestamp |

**Indexes:**
- `idx_teams_organization_id` on organizationId

---

### team_members

Junction table for team membership.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| team_id | UUID | FK, NOT NULL | Reference to teams table |
| user_id | UUID | FK, NOT NULL | Reference to users table |

**Indexes:**
- `idx_team_members_team_id` on team_id
- `idx_team_members_user_id` on user_id
- **PRIMARY KEY:** (team_id, user_id)

---

### tickets

Service request tickets.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique ticket identifier |
| title | VARCHAR | NOT NULL | Ticket title |
| description | TEXT | NOT NULL | Detailed description |
| priority | ENUM | DEFAULT 'medium' | Priority (low, medium, high, urgent) |
| status | ENUM | DEFAULT 'pending' | Status (pending, in_queue, assigned, in_progress, on_hold, resolved, closed) |
| organizationId | UUID | FK, NOT NULL | Reference to organizations table |
| createdById | UUID | FK, NULLABLE | User who created the ticket |
| slaPolicyId | UUID | FK, NULLABLE | Reference to sla_policies table |
| slaDeadline | TIMESTAMP | NULLABLE | SLA deadline timestamp |
| slaBreached | BOOLEAN | DEFAULT false | SLA breach indicator |
| location | JSONB | NULLABLE | Location object (address, latitude, longitude) |
| customFields | JSONB | NULLABLE | Custom form fields |
| requiredSkills | JSONB | NULLABLE | Array of required skill tags |
| createdAt | TIMESTAMP | NOT NULL | Creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL | Last update timestamp |
| resolvedAt | TIMESTAMP | NULLABLE | Resolution timestamp |
| closedAt | TIMESTAMP | NULLABLE | Close timestamp |

**Indexes:**
- `idx_tickets_organization_id` on organizationId
- `idx_tickets_status` on status
- `idx_tickets_priority` on priority
- `idx_tickets_sla_deadline` on slaDeadline
- `idx_tickets_created_at` on createdAt

---

### assignments

Ticket assignments to agents.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique assignment identifier |
| ticketId | UUID | FK, UNIQUE, NOT NULL | Reference to tickets table (one-to-one) |
| agentId | UUID | FK, NOT NULL | Reference to users table |
| status | ENUM | DEFAULT 'pending' | Assignment status (pending, accepted, declined, in_progress, completed) |
| isAutoAssigned | BOOLEAN | DEFAULT false | Auto-assignment indicator |
| notes | TEXT | NULLABLE | Assignment notes |
| acceptedAt | TIMESTAMP | NULLABLE | Acceptance timestamp |
| startedAt | TIMESTAMP | NULLABLE | Start timestamp |
| completedAt | TIMESTAMP | NULLABLE | Completion timestamp |
| createdAt | TIMESTAMP | NOT NULL | Creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL | Last update timestamp |

**Indexes:**
- `idx_assignments_ticket_id` on ticketId
- `idx_assignments_agent_id` on agentId
- `idx_assignments_status` on status

---

### sla_policies

SLA (Service Level Agreement) policies.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique SLA policy identifier |
| name | VARCHAR | NOT NULL | Policy name |
| description | TEXT | NULLABLE | Policy description |
| organizationId | UUID | FK, NOT NULL | Reference to organizations table |
| priority | ENUM | NOT NULL | Associated ticket priority |
| responseTimeMinutes | INTEGER | NOT NULL | Maximum response time in minutes |
| resolutionTimeMinutes | INTEGER | NOT NULL | Maximum resolution time in minutes |
| isActive | BOOLEAN | DEFAULT true | Active status |
| escalateOnBreach | BOOLEAN | DEFAULT false | Auto-escalation on breach |
| escalationRules | JSONB | NULLABLE | Escalation configuration (notifyUserIds, reassignToTeamId) |
| createdAt | TIMESTAMP | NOT NULL | Creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL | Last update timestamp |

**Indexes:**
- `idx_sla_policies_organization_id` on organizationId
- `idx_sla_policies_priority` on priority

---

## MongoDB Collections

### events

Event store for complete audit trail.

```json
{
  "_id": "ObjectId",
  "eventType": "ticket.created | ticket.updated | ticket.assigned | assignment.accepted | sla.breached",
  "entityType": "ticket | assignment | user",
  "entityId": "uuid",
  "organizationId": "uuid",
  "userId": "uuid",
  "data": {
    "before": {},
    "after": {},
    "metadata": {}
  },
  "timestamp": "ISODate",
  "ipAddress": "string",
  "userAgent": "string"
}
```

**Indexes:**
- `idx_events_entity_type_entity_id` on (entityType, entityId)
- `idx_events_organization_id_timestamp` on (organizationId, timestamp)
- `idx_events_event_type` on eventType

---

### event_snapshots

Periodic snapshots for performance optimization.

```json
{
  "_id": "ObjectId",
  "entityType": "ticket | assignment",
  "entityId": "uuid",
  "state": {},
  "version": "number",
  "timestamp": "ISODate"
}
```

---

## Redis Data Structures

### Session Tokens

```
Key: session:{userId}:{tokenId}
Type: String
Value: JWT token
TTL: 24 hours
```

### Queue Statistics

```
Key: queue:stats:{organizationId}
Type: Hash
Fields:
  - total: total tickets
  - pending: pending tickets
  - in_queue: queued tickets
  - assigned: assigned tickets
  - in_progress: in-progress tickets
TTL: 5 minutes
```

### User Load Cache

```
Key: user:load:{userId}
Type: String
Value: current assignment count
TTL: 10 minutes
```

### Rate Limiting

```
Key: ratelimit:{ip}:{endpoint}
Type: String
Value: request count
TTL: 15 minutes
```

---

## Entity Relationships

```
Organization
├── Users (1:N)
├── Teams (1:N)
├── Tickets (1:N)
└── SLA Policies (1:N)

Team
├── Members (N:M with User via team_members)
└── Organization (N:1)

User
├── Organization (N:1)
├── Created Tickets (1:N)
├── Assignments (1:N)
└── Teams (N:M via team_members)

Ticket
├── Organization (N:1)
├── Created By User (N:1)
├── Assignment (1:1)
└── SLA Policy (N:1)

Assignment
├── Ticket (1:1)
└── Agent/User (N:1)

SLA Policy
├── Organization (N:1)
└── Tickets (1:N)
```

---

## Data Flow for Key Operations

### Ticket Creation (US-01)

1. **API Request** → POST /api/tickets
2. **PostgreSQL** → Insert into `tickets` table
3. **MongoDB** → Append event to `events` collection
4. **BullMQ** → Add job to `auto-assign` queue
5. **BullMQ** → Add job to `sla-timer` queue
6. **WebSocket** → Emit `ticket.created` event
7. **Redis** → Invalidate queue stats cache

### Auto-Assignment (US-02)

1. **BullMQ Worker** → Process `auto-assign` job
2. **PostgreSQL** → Query agents by skills and current load
3. **Algorithm** → Select agent with lowest load (<=10% difference)
4. **PostgreSQL** → Insert into `assignments` table
5. **PostgreSQL** → Update `tickets.status` and `users.currentLoad`
6. **MongoDB** → Append `ticket.assigned` event
7. **WebSocket** → Emit `ticket.assigned` event
8. **Redis** → Update user load cache

### SLA Escalation (US-03)

1. **BullMQ Scheduled Job** → Execute at SLA deadline
2. **PostgreSQL** → Check ticket status
3. **If breached** → Update `tickets.slaBreached = true`
4. **PostgreSQL** → Query escalation rules from `sla_policies`
5. **BullMQ** → Add notification jobs
6. **Optional** → Create new assignment to escalation team
7. **MongoDB** → Append `sla.breached` event

### Status Update (US-04)

1. **API Request** → PATCH /api/tickets/:id/status
2. **PostgreSQL** → Update `tickets.status`
3. **MongoDB** → Append `ticket.updated` event with before/after state
4. **WebSocket** → Emit `ticket.updated` event to all clients
5. **Redis** → Invalidate queue stats cache

---

## Migration Strategy

1. Create base tables in order: organizations → users → teams → team_members → sla_policies → tickets → assignments
2. Add indexes after initial data load for performance
3. Set up MongoDB collections with proper indexes
4. Configure Redis key namespaces
5. Run seed data for development environment
