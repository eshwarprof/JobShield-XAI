import { useRef, useState } from 'react';
import type { DragEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, History, Image as ImageIcon, Link2, RotateCcw, Type, UploadCloud, X } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Alert } from '@/components/ui/Alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { AnalysisDashboard } from '@/components/dashboard/AnalysisDashboard';
import { submitFile, submitText, submitUrl } from '@/api/analysis';
import { getApiErrorMessage } from '@/api/client';
import { cn } from '@/lib/cn';
import type { Analysis } from '@/types';

type Mode = 'text' | 'url' | 'pdf' | 'image';

const MODES: { key: Mode; label: string; icon: typeof Type }[] = [
  { key: 'text', label: 'Text', icon: Type },
  { key: 'url', label: 'URL', icon: Link2 },
  { key: 'pdf', label: 'PDF Upload', icon: FileText },
  { key: 'image', label: 'Image Upload', icon: ImageIcon },
];

function FileDropzone({
  file,
  accept,
  hint,
  onChange,
}: {
  file: File | null;
  accept: string;
  hint: string;
  onChange: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) onChange(dropped);
  }

  if (file) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
        <div className="flex min-w-0 items-center gap-2.5">
          <FileText className="h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
          <span className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">{file.name}</span>
        </div>
        <button
          type="button"
          onClick={() => {
            onChange(null);
            if (inputRef.current) inputRef.current.value = '';
          }}
          className="rounded-md p-1 text-slate-400 outline-none transition-colors hover:bg-slate-200 hover:text-slate-600 focus-visible:ring-2 focus-visible:ring-brand-500 dark:hover:bg-slate-700 dark:hover:text-slate-200"
          aria-label="Remove file"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={cn(
        'flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors',
        isDragging
          ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/20'
          : 'border-slate-300 hover:border-slate-400 dark:border-slate-600 dark:hover:border-slate-500'
      )}
    >
      <UploadCloud className="h-6 w-6 text-slate-400" aria-hidden="true" />
      <span className="text-sm text-slate-600 dark:text-slate-300">
        <span className="font-medium text-brand-600 dark:text-brand-400">Click to upload</span> or drag and drop
      </span>
      <span className="text-xs text-slate-400 dark:text-slate-500">{hint}</span>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        className="hidden"
      />
    </label>
  );
}

export function AnalysisPage() {
  const [mode, setMode] = useState<Mode>('text');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Analysis | null>(null);
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
  }

  if (result) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Analysis Result</h1>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={reset}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Analyze another
            </Button>
            <Button variant="secondary" size="sm" onClick={() => navigate('/history')}>
              <History className="h-4 w-4" aria-hidden="true" />
              View history
            </Button>
          </div>
        </div>
        <AnalysisDashboard analysis={result} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl animate-fade-in-up">
      <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">Analyze a Job Advertisement</h1>
      <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
        Paste text, provide a URL, or upload a PDF/screenshot — every mode goes through the same analysis.
      </p>

      <Card>
        <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
          <TabsList className="mb-6">
            {MODES.map((m) => (
              <TabsTrigger key={m.key} value={m.key}>
                <m.icon className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">{m.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-4">
            <TabsContent value="text">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste the full job advertisement here..."
                rows={10}
              />
            </TabsContent>
            <TabsContent value="url">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/careers/job-123"
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-brand-900/40"
              />
            </TabsContent>
            <TabsContent value="pdf">
              <FileDropzone file={file} accept="application/pdf" hint="PDF, up to 10MB" onChange={setFile} />
            </TabsContent>
            <TabsContent value="image">
              <FileDropzone file={file} accept="image/*" hint="PNG or JPG, up to 5MB" onChange={setFile} />
            </TabsContent>

            {error && <Alert variant="error">{error}</Alert>}

            <Button type="submit" isLoading={isSubmitting} className="w-full">
              {isSubmitting ? 'Analyzing...' : 'Analyze'}
            </Button>
          </form>
        </Tabs>
      </Card>

      {isSubmitting && (
        <div className="mt-6 flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
          <div className="flex gap-1">
            <span className="h-2 w-2 animate-bounce rounded-full bg-brand-500 [animation-delay:-0.3s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-brand-500 [animation-delay:-0.15s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-brand-500" />
          </div>
          <span className="text-sm">Running preprocessing, classification, and explainability...</span>
        </div>
      )}
    </div>
  );
}
