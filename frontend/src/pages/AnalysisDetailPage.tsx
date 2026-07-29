import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
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

  return (
    <div className="space-y-4">
      <Link
        to="/history"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to history
      </Link>
      <h1 className="text-xl font-bold text-slate-900 dark:text-white">Analysis Details</h1>
      {error && <Alert variant="error">{error}</Alert>}
      {!error && !analysis && <Spinner label="Loading analysis..." />}
      {analysis && <AnalysisDashboard analysis={analysis} />}
    </div>
  );
}
