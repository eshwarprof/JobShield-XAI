import { useEffect, useState } from 'react';
import { Activity, ShieldCheck, ShieldX, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { Skeleton } from '@/components/ui/Skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/Table';
import { getAdminStats, listAdminUsers, type AdminStats } from '@/api/admin';
import { getApiErrorMessage } from '@/api/client';
import type { User } from '@/types';

const RISK_COLORS: Record<string, string> = {
  Low: 'text-risk-low',
  Medium: 'text-risk-medium',
  High: 'text-risk-high',
  Critical: 'text-risk-critical',
};

function StatCard({ icon: Icon, label, value, valueClass }: { icon: LucideIcon; label: string; value: number; valueClass?: string }) {
  return (
    <Card>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
          <Icon className="h-5 w-5 text-slate-500 dark:text-slate-400" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
          <p className={`text-3xl font-bold tabular-nums ${valueClass ?? 'text-slate-900 dark:text-white'}`}>{value}</p>
        </div>
      </div>
    </Card>
  );
}

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

  if (error) return <Alert variant="error">{error}</Alert>;
  if (!stats) return <Spinner label="Loading admin dashboard..." />;

  return (
    <div className="animate-fade-in-up space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Users" value={stats.totalUsers} />
        <StatCard icon={Activity} label="Total Analyses" value={stats.totalAnalyses} />
        <StatCard
          icon={ShieldX}
          label="Fraudulent Predictions"
          value={stats.predictionLabelCounts.fraudulent}
          valueClass="text-risk-critical"
        />
        <StatCard
          icon={ShieldCheck}
          label="Legitimate Predictions"
          value={stats.predictionLabelCounts.legitimate}
          valueClass="text-risk-low"
        />
      </div>

      <Card>
        <h2 className="mb-4 font-semibold text-slate-900 dark:text-white">Risk Category Breakdown</h2>
        <div className="grid grid-cols-4 gap-4 text-center">
          {(['Low', 'Medium', 'High', 'Critical'] as const).map((risk) => (
            <div key={risk} className="rounded-lg bg-slate-50 py-3 dark:bg-slate-800/50">
              <p className={`text-2xl font-bold tabular-nums ${RISK_COLORS[risk]}`}>{stats.riskCategoryCounts[risk]}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{risk}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 font-semibold text-slate-900 dark:text-white">Users</h2>
        <CardContent>
          {users.length === 0 ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Name</TableHeaderCell>
                  <TableHeaderCell>Email</TableHeaderCell>
                  <TableHeaderCell>Role</TableHeaderCell>
                  <TableHeaderCell>Joined</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u._id}>
                    <TableCell className="font-medium text-slate-900 dark:text-white">{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell className="capitalize">{u.role}</TableCell>
                    <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
