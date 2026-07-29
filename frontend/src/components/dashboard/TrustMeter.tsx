import type { TrustBand } from '@/types';

const BAND_COLOR: Record<TrustBand, string> = {
  'Highly Trustworthy': 'bg-risk-low',
  'Moderately Trustworthy': 'bg-risk-medium',
  Suspicious: 'bg-risk-high',
  'Very Low Trust': 'bg-risk-critical',
};

export function TrustMeter({ score, band }: { score: number; band: TrustBand }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Trust Score</span>
        <span className="text-2xl font-bold text-slate-900 dark:text-white">{score}/100</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={`h-full rounded-full transition-all ${BAND_COLOR[band]}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{band}</p>
    </div>
  );
}
