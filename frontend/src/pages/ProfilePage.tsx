import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { logoutAll } from '@/api/auth';

export function ProfilePage() {
  const { user, clearSession } = useAuthStore();
  const navigate = useNavigate();

  async function handleLogoutAll() {
    await logoutAll().catch(() => {});
    clearSession();
    navigate('/');
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">Profile</h1>
      <Card className="space-y-4">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Name</p>
          <p className="font-medium text-slate-900 dark:text-white">{user.name}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
          <p className="font-medium text-slate-900 dark:text-white">{user.email}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Role</p>
          <p className="font-medium capitalize text-slate-900 dark:text-white">{user.role}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Member since</p>
          <p className="font-medium text-slate-900 dark:text-white">
            {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
        <Button variant="danger" onClick={handleLogoutAll} className="w-full">
          Log out of all devices
        </Button>
      </Card>
    </div>
  );
}
