import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, Mail, Lock, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { forgotPassword, resetPassword } from '@/api/auth';
import { getApiErrorMessage } from '@/api/client';

type Step = 'email' | 'reset' | 'success';

export function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const res = await forgotPassword(email);
      toast.success(res.message || 'OTP sent successfully!');
      setStep('reset');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (!otp.trim()) {
      setError('OTP is required.');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword({ email, otp: otp.trim(), password });
      toast.success('Password reset successfully!');
      setStep('success');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  if (step === 'success') {
    return (
      <div className="mx-auto max-w-md animate-fade-in-up text-center">
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Password Reset</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Your password has been updated successfully.
          </p>
        </div>
        <Card>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            You can now log in to your account with your new password.
          </p>
          <Button onClick={() => navigate('/login')} className="w-full">
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md animate-fade-in-up">
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/40">
          <KeyRound className="h-5 w-5 text-brand-600 dark:text-brand-400" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {step === 'email' ? 'Forgot Password' : 'Reset Password'}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {step === 'email'
            ? "Enter your email address and we'll send you an OTP code to verify your identity."
            : 'Enter the 6-digit OTP code sent to your email and choose a new password.'}
        </p>
      </div>

      <Card>
        {step === 'email' ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              required
              icon={<Mail className="h-4 w-4" aria-hidden="true" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            {error && <Alert variant="error">{error}</Alert>}
            <Button type="submit" isLoading={isLoading} className="w-full">
              Send OTP Code
            </Button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              disabled
              icon={<Mail className="h-4 w-4" aria-hidden="true" />}
              value={email}
            />
            <Input
              label="OTP Code (6 digits)"
              type="text"
              required
              maxLength={6}
              placeholder="e.g. 123456"
              icon={<KeyRound className="h-4 w-4" aria-hidden="true" />}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <Input
              label="New Password"
              type="password"
              required
              minLength={8}
              placeholder="Minimum 8 characters"
              icon={<Lock className="h-4 w-4" aria-hidden="true" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              label="Confirm New Password"
              type="password"
              required
              minLength={8}
              placeholder="Re-enter password"
              icon={<Lock className="h-4 w-4" aria-hidden="true" />}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {error && <Alert variant="error">{error}</Alert>}
            <Button type="submit" isLoading={isLoading} className="w-full">
              Reset Password
            </Button>
          </form>
        )}
      </Card>

      <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
        Remembered your password?{' '}
        <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
          Log in
        </Link>
      </p>
    </div>
  );
}
