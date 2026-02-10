# AFSO API Documentation

## Base URL

```
http://localhost:3000/api
```

## Authentication

All endpoints (except `/auth/login` and `/auth/register`) require JWT authentication via Bearer token in the Authorization header:

```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### POST /api/auth/register

Register a new user and organization.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "organizationName": "ACME Corp",
  "role": "admin"
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "admin",
    "organizationId": "uuid"
  },
  "accessToken": "jwt-token"
}
```

### POST /api/auth/login

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "admin"
  },
  "accessToken": "jwt-token"
}
```

---

## Ticket Endpoints

### POST /api/tickets

Create a new ticket.

**Request Body:**
```json
{
  "title": "Printer not working",
  "description": "Office printer on 3rd floor is not responding",
  "priority": "high",
  "location": {
    "address": "123 Main St, Floor 3",
    "latitude": 40.7128,
    "longitude": -74.0060
  },
  "requiredSkills": ["hardware", "printer"],
  "customFields": {
    "room": "3A-15",
    "assetId": "PR-2023-045"
  }
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "title": "Printer not working",
  "description": "Office printer on 3rd floor is not responding",
  "priority": "high",
  "status": "pending",
  "organizationId": "uuid",
  "createdById": "uuid",
  "location": {
    "address": "123 Main St, Floor 3",
    "latitude": 40.7128,
    "longitude": -74.0060
  },
  "requiredSkills": ["hardware", "printer"],
  "slaDeadline": "2024-01-15T14:30:00Z",
  "createdAt": "2024-01-15T12:00:00Z",
  "updatedAt": "2024-01-15T12:00:00Z"
}
```

**Acceptance Criteria (US-01):**
- Returns 201 status
- Ticket stored in PostgreSQL
- Event appended to MongoDB
- Ticket appears in queue within 2 seconds
- SLA timer automatically started

### GET /api/tickets

Get list of tickets with filtering and pagination.

**Query Parameters:**
- `status` - Filter by status (pending, in_queue, assigned, in_progress, on_hold, resolved, closed)
- `priority` - Filter by priority (low, medium, high, urgent)
- `assignedTo` - Filter by agent ID
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `sort` - Sort field (default: createdAt)
- `order` - Sort order (asc/desc, default: desc)

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Printer not working",
      "priority": "high",
      "status": "in_queue",
      "assignment": null,
      "slaDeadline": "2024-01-15T14:30:00Z",
      "createdAt": "2024-01-15T12:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

### GET /api/tickets/:id

Get ticket details by ID.

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "title": "Printer not working",
  "description": "Office printer on 3rd floor is not responding",
  "priority": "high",
  "status": "assigned",
  "organization": {
    "id": "uuid",
    "name": "ACME Corp"
  },
  "createdBy": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe"
  },
  "assignment": {
    "id": "uuid",
    "agent": {
      "id": "uuid",
      "firstName": "Jane",
      "lastName": "Smith"
    },
    "status": "accepted",
    "isAutoAssigned": true,
    "acceptedAt": "2024-01-15T12:05:00Z"
  },
  "slaPolicy": {
    "id": "uuid",
    "name": "High Priority SLA",
    "responseTimeMinutes": 120
  },
  "slaDeadline": "2024-01-15T14:30:00Z",
  "slaBreached": false,
  "location": {
    "address": "123 Main St, Floor 3",
    "latitude": 40.7128,
    "longitude": -74.0060
  },
  "createdAt": "2024-01-15T12:00:00Z",
  "updatedAt": "2024-01-15T12:05:00Z"
}
```

### PATCH /api/tickets/:id/status

Update ticket status.

**Request Body:**
```json
{
  "status": "in_progress"
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "status": "in_progress",
  "updatedAt": "2024-01-15T12:10:00Z"
}
```

**Acceptance Criteria (US-04):**
- Updates PostgreSQL record
- Creates event in MongoDB
- UI updates in real-time via WebSocket

### PATCH /api/tickets/:id

Update ticket details (title, description, priority, etc.).

**Request Body:**
```json
{
  "priority": "urgent",
  "description": "URGENT: Office printer on 3rd floor completely broken"
}
```

**Response:** `200 OK`

### DELETE /api/tickets/:id

Soft delete a ticket (admin only).

**Response:** `204 No Content`

---

## Assignment Endpoints

### POST /api/assignments

Manually assign a ticket to an agent.

**Request Body:**
```json
{
  "ticketId": "uuid",
  "agentId": "uuid",
  "notes": "Agent is closest to location"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "ticketId": "uuid",
  "agentId": "uuid",
  "status": "pending",
  "isAutoAssigned": false,
  "createdAt": "2024-01-15T12:00:00Z"
}
```

### PATCH /api/assignments/:id/accept

Agent accepts an assignment.

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "status": "accepted",
  "acceptedAt": "2024-01-15T12:05:00Z"
}
```

### PATCH /api/assignments/:id/decline

Agent declines an assignment (triggers auto-reassignment).

**Request Body:**
```json
{
  "reason": "Unavailable due to another urgent ticket"
}
```

**Response:** `200 OK`

### PATCH /api/assignments/:id/complete

Mark assignment as completed.

**Request Body:**
```json
{
  "notes": "Printer fixed, replaced toner cartridge"
}
```

**Response:** `200 OK`

---

## Queue Endpoints

### GET /api/queue

Get current ticket queue status.

**Query Parameters:**
- `teamId` - Filter by team
- `priority` - Filter by priority

**Response:** `200 OK`
```json
{
  "stats": {
    "total": 45,
    "pending": 12,
    "in_queue": 15,
    "assigned": 10,
    "in_progress": 8
  },
  "queue": [
    {
      "id": "uuid",
      "title": "Printer not working",
      "priority": "urgent",
      "status": "in_queue",
      "queuePosition": 1,
      "waitTimeMinutes": 15,
      "slaDeadline": "2024-01-15T14:30:00Z"
    }
  ]
}
```

### POST /api/queue/auto-assign

Trigger auto-assignment for pending tickets.

**Response:** `200 OK`
```json
{
  "assigned": 5,
  "failed": 0,
  "assignments": [
    {
      "ticketId": "uuid",
      "agentId": "uuid",
      "agentLoad": 3
    }
  ]
}
```

**Acceptance Criteria (US-02):**
- Worker receives ticket from BullMQ
- Selects agent with lowest load (<=10% difference)
- Creates Assignment record

---

## User Endpoints

### GET /api/users

Get list of users in organization.

**Query Parameters:**
- `role` - Filter by role
- `status` - Filter by status
- `teamId` - Filter by team

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "email": "agent@example.com",
      "firstName": "Jane",
      "lastName": "Smith",
      "role": "agent",
      "status": "active",
      "currentLoad": 3,
      "skills": ["hardware", "printer", "network"]
    }
  ]
}
```

### GET /api/users/:id

Get user details.

**Response:** `200 OK`

### PATCH /api/users/:id

Update user profile.

**Request Body:**
```json
{
  "phone": "+1234567890",
  "skills": ["hardware", "printer", "network", "server"]
}
```

**Response:** `200 OK`

### GET /api/users/:id/assignments

Get user's assignment history.

**Response:** `200 OK`

---

## SLA Endpoints

### GET /api/sla-policies

Get SLA policies for organization.

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "High Priority SLA",
      "priority": "high",
      "responseTimeMinutes": 120,
      "resolutionTimeMinutes": 480,
      "escalateOnBreach": true
    }
  ]
}
```

### POST /api/sla-policies

Create new SLA policy (admin/manager only).

**Request Body:**
```json
{
  "name": "Critical SLA",
  "priority": "urgent",
  "responseTimeMinutes": 30,
  "resolutionTimeMinutes": 240,
  "escalateOnBreach": true,
  "escalationRules": {
    "notifyUserIds": ["manager-uuid-1", "manager-uuid-2"],
    "reassignToTeamId": "senior-team-uuid"
  }
}
```

**Response:** `201 Created`

**Acceptance Criteria (US-03):**
- SLA job scheduled in BullMQ on ticket creation
- On timer expiration, escalation event is created
- Notification sent to manager

### GET /api/sla-policies/:id/breaches

Get SLA breach history for a policy.

**Response:** `200 OK`

---

## Team Endpoints

### GET /api/teams

Get teams in organization.

**Response:** `200 OK`

### POST /api/teams

Create a new team.

**Request Body:**
```json
{
  "name": "Hardware Support Team",
  "description": "Handles all hardware-related issues",
  "skills": ["hardware", "printer", "computer"]
}
```

**Response:** `201 Created`

### POST /api/teams/:id/members

Add member to team.

**Request Body:**
```json
{
  "userId": "uuid"
}
```

**Response:** `200 OK`

### DELETE /api/teams/:id/members/:userId

Remove member from team.

**Response:** `204 No Content`

---

## Analytics Endpoints

### GET /api/analytics/dashboard

Get dashboard statistics.

**Query Parameters:**
- `from` - Start date (ISO 8601)
- `to` - End date (ISO 8601)

**Response:** `200 OK`
```json
{
  "tickets": {
    "total": 450,
    "resolved": 380,
    "pending": 45,
    "slaBreached": 12
  },
  "agents": {
    "total": 25,
    "active": 20,
    "averageLoad": 2.5
  },
  "sla": {
    "complianceRate": 97.3,
    "averageResponseTime": 45,
    "averageResolutionTime": 185
  }
}
```

### GET /api/analytics/reports

Get detailed reports.

**Response:** `200 OK`

---

## WebSocket Events

### Connection

```
ws://localhost:3000
```

### Events

#### ticket.created
Emitted when new ticket is created.

```json
{
  "event": "ticket.created",
  "data": {
    "id": "uuid",
    "title": "New ticket",
    "status": "pending"
  }
}
```

#### ticket.updated
Emitted when ticket is updated.

#### ticket.assigned
Emitted when ticket is assigned to agent.

#### queue.updated
Emitted when queue status changes.

---

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Ticket not found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

---

## Rate Limiting

- Default: 100 requests per 15 minutes per IP
- Authenticated: 1000 requests per 15 minutes per user
- Response header: `X-RateLimit-Remaining`

## Pagination

All list endpoints support pagination:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

Response includes meta object:
```json
{
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 450,
    "totalPages": 23
  }
}
```
