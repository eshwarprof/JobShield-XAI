import { apiClient } from '@/api/client';
import type { User, Analysis } from '@/types';

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

export interface AdminUsersResponse {
  users: User[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export async function listAdminUsers(page = 1, limit = 20) {
  const res = await apiClient.get<AdminUsersResponse>('/admin/users', { params: { page, limit } });
  return res.data;
}

export interface AdminAnalysesResponse {
  analyses: (Omit<Analysis, 'userId'> & { userId: { name: string; email: string } | null })[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export async function updateUserRole(userId: string, role: 'user' | 'admin') {
  const res = await apiClient.put<User>(`/admin/users/${userId}/role`, { role });
  return res.data;
}

export async function deleteUser(userId: string) {
  const res = await apiClient.delete<{ message: string }>(`/admin/users/${userId}`);
  return res.data;
}

export async function listAdminAnalyses(page = 1, limit = 20) {
  const res = await apiClient.get<AdminAnalysesResponse>('/admin/analyses', { params: { page, limit } });
  return res.data;
}
