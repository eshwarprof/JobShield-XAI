import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { login } from '@/api/auth';
import { getApiErrorMessage } from '@/api/client';
import { useAuthStore } from '@/store/authStore';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const { user, accessToken } = await login(email, password);
      setSession(user, accessToken);
      navigate('/analyze');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Invalid email or password.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md animate-fade-in-up">
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/40">
          <ShieldCheck className="h-5 w-5 text-brand-600 dark:text-brand-400" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Log in to view your analysis history.</p>
      </div>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            name="email"
            icon={<Mail className="h-4 w-4" aria-hidden="true" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            name="password"
            icon={<Lock className="h-4 w-4" aria-hidden="true" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <Alert variant="error">{error}</Alert>}
          <Button type="submit" isLoading={isSubmitting} className="w-full">
            Log in
          </Button>
        </form>
      </Card>
      <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
        Don't have an account?{' '}
        <Link to="/register" className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
          Sign up
        </Link>
      </p>
      <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
        <Link to="/analyze" className="text-brand-600 hover:text-brand-700 dark:text-brand-400">
          Continue without an account
        </Link>
      </p>
    </div>
  );
}
