import client from './client';
import type { AuthResponse } from '@/types';

export const authApi = {
  login(email: string, password: string) {
    return client.post<AuthResponse>('/auth/login', { email, password });
  },

  register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    registrationKey: string;
  }) {
    return client.post<AuthResponse>('/auth/register', data);
  },

  getProfile() {
    return client.get('/users/profile');
  },
};
