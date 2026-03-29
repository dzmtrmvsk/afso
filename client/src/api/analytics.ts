import client from './client';
import type { DashboardStats } from '@/types';

export const analyticsApi = {
  getDashboard(from?: string, to?: string) {
    return client.get<DashboardStats>('/analytics/dashboard', {
      params: { from, to },
    });
  },
};
