import { TicketStatus, TicketPriority } from '@/types';

export const statusOptions = [
  { value: TicketStatus.PENDING, label: 'Pending' },
  { value: TicketStatus.IN_QUEUE, label: 'In Queue' },
  { value: TicketStatus.ASSIGNED, label: 'Assigned' },
  { value: TicketStatus.IN_PROGRESS, label: 'In Progress' },
  { value: TicketStatus.ON_HOLD, label: 'On Hold' },
  { value: TicketStatus.RESOLVED, label: 'Resolved' },
  { value: TicketStatus.CLOSED, label: 'Closed' },
];

export const priorityOptions = [
  { value: TicketPriority.LOW, label: 'Low' },
  { value: TicketPriority.MEDIUM, label: 'Medium' },
  { value: TicketPriority.HIGH, label: 'High' },
  { value: TicketPriority.URGENT, label: 'Urgent' },
];

export function getStatusVariant(status: TicketStatus) {
  const map: Record<TicketStatus, 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    [TicketStatus.PENDING]: 'warning',
    [TicketStatus.IN_QUEUE]: 'info',
    [TicketStatus.ASSIGNED]: 'primary',
    [TicketStatus.IN_PROGRESS]: 'primary',
    [TicketStatus.ON_HOLD]: 'default',
    [TicketStatus.RESOLVED]: 'success',
    [TicketStatus.CLOSED]: 'default',
  };
  return map[status];
}

export function getPriorityVariant(priority: TicketPriority) {
  const map: Record<TicketPriority, 'default' | 'primary' | 'success' | 'warning' | 'danger'> = {
    [TicketPriority.LOW]: 'default',
    [TicketPriority.MEDIUM]: 'primary',
    [TicketPriority.HIGH]: 'warning',
    [TicketPriority.URGENT]: 'danger',
  };
  return map[priority];
}
