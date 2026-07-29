import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
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
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-center text-2xl font-bold text-slate-900 dark:text-white">Log in</h1>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-sm text-risk-critical">{error}</p>}
          <Button type="submit" isLoading={isSubmitting} className="w-full">
            Log in
          </Button>
        </form>
      </Card>
      <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
        Don't have an account?{' '}
        <Link to="/register" className="font-medium text-brand-600">
          Sign up
        </Link>
      </p>
      <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
        <Link to="/analyze" className="text-brand-600">
          Continue without an account
        </Link>
      </p>
    </div>
  );
}
