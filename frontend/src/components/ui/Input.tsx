import { forwardRef } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, id, className, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            className={cn(
              'h-10 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 outline-none transition-colors',
              'placeholder:text-slate-400',
              'focus:border-brand-500 focus:ring-4 focus:ring-brand-100',
              'dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-brand-900/40',
              error
                ? 'border-red-400 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-900/30'
                : 'border-slate-300 dark:border-slate-600',
              icon && 'pl-9',
              className
            )}
            {...props}
          />
        </div>
        {error && <span className="text-xs text-risk-critical">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';
