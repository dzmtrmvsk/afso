/**
 * @afso/shared — shared types, constants, and utilities
 * used across the API and Web workspaces.
 */

// ─── Ticket statuses ─────────────────────────────────────
export enum TicketStatus {
  OPEN = 'OPEN',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

// ─── SLA priority levels ─────────────────────────────────
export enum SlaPriority {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

// ─── User roles ──────────────────────────────────────────
export enum UserRole {
  ADMIN = 'ADMIN',
  DISPATCHER = 'DISPATCHER',
  FIELD_AGENT = 'FIELD_AGENT',
  VIEWER = 'VIEWER',
}

// ─── WebSocket event names ───────────────────────────────
export const WS_EVENTS = {
  TICKET_CREATED: 'ticket:created',
  TICKET_UPDATED: 'ticket:updated',
  TICKET_ASSIGNED: 'ticket:assigned',
  SLA_BREACH: 'sla:breach',
  SLA_WARNING: 'sla:warning',
} as const;
