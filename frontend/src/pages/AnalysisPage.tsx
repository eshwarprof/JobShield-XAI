import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { AnalysisDashboard } from '@/components/dashboard/AnalysisDashboard';
import { submitFile, submitText, submitUrl } from '@/api/analysis';
import { getApiErrorMessage } from '@/api/client';
import type { Analysis } from '@/types';

type Mode = 'text' | 'url' | 'pdf' | 'image';

const MODES: { key: Mode; label: string }[] = [
  { key: 'text', label: 'Text' },
  { key: 'url', label: 'URL' },
  { key: 'pdf', label: 'PDF Upload' },
  { key: 'image', label: 'Image Upload' },
];

export function AnalysisPage() {
  const [mode, setMode] = useState<Mode>('text');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Analysis | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      let analysis: Analysis;
      if (mode === 'text') {
        if (!text.trim()) throw new Error('Please paste the job advertisement text.');
        analysis = await submitText(text);
      } else if (mode === 'url') {
        if (!url.trim()) throw new Error('Please enter a job advertisement URL.');
        analysis = await submitUrl(url);
      } else {
        if (!file) throw new Error(`Please choose a ${mode.toUpperCase()} file.`);
        analysis = await submitFile(mode, file);
      }
      setResult(analysis);
    } catch (err) {
      setError(err instanceof Error && !('response' in err) ? err.message : getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  function reset() {
    setResult(null);
    setText('');
    setUrl('');
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  if (result) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Analysis Result</h1>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={reset}>
              Analyze another
            </Button>
            <Button variant="secondary" onClick={() => navigate('/history')}>
              View history
            </Button>
          </div>
        </div>
        <AnalysisDashboard analysis={result} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">Analyze a Job Advertisement</h1>
      <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
        Paste text, provide a URL, or upload a PDF/screenshot — every mode goes through the same analysis.
      </p>

      <Card>
        <div className="mb-6 flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800" role="tablist">
          {MODES.map((m) => (
            <button
              key={m.key}
              type="button"
              role="tab"
              aria-selected={mode === m.key}
              onClick={() => setMode(m.key)}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                mode === m.key
                  ? 'bg-white text-brand-600 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'text' && (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste the full job advertisement here..."
              rows={10}
              className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
          )}
          {mode === 'url' && (
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/careers/job-123"
              className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
          )}
          {(mode === 'pdf' || mode === 'image') && (
            <input
              ref={fileInputRef}
              type="file"
              accept={mode === 'pdf' ? 'application/pdf' : 'image/*'}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full rounded-lg border border-dashed border-slate-300 p-6 text-sm dark:border-slate-600"
            />
          )}

          {error && <p className="text-sm text-risk-critical">{error}</p>}

          <Button type="submit" isLoading={isSubmitting} className="w-full">
            {isSubmitting ? 'Analyzing...' : 'Analyze'}
          </Button>
        </form>
      </Card>

      {isSubmitting && <Spinner label="Running preprocessing, classification, and explainability..." />}
    </div>
  );
}
