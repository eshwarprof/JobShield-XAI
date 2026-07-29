import type { ReactNode } from 'react';
import { Navbar } from '@/components/layout/Navbar';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">{children}</main>
      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
        Explainable Fake Job Advertisement Detection Framework — SDC-II project. Not a substitute for your own
        judgment; always independently verify an employer before applying or paying anything.
      </footer>
    </div>
  );
}
