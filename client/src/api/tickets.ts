import client from './client';
import type { Ticket, TicketFilters, PaginatedResponse } from '@/types';

export const ticketsApi = {
  getAll(filters?: TicketFilters) {
    return client.get<PaginatedResponse<Ticket>>('/tickets', { params: filters });
  },

  getById(id: string) {
    return client.get<Ticket>(`/tickets/${id}`);
  },

  create(data: Partial<Ticket>) {
    return client.post<Ticket>('/tickets', data);
  },

  update(id: string, data: Partial<Ticket>) {
    return client.patch<Ticket>(`/tickets/${id}`, data);
  },

  updateStatus(id: string, status: string) {
    return client.patch<Ticket>(`/tickets/${id}/status`, { status });
  },

  getMyTasks() {
    return client.get<Ticket[]>('/tickets/my');
  },

  startWork(id: string) {
    return client.post<Ticket>(`/tickets/${id}/start`);
  },

  pauseWork(id: string) {
    return client.post<Ticket>(`/tickets/${id}/pause`);
  },

  completeWork(id: string) {
    return client.post<Ticket>(`/tickets/${id}/complete`);
  },

  remove(id: string) {
    return client.delete(`/tickets/${id}`);
  },
};
