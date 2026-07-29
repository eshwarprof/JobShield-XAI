import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { getAdminStats, listAdminUsers, type AdminStats } from '@/api/admin';
import { getApiErrorMessage } from '@/api/client';
import type { User } from '@/types';

const RISK_COLORS: Record<string, string> = {
  Low: 'text-risk-low',
  Medium: 'text-risk-medium',
  High: 'text-risk-high',
  Critical: 'text-risk-critical',
};

export function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getAdminStats(), listAdminUsers()])
      .then(([statsData, usersData]) => {
        setStats(statsData);
        setUsers(usersData.users);
      })
      .catch((err) => setError(getApiErrorMessage(err)));
  }, []);

  if (error) return <p className="text-sm text-risk-critical">{error}</p>;
  if (!stats) return <Spinner label="Loading admin dashboard..." />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-xs text-slate-500 dark:text-slate-400">Total Users</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalUsers}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500 dark:text-slate-400">Total Analyses</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalAnalyses}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500 dark:text-slate-400">Fraudulent Predictions</p>
          <p className="text-3xl font-bold text-risk-critical">{stats.predictionLabelCounts.fraudulent}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500 dark:text-slate-400">Legitimate Predictions</p>
          <p className="text-3xl font-bold text-risk-low">{stats.predictionLabelCounts.legitimate}</p>
        </Card>
      </div>

      <Card>
        <h2 className="mb-4 font-semibold text-slate-900 dark:text-white">Risk Category Breakdown</h2>
        <div className="grid grid-cols-4 gap-4 text-center">
          {(['Low', 'Medium', 'High', 'Critical'] as const).map((risk) => (
            <div key={risk}>
              <p className={`text-2xl font-bold ${RISK_COLORS[risk]}`}>{stats.riskCategoryCounts[risk]}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{risk}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 font-semibold text-slate-900 dark:text-white">Users</h2>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400">
              <th className="pb-2">Name</th>
              <th className="pb-2">Email</th>
              <th className="pb-2">Role</th>
              <th className="pb-2">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-2 text-slate-900 dark:text-white">{u.name}</td>
                <td className="py-2 text-slate-600 dark:text-slate-400">{u.email}</td>
                <td className="py-2 capitalize text-slate-600 dark:text-slate-400">{u.role}</td>
                <td className="py-2 text-slate-600 dark:text-slate-400">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
