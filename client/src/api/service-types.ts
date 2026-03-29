import client from './client';
import type { ServiceType } from '@/types';

export const serviceTypesApi = {
  getAll() {
    return client.get<ServiceType[]>('/service-types');
  },

  getById(id: string) {
    return client.get<ServiceType>(`/service-types/${id}`);
  },

  create(data: Partial<ServiceType>) {
    return client.post<ServiceType>('/service-types', data);
  },

  update(id: string, data: Partial<ServiceType>) {
    return client.patch<ServiceType>(`/service-types/${id}`, data);
  },

  remove(id: string) {
    return client.delete(`/service-types/${id}`);
  },
};
