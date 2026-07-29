import { apiClient } from '@/api/client';
import type { User } from '@/types';

export interface AdminStats {
  totalUsers: number;
  totalAnalyses: number;
  riskCategoryCounts: Record<'Low' | 'Medium' | 'High' | 'Critical', number>;
  predictionLabelCounts: Record<'fraudulent' | 'legitimate', number>;
}

export async function getAdminStats() {
  const res = await apiClient.get<AdminStats>('/admin/stats');
  return res.data;
}

export async function listAdminUsers(page = 1, limit = 20) {
  const res = await apiClient.get<{ users: User[]; pagination: { total: number; pages: number } }>(
    '/admin/users',
    { params: { page, limit } }
  );
  return res.data;
}
