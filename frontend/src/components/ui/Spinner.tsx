export function Spinner({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-slate-500 dark:text-slate-400">
      <span className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
