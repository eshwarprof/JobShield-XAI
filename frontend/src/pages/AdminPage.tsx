import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Activity,
  Search,
  ShieldCheck,
  ShieldX,
  Users,
  UserCog,
  Trash2,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { Skeleton } from '@/components/ui/Skeleton';
import { Input } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { RiskBadge } from '@/components/dashboard/RiskBadge';

import { getAdminStats, listAdminUsers, listAdminAnalyses, updateUserRole, deleteUser } from '@/api/admin';
import { getApiErrorMessage } from '@/api/client';
import { useAuthStore } from '@/store/authStore';


const RISK_COLORS: Record<string, string> = {
  Low: 'text-risk-low',
  Medium: 'text-risk-medium',
  High: 'text-risk-high',
  Critical: 'text-risk-critical',
};

const INPUT_TYPE_COLORS: Record<string, string> = {
  text: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  url: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  pdf: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  image: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};

// The backend's max accepted page size
const USERS_PAGE_SIZE = 100;
const ANALYSES_PAGE_SIZE = 20;

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

function StatCardSkeleton() {
  return (
    <Card>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-12" />
        </div>
      </div>
    </Card>
  );
}

export function AdminPage() {
  const currentUser = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'users' | 'analyses'>('users');
  const [usersPage, setUsersPage] = useState(1);
  const [analysesPage, setAnalysesPage] = useState(1);
  const [userSearch, setUserSearch] = useState('');
  const [isMutating, setIsMutating] = useState<string | null>(null);

  const statsQuery = useQuery({ queryKey: ['admin', 'stats'], queryFn: getAdminStats });
  
  const usersQuery = useQuery({
    queryKey: ['admin', 'users', usersPage],
    queryFn: () => listAdminUsers(usersPage, USERS_PAGE_SIZE),
    placeholderData: (previous) => previous,
  });

  const analysesQuery = useQuery({
    queryKey: ['admin', 'analyses', analysesPage],
    queryFn: () => listAdminAnalyses(analysesPage, ANALYSES_PAGE_SIZE),
    placeholderData: (previous) => previous,
    enabled: activeTab === 'analyses', // Only fetch analyses when tab is active
  });

  const error = statsQuery.error ?? (activeTab === 'users' ? usersQuery.error : analysesQuery.error);
  if (error) return <Alert variant="error">{getApiErrorMessage(error)}</Alert>;

  const stats = statsQuery.data;
  const allUsers = usersQuery.data?.users ?? [];
  const usersPagination = usersQuery.data?.pagination;

  const allAnalyses = analysesQuery.data?.analyses ?? [];
  const analysesPagination = analysesQuery.data?.pagination;

  // Client-side only filtering for users in the loaded page
  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return allUsers;
    return allUsers.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [allUsers, userSearch]);

  async function handleToggleRole(userId: string, currentRole: 'user' | 'admin') {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;

    setIsMutating(userId);
    try {
      await updateUserRole(userId, newRole);
      toast.success('User role updated successfully');
      usersQuery.refetch();
      statsQuery.refetch();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setIsMutating(null);
    }
  }

  async function handleDeleteUser(userId: string) {
    if (!window.confirm('Are you sure you want to delete this user? ALL of their associated analyses will also be permanently deleted.')) return;

    setIsMutating(userId);
    try {
      await deleteUser(userId);
      toast.success('User and associated analyses deleted successfully');
      usersQuery.refetch();
      statsQuery.refetch();
      if (activeTab === 'analyses') {
        analysesQuery.refetch();
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setIsMutating(null);
    }
  }

  return (
    <div className="animate-fade-in-up space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsQuery.isPending || !stats ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
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
          </>
        )}
      </div>

      <Card>
        <h2 className="mb-4 font-semibold text-slate-900 dark:text-white">Risk Category Breakdown</h2>
        {statsQuery.isPending || !stats ? (
          <Skeleton className="h-16 w-full" />
        ) : (
          <div className="grid grid-cols-4 gap-4 text-center">
            {(['Low', 'Medium', 'High', 'Critical'] as const).map((risk) => (
              <div key={risk} className="rounded-lg bg-slate-50 py-3 dark:bg-slate-800/50">
                <p className={`text-2xl font-bold tabular-nums ${RISK_COLORS[risk]}`}>{stats.riskCategoryCounts[risk]}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{risk}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'users' | 'analyses')}>
        <TabsList className="mb-6 max-w-md">
          <TabsTrigger value="users">
            <Users className="h-4 w-4" />
            <span>User Management</span>
          </TabsTrigger>
          <TabsTrigger value="analyses">
            <Activity className="h-4 w-4" />
            <span>Analyses Audit Log</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-semibold text-slate-900 dark:text-white">Users</h2>
              <div className="w-full max-w-xs">
                <Input
                  label="Search users"
                  placeholder="Search by name or email..."
                  icon={<Search className="h-4 w-4" aria-hidden="true" />}
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
            </div>
            <CardContent>
              {usersQuery.isPending ? (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <EmptyState icon={Search} title="No matching users" description="Try a different name or email." />
              ) : (
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell>Name</TableHeaderCell>
                      <TableHeaderCell>Email</TableHeaderCell>
                      <TableHeaderCell>Role</TableHeaderCell>
                      <TableHeaderCell>Joined</TableHeaderCell>
                      <TableHeaderCell className="text-right">Actions</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.map((u) => {
                      const isSelf = u._id === currentUser?._id;
                      return (
                        <TableRow key={u._id}>
                          <TableCell className="font-medium text-slate-900 dark:text-white">
                            {u.name} {isSelf && <span className="ml-1 text-xs text-brand-600 font-normal">(You)</span>}
                          </TableCell>
                          <TableCell>{u.email}</TableCell>
                          <TableCell className="capitalize">{u.role}</TableCell>
                          <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleRole(u._id, u.role)}
                                disabled={isSelf || isMutating !== null}
                                isLoading={isMutating === u._id}
                                title={isSelf ? "You cannot demote yourself" : "Change User Role"}
                              >
                                <UserCog className="h-3.5 w-3.5" />
                                <span className="hidden md:inline">Change Role</span>
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDeleteUser(u._id)}
                                disabled={isSelf || isMutating !== null}
                                isLoading={isMutating === u._id}
                                title={isSelf ? "You cannot delete yourself" : "Delete User Account"}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
              {usersPagination && !userSearch && (
                <Pagination
                  page={usersPagination.page}
                  pages={usersPagination.pages}
                  onPageChange={setUsersPage}
                  isFetching={usersQuery.isFetching}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analyses">
          <Card>
            <div className="mb-4">
              <h2 className="font-semibold text-slate-900 dark:text-white">Global Analysis Log</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Audit every advertisement processed by users on the platform.
              </p>
            </div>
            <CardContent>
              {analysesQuery.isPending ? (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ) : allAnalyses.length === 0 ? (
                <EmptyState icon={AlertTriangle} title="No analyses found" description="No analyses have been logged in the system yet." />
              ) : (
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell>Analyzed By</TableHeaderCell>
                      <TableHeaderCell>Input Type</TableHeaderCell>
                      <TableHeaderCell>Source Reference</TableHeaderCell>
                      <TableHeaderCell>Risk Category</TableHeaderCell>
                      <TableHeaderCell>Prediction</TableHeaderCell>
                      <TableHeaderCell>Date</TableHeaderCell>
                      <TableHeaderCell className="text-right">Report</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {allAnalyses.map((a) => (
                      <TableRow key={a._id}>
                        <TableCell>
                          {a.userId ? (
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">{a.userId.name}</p>
                              <p className="text-xs text-slate-500">{a.userId.email}</p>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Anonymous</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={`capitalize ${INPUT_TYPE_COLORS[a.inputType]}`}>
                            {a.inputType}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[180px] truncate" title={a.sourceReference}>
                          {a.sourceReference}
                        </TableCell>
                        <TableCell>
                          <RiskBadge category={a.riskCategory} size="sm" />
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              a.predictionLabel === 'fraudulent'
                                ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                : 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            }
                          >
                            {a.predictionLabel}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(a.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => navigate(`/analyze/${a._id}`)}>
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              {analysesPagination && (
                <Pagination
                  page={analysesPagination.page}
                  pages={analysesPagination.pages}
                  onPageChange={setAnalysesPage}
                  isFetching={analysesQuery.isFetching}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
