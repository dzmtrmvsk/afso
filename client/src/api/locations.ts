import client from './client';
import type { Location } from '@/types';

export const locationsApi = {
  getAll() {
    return client.get<Location[]>('/locations');
  },

  getById(id: string) {
    return client.get<Location>(`/locations/${id}`);
  },

  create(data: Partial<Location>) {
    return client.post<Location>('/locations', data);
  },

  update(id: string, data: Partial<Location>) {
    return client.patch<Location>(`/locations/${id}`, data);
  },

  remove(id: string) {
    return client.delete(`/locations/${id}`);
  },
};
