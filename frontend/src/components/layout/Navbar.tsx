import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { logout as apiLogout } from '@/api/auth';
import { Button } from '@/components/ui/Button';

export function Navbar() {
  const { user, clearSession } = useAuthStore();
  const navigate = useNavigate();

  async function handleLogout() {
    await apiLogout().catch(() => {});
    clearSession();
    navigate('/');
  }

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
        <Link to="/" className="text-lg font-bold text-brand-600">
          FraudGuard
        </Link>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm sm:gap-x-4">
          <Link to="/analyze" className="text-slate-600 hover:text-brand-600 dark:text-slate-300">
            Analyze
          </Link>
          <Link to="/about" className="text-slate-600 hover:text-brand-600 dark:text-slate-300">
            About
          </Link>
          {user && (
            <Link to="/history" className="text-slate-600 hover:text-brand-600 dark:text-slate-300">
              History
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" className="text-slate-600 hover:text-brand-600 dark:text-slate-300">
              Admin
            </Link>
          )}
          {user ? (
            <>
              <Link to="/profile" className="text-slate-600 hover:text-brand-600 dark:text-slate-300">
                {user.name}
              </Link>
              <Button variant="ghost" onClick={handleLogout} className="!px-3 !py-1.5">
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-slate-600 hover:text-brand-600 dark:text-slate-300">
                Log in
              </Link>
              <Link to="/register">
                <Button className="!px-3 !py-1.5">Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
