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

      {/* 3D Dashboard Mockup Showcase */}
      <motion.div
        variants={heroItem}
        initial="hidden"
        animate="show"
        className="relative mx-auto max-w-4xl perspective-1000 transform-style-3d my-12 hidden md:block"
      >
        {/* Ambient background glows */}
        <div className="absolute -inset-6 rounded-3xl bg-gradient-to-tr from-brand-400 to-indigo-500 opacity-20 blur-3xl animate-pulse-glow" />

        <div className="relative rounded-2xl border border-slate-200/80 bg-white/70 backdrop-blur-md shadow-2xl p-6 transform rotate-x-6 rotate-y--4 translate-z-10 animate-float dark:border-slate-800/80 dark:bg-slate-950/60">
          {/* Mock Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4 dark:border-slate-900">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 ml-2">JobShield-XAI Security Audit Portal</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-rose-50 text-[9px] font-bold text-rose-600 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30 uppercase tracking-wider">
              Sample Audit Dashboard
            </span>
          </div>

          {/* Grid Layout of Mock Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-soft dark:border-slate-900 dark:bg-slate-950">
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">BERT Probability</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-rose-600 dark:text-rose-400">92.4%</span>
                <span className="text-[10px] font-bold text-rose-500">High Risk</span>
              </div>
              <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 dark:bg-slate-800">
                <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: '92.4%' }} />
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-soft dark:border-slate-900 dark:bg-slate-950">
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Trust Score</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-red-600 dark:text-red-400">12%</span>
                <span className="text-[10px] font-semibold text-slate-500">Critical</span>
              </div>
              <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 dark:bg-slate-800">
                <div className="bg-red-500 h-1.5 rounded-full" style={{ width: '12%' }} />
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-soft dark:border-slate-900 dark:bg-slate-950">
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Risk Category</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-base font-black text-red-600 dark:text-red-400">CRITICAL RISK</span>
              </div>
              <span className="mt-3.5 block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Composite Engine Verified</span>
            </div>
          </div>

          {/* Explanation panel mockup */}
          <div className="rounded-xl border border-slate-150 bg-slate-50/50 p-4 dark:border-slate-900 dark:bg-slate-900/30 text-left">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-brand-500 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-wider">XAI Explanation (LIME local highlights)</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              This posting was flagged primarily because of <span className="bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 px-1.5 py-0.5 rounded font-medium">WhatsApp-only contact info</span>, the demand for a <span className="bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 px-1.5 py-0.5 rounded font-medium">registration deposit</span>, and the mismatched corporate domain sender.
            </p>
          </div>
        </div>
      </motion.div>

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
