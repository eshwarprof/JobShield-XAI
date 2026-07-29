import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Spinner } from '@/components/ui/Spinner';
import { AnalysisDashboard } from '@/components/dashboard/AnalysisDashboard';
import { getAnalysisById } from '@/api/analysis';
import { getApiErrorMessage } from '@/api/client';
import type { Analysis } from '@/types';

/** UC-5/UC-6: reopen a specific past analysis. */
export function AnalysisDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getAnalysisById(id)
      .then(setAnalysis)
      .catch((err) => setError(getApiErrorMessage(err, 'Could not load this analysis.')));
  }, [id]);

  if (error) return <p className="text-sm text-risk-critical">{error}</p>;
  if (!analysis) return <Spinner label="Loading analysis..." />;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-900 dark:text-white">Analysis Details</h1>
      <AnalysisDashboard analysis={analysis} />
    </div>
  );
}
