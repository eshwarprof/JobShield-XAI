import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const STEPS = [
  { title: 'Submit', body: 'Paste text, a URL, or upload a PDF/screenshot of the job advertisement.' },
  { title: 'Analyze', body: 'A fine-tuned BERT model, plus rule-based trust and severity engines, assess it.' },
  { title: 'Understand', body: 'SHAP and LIME explain exactly why — no black-box verdict.' },
  { title: 'Decide', body: 'Get a risk category and concrete, actionable recommendations.' },
];

export function LandingPage() {
  return (
    <div className="space-y-16">
      <section className="py-12 text-center">
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          Know if a job posting is real —{' '}
          <span className="text-brand-600">and understand exactly why</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
          An explainable AI framework that detects fake job advertisements and backs every prediction with a
          trust score, risk category, and a transparent, human-readable explanation.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/analyze">
            <Button className="px-6 py-3 text-base">Analyze a Job Posting</Button>
          </Link>
          <Link to="/about">
            <Button variant="secondary" className="px-6 py-3 text-base">
              How it works
            </Button>
          </Link>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, i) => (
          <Card key={step.title}>
            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
              {i + 1}
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white">{step.title}</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{step.body}</p>
          </Card>
        ))}
      </section>
    </div>
  );
}
