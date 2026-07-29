import { Link } from 'react-router-dom';
import { ArrowRight, FileSearch, MessageSquareText, ScanSearch, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const STEPS: { title: string; body: string; icon: LucideIcon }[] = [
  { title: 'Submit', body: 'Paste text, a URL, or upload a PDF/screenshot of the job advertisement.', icon: MessageSquareText },
  { title: 'Analyze', body: 'A fine-tuned BERT model, plus rule-based trust and severity engines, assess it.', icon: ScanSearch },
  { title: 'Understand', body: 'SHAP and LIME explain exactly why — no black-box verdict.', icon: FileSearch },
  { title: 'Decide', body: 'Get a risk category and concrete, actionable recommendations.', icon: Sparkles },
];

export function LandingPage() {
  return (
    <div className="space-y-20">
      <section className="animate-fade-in-up py-8 text-center sm:py-14">
        <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-soft dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          <Sparkles className="h-3.5 w-3.5 text-brand-500" aria-hidden="true" />
          Explainable AI, not a black box
        </span>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          Know if a job posting is real —{' '}
          <span className="text-brand-600 dark:text-brand-400">and understand exactly why</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
          An explainable AI framework that detects fake job advertisements and backs every prediction with a
          trust score, risk category, and a transparent, human-readable explanation.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/analyze">
            <Button size="lg" className="w-full sm:w-auto">
              Analyze a Job Posting
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </Link>
          <Link to="/about">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              How it works
            </Button>
          </Link>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, i) => (
          <Card key={step.title} className="transition-shadow duration-200 hover:shadow-soft-md">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900/40">
                <step.icon className="h-4 w-4 text-brand-600 dark:text-brand-400" aria-hidden="true" />
              </div>
              <span className="text-xs font-semibold text-slate-300 dark:text-slate-600">0{i + 1}</span>
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white">{step.title}</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{step.body}</p>
          </Card>
        ))}
      </section>
    </div>
  );
}
