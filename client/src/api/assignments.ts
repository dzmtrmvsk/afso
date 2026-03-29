import client from './client';
import type { Assignment } from '@/types';

export const assignmentsApi = {
  getMy() {
    return client.get<Assignment[]>('/assignments/my');
  },

  create(data: { ticketId: string; agentId: string }) {
    return client.post<Assignment>('/assignments', data);
  },

  accept(id: string) {
    return client.patch<Assignment>(`/assignments/${id}/accept`);
  },

  decline(id: string, reason: string) {
    return client.patch<Assignment>(`/assignments/${id}/decline`, { reason });
  },

  complete(id: string, notes?: string) {
    return client.patch<Assignment>(`/assignments/${id}/complete`, { notes });
  },
};
