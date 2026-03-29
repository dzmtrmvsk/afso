import client from './client';
import type { User } from '@/types';

export const usersApi = {
  getAll() {
    return client.get<User[]>('/users');
  },

  getById(id: string) {
    return client.get<User>(`/users/${id}`);
  },

  create(data: { email: string; password: string; firstName: string; lastName: string; role: string }) {
    return client.post<User>('/users', data);
  },

  updateLoad(id: string, delta: number) {
    return client.patch(`/users/${id}/load`, { delta });
  },
};
