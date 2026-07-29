import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { RiskBadge } from '@/components/dashboard/RiskBadge';
import { listHistory } from '@/api/analysis';
import { getApiErrorMessage } from '@/api/client';
import type { Analysis, RiskCategory } from '@/types';

const RISK_OPTIONS: (RiskCategory | 'All')[] = ['All', 'Low', 'Medium', 'High', 'Critical'];

export function HistoryPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [riskFilter, setRiskFilter] = useState<RiskCategory | 'All'>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    listHistory(riskFilter === 'All' ? {} : { riskCategory: riskFilter })
      .then((data) => setAnalyses(data.analyses))
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, [riskFilter]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analysis History</h1>
        <select
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value as RiskCategory | 'All')}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
        >
          {RISK_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt === 'All' ? 'All risk levels' : `${opt} risk`}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <Spinner />}
      {error && <p className="text-sm text-risk-critical">{error}</p>}

      {!isLoading && !error && analyses.length === 0 && (
        <Card>
          <p className="text-center text-slate-500 dark:text-slate-400">
            No analyses yet. <Link to="/analyze" className="text-brand-600">Analyze your first job posting</Link>.
          </p>
        </Card>
      )}

      <div className="space-y-3">
        {analyses.map((a) => (
          <Link key={a._id} to={`/analyze/${a._id}`}>
            <Card className="flex items-center justify-between transition-shadow hover:shadow-md">
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  {a.sourceReference.length > 80 ? a.sourceReference.slice(0, 80) + '...' : a.sourceReference}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {a.inputType.toUpperCase()} • {new Date(a.createdAt).toLocaleString()}
                </p>
              </div>
              <RiskBadge category={a.riskCategory} />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
