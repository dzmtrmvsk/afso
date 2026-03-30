import client from './client';
import type { Organization } from '@/types';

export const organizationsApi = {
  getAll() {
    return client.get<Organization[]>('/organizations');
  },

  getById(id: string) {
    return client.get<Organization>(`/organizations/${id}`);
  },
};
