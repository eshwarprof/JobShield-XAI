import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, LayoutDashboard, LogOut, Menu, ShieldCheck, User as UserIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { logout as apiLogout } from '@/api/auth';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { cn } from '@/lib/cn';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

const NAV_LINK_CLASS = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'text-brand-600 dark:text-brand-400'
      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
  );

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function Navbar() {
  const { user, clearSession } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  async function handleLogout() {
    await apiLogout().catch(() => {});
    clearSession();
    toast.success('Logged out');
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
          <ShieldCheck className="h-6 w-6 text-brand-600" aria-hidden="true" />
          JobShield-XAI
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <NavLink to="/" end className={NAV_LINK_CLASS}>
            <span className="inline-flex items-center gap-1.5">
              <Home className="h-4 w-4" aria-hidden="true" />
              Home
            </span>
          </NavLink>
          <NavLink to="/analyze" className={NAV_LINK_CLASS}>
            Analyze
          </NavLink>
          <NavLink to="/about" className={NAV_LINK_CLASS}>
            About
          </NavLink>
          {user && (
            <NavLink to="/history" className={NAV_LINK_CLASS}>
              History
            </NavLink>
          )}
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={NAV_LINK_CLASS}>
              Admin
            </NavLink>
          )}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 outline-none transition-colors hover:bg-brand-200 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:bg-brand-900/40 dark:text-brand-300"
                >
                  {initials(user.name)}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <UserIcon className="h-4 w-4" aria-hidden="true" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                {user.role === 'admin' && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin">
                      <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                      Admin dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleLogout}>
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/login" className={NAV_LINK_CLASS({ isActive: location.pathname === '/login' })}>
                Log in
              </Link>
              <Link to="/register">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          className="flex h-9 w-9 items-center justify-center rounded-md text-slate-600 outline-none transition-colors hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-slate-300 dark:hover:bg-slate-800 md:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-slate-200 px-4 py-3 dark:border-slate-800 md:hidden">
          <div className="flex flex-col gap-1">
            <div className="mb-1 flex items-center justify-between rounded-md px-3 py-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Theme</span>
              <ThemeToggle />
            </div>
            <NavLink to="/" end className={NAV_LINK_CLASS}>
              Home
            </NavLink>
            <NavLink to="/analyze" className={NAV_LINK_CLASS}>
              Analyze
            </NavLink>
            <NavLink to="/about" className={NAV_LINK_CLASS}>
              About
            </NavLink>
            {user && (
              <NavLink to="/history" className={NAV_LINK_CLASS}>
                History
              </NavLink>
            )}
            {user?.role === 'admin' && (
              <NavLink to="/admin" className={NAV_LINK_CLASS}>
                Admin
              </NavLink>
            )}
            {user ? (
              <>
                <NavLink to="/profile" className={NAV_LINK_CLASS}>
                  Profile ({user.name})
                </NavLink>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-md px-3 py-2 text-left text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={NAV_LINK_CLASS}>
                  Log in
                </NavLink>
                <NavLink to="/register" className={NAV_LINK_CLASS}>
                  Sign up
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
