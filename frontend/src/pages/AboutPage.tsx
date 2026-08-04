import { Gauge, Info, Sparkles, Cpu } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { RiskBadge } from '@/components/dashboard/RiskBadge';

/** SRS Section 2.6: an in-app help/about panel explaining trust score bands,
 * risk categories, and SHAP/LIME — redesigned to feature beautiful 3D aesthetics,
 * interactive card tilts, a pipeline diagram, and a risk matrix grid. */
export function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl animate-fade-in-up space-y-16">
      
      {/* Premium Animated Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-brand-900 to-slate-900 p-8 text-center text-white shadow-2xl sm:p-12">
        <div className="absolute -inset-10 rounded-3xl bg-gradient-to-tr from-brand-400 to-indigo-500 opacity-20 blur-3xl animate-pulse-glow" />
        <div className="relative z-10 mx-auto max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-500/20 px-3 py-1 text-xs font-semibold text-brand-300 border border-brand-500/30">
            <Cpu className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '6s' }} /> Explainable AI Framework
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-gradient-to-r from-white via-slate-100 to-brand-300 bg-clip-text text-transparent">
            How JobShield Works
          </h1>
          <p className="text-base text-slate-300 leading-relaxed">
            Discover the dual-engine architecture powering our explainable fake job detection platform. We combine fine-tuned BERT models with rule-based heuristics to deliver transparent, actionable safety verdicts.
          </p>
        </div>
      </div>

      {/* Visual Pipeline Flowchart */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white sm:text-2xl">The Detection Pipeline</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">How a posting flows through our system from raw input to clean verdict</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 relative">
          {/* Step 1 */}
          <div className="group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900 card-3d-hover">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 font-extrabold text-sm">1</div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Job Submission</h3>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Input raw job listing description, target company name, or recruiter's contact details.</p>
          </div>
          
          {/* Step 2 */}
          <div className="group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900 card-3d-hover">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 font-extrabold text-sm">2</div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">BERT Classification</h3>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">AI NLP network reads semantics, identifying lexical markers typical of fraudulent listings.</p>
          </div>

          {/* Step 3 */}
          <div className="group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900 card-3d-hover">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 font-extrabold text-sm">3</div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Rule-Based Audit</h3>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Verifies company website authority, checks registration fees, emails, and contact vectors.</p>
          </div>

          {/* Step 4 */}
          <div className="group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900 card-3d-hover">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 font-extrabold text-sm">4</div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">XAI & Decision</h3>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Generates LIME word highlights, composite risk categories, and direct warnings.</p>
          </div>
        </div>
      </section>

      {/* Main Core Concepts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Trust Score Card */}
        <Card className="card-3d-hover flex flex-col justify-between">
          <div>
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <div className="rounded-lg bg-brand-50 p-2 dark:bg-brand-950/40">
                  <Gauge className="h-5 w-5 text-brand-600 dark:text-brand-400" aria-hidden="true" />
                </div>
                <CardTitle className="text-lg">Reading the Trust Score</CardTitle>
              </div>
            </CardHeader>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              A 0–100 score, starting at 100, with points deducted for specific red flags: request of registration fees, personal email domains, missing company profiles, unrealistic salaries, or WhatsApp-only contacts.
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/40">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-slate-600 dark:text-slate-400 font-medium"><strong>80–100:</strong> High Trust</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="text-slate-600 dark:text-slate-400 font-medium"><strong>60–79:</strong> Moderate Trust</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                <span className="text-slate-600 dark:text-slate-400 font-medium"><strong>30–59:</strong> Suspicious</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-slate-600 dark:text-slate-400 font-medium"><strong>0–29:</strong> Low Trust</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Explainability Card */}
        <Card className="card-3d-hover flex flex-col justify-between">
          <div>
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <div className="rounded-lg bg-brand-50 p-2 dark:bg-brand-950/40">
                  <Sparkles className="h-5 w-5 text-brand-600 dark:text-brand-400" aria-hidden="true" />
                </div>
                <CardTitle className="text-lg">What is SHAP & LIME?</CardTitle>
              </div>
            </CardHeader>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Instead of black-box verdicts, we display the exact indicators that influenced the result.
            </p>
          </div>
          <div className="space-y-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/40 text-xs">
            <p className="leading-relaxed">
              <strong className="text-brand-600 dark:text-brand-400">LIME (Local Explanation)</strong> explains the current listing by highlighting specific phrases in red or green.
            </p>
            <p className="leading-relaxed border-t border-slate-150 pt-2 dark:border-slate-800/40">
              <strong className="text-brand-600 dark:text-brand-400">SHAP (Global Explanation)</strong> shows the semantic patterns the AI model has learned across thousands of past audited advertisements.
            </p>
          </div>
        </Card>
      </div>

      {/* Interactive Risk Matrix Table */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white sm:text-2xl">Risk Categorization Matrix</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">How AI fraud probability and manual trust score combine to generate risk levels</p>
        </div>

        <Card className="card-3d-hover overflow-hidden border border-slate-200 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
              <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-700 dark:bg-slate-950/60 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th scope="col" className="px-6 py-4">AI Probability</th>
                  <th scope="col" className="px-6 py-4">Trust Score (80 - 100)</th>
                  <th scope="col" className="px-6 py-4">Trust Score (0 - 79)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                <tr className="bg-white dark:bg-slate-900/40 hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">Legitimate (&lt; 50%)</td>
                  <td className="px-6 py-4"><RiskBadge category="Low" /></td>
                  <td className="px-6 py-4"><RiskBadge category="High" /></td>
                </tr>
                <tr className="bg-white dark:bg-slate-900/40 hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">Fraudulent (&gt;= 50%)</td>
                  <td className="px-6 py-4"><RiskBadge category="Medium" /></td>
                  <td className="px-6 py-4"><RiskBadge category="Critical" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* Disclaimer / Warning Section */}
      <div className="rounded-2xl border border-slate-200/80 bg-amber-50/40 p-6 dark:border-slate-800/60 dark:bg-amber-950/10 flex items-start gap-4">
        <Info className="h-6 w-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1.5">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Always Practice Due Diligence</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            This framework serves as a decision support aid. While our model and rules achieve high accuracy, scam formats evolve constantly. Always search for the company's verified career pages directly on their domain, and never pay processing fees, background check deposits, or training expenses to any recruiter.
          </p>
        </div>
      </div>
      
    </div>
  );
}
