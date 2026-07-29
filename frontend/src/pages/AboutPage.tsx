import { Gauge, Info, ShieldQuestion, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { RiskBadge } from '@/components/dashboard/RiskBadge';

/** SRS Section 2.6: an in-app help/about panel explaining trust score bands,
 * risk categories, and SHAP/LIME — required to ship alongside the README and
 * FastAPI OpenAPI docs. */
export function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl animate-fade-in-up space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">About this framework</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          This tool extends Fraud-BERT (Taneja, Vashishtha &amp; Ratnoo, 2025) with explainability, trust
          scoring, risk categorization, fraud-severity analysis, and decision support — so a prediction is never
          just a bare label.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-brand-600" aria-hidden="true" />
            <CardTitle>Reading the Trust Score</CardTitle>
          </div>
        </CardHeader>
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
          A 0–100 score, starting at 100, with points deducted for specific red flags (a requested registration
          fee, a personal email domain instead of an official one, a missing company profile, an unrealistic
          salary, WhatsApp-only contact, and more). It is independent of the AI model's raw prediction.
        </p>
        <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
          <li><strong>80–100:</strong> Highly Trustworthy</li>
          <li><strong>60–79:</strong> Moderately Trustworthy</li>
          <li><strong>30–59:</strong> Suspicious</li>
          <li><strong>0–29:</strong> Very Low Trust</li>
        </ul>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldQuestion className="h-4 w-4 text-brand-600" aria-hidden="true" />
            <CardTitle>Reading the Risk Category</CardTitle>
          </div>
        </CardHeader>
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
          Combines the AI model's fraud probability with the Trust Score into one overall category.
        </p>
        <div className="flex flex-wrap gap-2">
          <RiskBadge category="Low" />
          <RiskBadge category="Medium" />
          <RiskBadge category="High" />
          <RiskBadge category="Critical" />
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-brand-600" aria-hidden="true" />
            <CardTitle>What SHAP and LIME mean</CardTitle>
          </div>
        </CardHeader>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          <strong>LIME</strong> explains this one specific posting — which words in it pushed the prediction
          toward "fraudulent" or "legitimate." <strong>SHAP</strong> shows what the model relies on
          <em> overall</em>, aggregated across many advertisements, so you can see whether the model's general
          reasoning makes sense, not just its verdict on the one posting in front of you.
        </p>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-brand-600" aria-hidden="true" />
            <CardTitle>A tool, not a verdict</CardTitle>
          </div>
        </CardHeader>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          This system is a decision-support aid. Always independently verify a company's official website and
          contact channels, and never pay a fee to apply for or be hired into a job.
        </p>
      </Card>
    </div>
  );
}
