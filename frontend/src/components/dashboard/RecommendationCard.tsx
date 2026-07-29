import type { RiskCategory } from '@/types';

const RISK_BORDER: Record<RiskCategory, string> = {
  Low: 'border-l-risk-low',
  Medium: 'border-l-risk-medium',
  High: 'border-l-risk-high',
  Critical: 'border-l-risk-critical',
};

export function RecommendationCard({
  riskCategory,
  recommendations,
  warnings,
}: {
  riskCategory: RiskCategory;
  recommendations: string[];
  warnings: string[];
}) {
  return (
    <div className={`rounded-lg border-l-4 bg-slate-50 p-4 dark:bg-slate-800/50 ${RISK_BORDER[riskCategory]}`}>
      <h3 className="font-semibold text-slate-900 dark:text-white">Recommendation</h3>
      <ul className="mt-2 space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
        {recommendations.map((rec, i) => (
          <li key={i} className="flex gap-2">
            <span>•</span>
            <span>{rec}</span>
          </li>
        ))}
      </ul>

      {warnings.length > 0 && (
        <>
          <h4 className="mt-4 font-semibold text-risk-critical">Warnings</h4>
          <ul className="mt-2 space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
            {warnings.map((warning, i) => (
              <li key={i} className="flex gap-2">
                <span>⚠</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
