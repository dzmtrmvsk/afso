export const UserRole = {
  SUPER_ADMIN: 'super_admin',
  MANAGER: 'manager',
  AGENT: 'agent',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const UserStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export const TicketPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;
export type TicketPriority = (typeof TicketPriority)[keyof typeof TicketPriority];

export const TicketStatus = {
  PENDING: 'pending',
  IN_QUEUE: 'in_queue',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  ON_HOLD: 'on_hold',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
} as const;
export type TicketStatus = (typeof TicketStatus)[keyof typeof TicketStatus];

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  organizationId?: string;
  organization?: Organization;
  position?: string;
  skills?: string[];
  currentLoad: number;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  organizationId: string;
  createdById?: string;
  createdBy?: User;
  assignment?: Assignment;
  slaPolicyId?: string;
  slaPolicy?: SlaPolicy;
  slaDeadline?: string;
  slaBreached: boolean;
  locationId?: string;
  location?: Location;
  customerId?: string;
  customer?: Customer;
  serviceTypeId?: string;
  serviceType?: ServiceType;
  teamId?: string;
  team?: Team;
  contactName?: string;
  contactPhone?: string;
  address?: string;
  startedAt?: string;
  pausedAt?: string;
  totalWorkTimeMs: number;
  customFields?: Record<string, unknown>;
  requiredSkills?: string[];
  estimatedDurationMinutes: number;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
}

export interface Assignment {
  id: string;
  ticketId: string;
  ticket?: Ticket;
  agentId: string;
  agent?: User;
  status: string;
  assignedAt: string;
  acceptedAt?: string;
  completedAt?: string;
  declinedAt?: string;
  declineReason?: string;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  organizationId: string;
  members?: User[];
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceType {
  id: string;
  name: string;
  description?: string;
  estimatedDuration?: number;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SlaPolicy {
  id: string;
  name: string;
  description?: string;
  responseTimeMinutes: number;
  resolutionTimeMinutes: number;
  priority: TicketPriority;
  organizationId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  tickets: {
    total: number;
    resolved: number;
    pending: number;
    slaBreached: number;
  };
  agents: {
    total: number;
    active: number;
    averageLoad: number;
  };
  sla: {
    complianceRate: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  totalCount?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface RegistrationKey {
  id: string;
  key: string;
  organizationName: string;
  organizationId?: string;
  used: boolean;
  usedByEmail?: string;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface TicketFilters {
  status?: TicketStatus;
  priority?: TicketPriority;
  assignedToId?: string;
  page?: number;
  limit?: number;
}
