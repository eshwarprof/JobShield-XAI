import { useEffect, useRef, useState } from 'react';
import type { DragEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Image as ImageIcon, Link2, Type, UploadCloud, X, Cpu } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { submitFile, submitText, submitUrl } from '@/api/analysis';
import { getApiErrorMessage } from '@/api/client';
import { cn } from '@/lib/cn';
import type { Analysis } from '@/types';

type Mode = 'text' | 'url' | 'pdf' | 'image';

const MODES: { key: Mode; label: string; icon: typeof Type }[] = [
  { key: 'text', label: 'Text Input', icon: Type },
  { key: 'url', label: 'URL Scanner', icon: Link2 },
  { key: 'pdf', label: 'PDF Document', icon: FileText },
  { key: 'image', label: 'Image/Screenshot', icon: ImageIcon },
];

const STATUS_MESSAGES = [
  "Tokenizing text and performing lexical sanitization...",
  "Running fine-tuned BERT transformer neural network...",
  "Synthesizing LIME localized word influence features...",
  "Querying Wikipedia and verifying sender authority..."
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
  const [statusIndex, setStatusIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (isSubmitting) {
      const interval = setInterval(() => {
        setStatusIndex((prev) => (prev < STATUS_MESSAGES.length - 1 ? prev + 1 : prev));
      }, 2000);
      return () => clearInterval(interval);
    } else {
      setStatusIndex(0);
    }
  }, [isSubmitting]);

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
      navigate(`/analyze/${analysis._id}`, { state: { fresh: true } });
    } catch (err) {
      setError(err instanceof Error && !('response' in err) ? err.message : getApiErrorMessage(err));
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative mx-auto max-w-2xl animate-fade-in-up space-y-6">
      {/* Ambient background glows */}
      <div className="absolute -inset-10 rounded-3xl bg-gradient-to-tr from-brand-400 to-indigo-500 opacity-10 blur-3xl animate-pulse-glow pointer-events-none" />

      <div className="text-center md:text-left">
        <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl bg-gradient-to-r from-slate-900 via-slate-800 to-brand-600 bg-clip-text text-transparent dark:from-white dark:via-slate-100 dark:to-brand-400">
          Analyze a Job Advertisement
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Upload listings via text, URL, PDF, or screenshots to compute composite safety audits and feature predictions.
        </p>
      </div>

      <Card className="card-3d-hover relative overflow-hidden border border-slate-200/80 bg-white/70 backdrop-blur-md shadow-2xl p-6 dark:border-slate-800/80 dark:bg-slate-950/60">
        
        {/* Holographic scanner visual overlay when submitting */}
        {isSubmitting && (
          <div className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-md rounded-xl flex flex-col items-center justify-center p-6 text-center animate-fade-in text-white">
            {/* Pulsing beam selector */}
            <div className="relative h-24 w-24 mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-dashed border-brand-500 animate-spin" style={{ animationDuration: '8s' }} />
              <div className="absolute inset-2 rounded-full border-2 border-brand-400 opacity-60 animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse' }} />
              <div className="absolute inset-4 rounded-full bg-brand-500/10 flex items-center justify-center">
                <Cpu className="h-8 w-8 text-brand-400 animate-pulse" />
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-lg font-black uppercase tracking-widest text-brand-400">Audit in Progress</h3>
              <div className="flex justify-center gap-1.5 py-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-brand-400 [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-brand-400 [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-brand-400" />
              </div>
              <p className="text-sm font-semibold text-slate-200 mt-2 max-w-sm h-6 transition-all duration-300">
                {STATUS_MESSAGES[statusIndex]}
              </p>
            </div>
          </div>
        )}

        <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
          <TabsList className="mb-6 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-1">
            {MODES.map((m) => (
              <TabsTrigger key={m.key} value={m.key} className="rounded-lg py-2">
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
                className="bg-white/50 dark:bg-slate-900/50"
              />
            </TabsContent>
            <TabsContent value="url">
              <Input
                label="Job posting URL"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/careers/job-123"
                icon={<Link2 className="h-4 w-4" aria-hidden="true" />}
                className="bg-white/50 dark:bg-slate-900/50"
              />
            </TabsContent>
            <TabsContent value="pdf">
              <FileDropzone file={file} accept="application/pdf" hint="PDF, up to 10MB" onChange={setFile} />
            </TabsContent>
            <TabsContent value="image">
              <FileDropzone file={file} accept="image/*" hint="PNG or JPG, up to 5MB" onChange={setFile} />
            </TabsContent>

            {error && <Alert variant="error">{error}</Alert>}

            <Button type="submit" isLoading={isSubmitting} className="w-full h-11 text-base font-bold shadow-soft">
              {isSubmitting ? 'Running Security Engine...' : 'Run Security Audit'}
            </Button>
          </form>
        </Tabs>
      </Card>
    </div>
  );
}
