import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h1 className="text-4xl font-bold text-slate-900 dark:text-white">404</h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400">This page doesn't exist.</p>
      <Link to="/" className="mt-6">
        <Button>Go home</Button>
      </Link>
    </div>
  );
}
