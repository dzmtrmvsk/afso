import client from './client';
import type { Team } from '@/types';

export const teamsApi = {
  getAll() {
    return client.get<Team[]>('/teams');
  },

  getById(id: string) {
    return client.get<Team>(`/teams/${id}`);
  },

  create(data: Partial<Team>) {
    return client.post<Team>('/teams', data);
  },

  update(id: string, data: Partial<Team>) {
    return client.patch<Team>(`/teams/${id}`, data);
  },

  remove(id: string) {
    return client.delete(`/teams/${id}`);
  },

  addMember(teamId: string, userId: string) {
    return client.post(`/teams/${teamId}/members`, { userId });
  },

  removeMember(teamId: string, userId: string) {
    return client.delete(`/teams/${teamId}/members/${userId}`);
  },
};
