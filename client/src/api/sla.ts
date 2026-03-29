import client from './client';
import type { SlaPolicy } from '@/types';

export const slaApi = {
  getAll() {
    return client.get<SlaPolicy[]>('/sla-policies');
  },

  getById(id: string) {
    return client.get<SlaPolicy>(`/sla-policies/${id}`);
  },

  create(data: Partial<SlaPolicy>) {
    return client.post<SlaPolicy>('/sla-policies', data);
  },

  update(id: string, data: Partial<SlaPolicy>) {
    return client.patch<SlaPolicy>(`/sla-policies/${id}`, data);
  },
};
