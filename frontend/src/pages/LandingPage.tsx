import { Link } from 'react-router-dom';
import { motion, type Variants } from 'motion/react';
import { ArrowDown, ArrowRight, FileSearch, MessageSquareText, ScanSearch, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const STEPS: { title: string; body: string; icon: LucideIcon }[] = [
  { title: 'Upload', body: 'Paste text, a URL, or upload a PDF/screenshot of the job advertisement.', icon: MessageSquareText },
  { title: 'AI Analysis', body: 'A fine-tuned BERT model, plus rule-based trust and severity engines, assess it.', icon: ScanSearch },
  { title: 'Explainability', body: 'SHAP and LIME explain exactly why — no black-box verdict.', icon: FileSearch },
  { title: 'Decision', body: 'Get a risk category and concrete, actionable recommendations.', icon: Sparkles },
];

const heroContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const heroItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export function LandingPage() {
  return (
    <div className="space-y-20">
      <motion.section
        variants={heroContainer}
        initial="hidden"
        animate="show"
        className="py-8 text-center sm:py-14"
      >
        <motion.span
          variants={heroItem}
          className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-soft dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        >
          <Sparkles className="h-3.5 w-3.5 text-brand-500" aria-hidden="true" />
          Explainable AI, not a black box
        </motion.span>
        <motion.h1
          variants={heroItem}
          className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl"
        >
          Know if a job posting is real —{' '}
          <span className="text-brand-600 dark:text-brand-400">and understand exactly why</span>
        </motion.h1>
        <motion.p variants={heroItem} className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
          An explainable AI framework that detects fake job advertisements and backs every prediction with a
          trust score, risk category, and a transparent, human-readable explanation.
        </motion.p>
        <motion.div variants={heroItem} className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
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
        </motion.div>
      </motion.section>

      <section>
        <h2 className="mb-8 text-center text-sm font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          From posting to decision, in one pass
        </h2>
        {/* A connected pipeline, not a feature grid: each stage flows into the
            next (row + arrows on desktop, column + arrows on mobile) so the
            sequence itself communicates the product's actual data flow. */}
        <motion.div
          variants={heroContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="flex flex-col items-stretch gap-2 lg:flex-row lg:items-start lg:gap-0"
        >
          {STEPS.map((step, i) => (
            <motion.div variants={heroItem} key={step.title} className="flex flex-1 flex-col items-center lg:flex-row">
              <div className="flex w-full flex-col items-center rounded-xl border border-slate-200 bg-white p-5 text-center shadow-soft transition-shadow duration-200 hover:shadow-soft-md dark:border-slate-800 dark:bg-slate-900">
                <div className="relative mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/40">
                  <step.icon className="h-5 w-5 text-brand-600 dark:text-brand-400" aria-hidden="true" />
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white dark:bg-brand-500">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white">{step.title}</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{step.body}</p>
              </div>
              {i < STEPS.length - 1 && (
                <>
                  <ArrowDown className="my-1 h-4 w-4 shrink-0 text-slate-300 dark:text-slate-600 lg:hidden" aria-hidden="true" />
                  <ArrowRight
                    className="mx-2 hidden h-4 w-4 shrink-0 self-center text-slate-300 dark:text-slate-600 lg:block"
                    aria-hidden="true"
                  />
                </>
              )}
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}
