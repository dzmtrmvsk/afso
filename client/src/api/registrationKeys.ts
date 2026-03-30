import client from './client';
import type { RegistrationKey } from '@/types';

export const registrationKeysApi = {
  getAll() {
    return client.get<RegistrationKey[]>('/auth/keys');
  },

  generate(organizationName: string) {
    return client.post<RegistrationKey>('/auth/keys', { organizationName });
  },

  delete(id: string) {
    return client.delete(`/auth/keys/${id}`);
  },
};
