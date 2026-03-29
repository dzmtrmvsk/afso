import client from './client';
import type { Customer } from '@/types';

export const customersApi = {
  getAll() {
    return client.get<Customer[]>('/customers');
  },

  getById(id: string) {
    return client.get<Customer>(`/customers/${id}`);
  },

  create(data: Partial<Customer>) {
    return client.post<Customer>('/customers', data);
  },

  update(id: string, data: Partial<Customer>) {
    return client.patch<Customer>(`/customers/${id}`, data);
  },

  remove(id: string) {
    return client.delete(`/customers/${id}`);
  },
};
