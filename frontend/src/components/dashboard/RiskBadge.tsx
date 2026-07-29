import type { RiskCategory } from '@/types';

// IR-3: risk categories are color-coded consistently across the app.
const RISK_STYLES: Record<RiskCategory, string> = {
  Low: 'bg-risk-low-bg text-risk-low',
  Medium: 'bg-risk-medium-bg text-risk-medium',
  High: 'bg-risk-high-bg text-risk-high',
  Critical: 'bg-risk-critical-bg text-risk-critical',
};

export function RiskBadge({ category, size = 'md' }: { category: RiskCategory; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = size === 'lg' ? 'px-4 py-2 text-base' : size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  return (
    <span className={`inline-flex items-center rounded-full font-semibold ${RISK_STYLES[category]} ${sizeClasses}`}>
      {category} Risk
    </span>
  );
}
