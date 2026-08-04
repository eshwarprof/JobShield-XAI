import { Microscope, Telescope } from 'lucide-react';
import type { LimeExplanation, ShapExplanation, ExplanationFeature } from '@/types';
import { ExplanationBarChart } from '@/components/dashboard/ExplanationBarChart';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/Accordion';

function getLimeExplanationText(features: ExplanationFeature[], predictionLabel: string) {
  if (!features || features.length === 0) return null;

  const suspicious = features.filter((f) => (f.weight ?? 0) > 0);
  const legitimate = features.filter((f) => (f.weight ?? 0) < 0);

  const topSuspicious = [...suspicious]
    .sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0))
    .slice(0, 3)
    .map((f) => `"${f.feature}"`);
    
  const topLegit = [...legitimate]
    .sort((a, b) => (a.weight ?? 0) - (b.weight ?? 0))
    .slice(0, 3)
    .map((f) => `"${f.feature}"`);

  const isFraudulent = predictionLabel === 'fraudulent';

  if (isFraudulent) {
    let explanation = `The model flagged this listing as suspicious primarily because of specific keywords like ${topSuspicious.join(', ')} which strongly suggest fraud patterns.`;
    if (topLegit.length > 0) {
      explanation += ` Although standard recruitment terms like ${topLegit.join(', ')} were also present, their influence was too small to offset the risk.`;
    }
    return explanation;
  } else {
    let explanation = `The model determined this job post is likely legitimate. `;
    if (topLegit.length > 0) {
      explanation += `Its decision is supported by the presence of standard recruitment words like ${topLegit.join(', ')}.`;
    } else {
      explanation += `No significant fraud-pattern keywords were found in the text.`;
    }
    if (topSuspicious.length > 0) {
      explanation += ` A few weak suspect terms like ${topSuspicious.join(', ')} were found, but they were not strong enough to trigger a warning.`;
    }
    return explanation;
  }
}

function getShapExplanationText(features: ExplanationFeature[]) {
  if (!features || features.length === 0) return null;

  const topFeatures = features
    .slice(0, 3)
    .map((f) => `"${f.feature}"`);

  return `In general, across all analyzed listings, the model has learned to look out for keywords like ${topFeatures.join(', ')} as the strongest overall indicators of fake job posts.`;
}

export function ExplainabilityPanels({
  shap,
  lime,
  predictionLabel,
}: {
  shap: ShapExplanation;
  lime: LimeExplanation;
  predictionLabel: string;
}) {
  const limeText = getLimeExplanationText(lime.features, predictionLabel);
  const shapText = getShapExplanationText(shap.features);

  return (
    <Accordion type="multiple" defaultValue={['lime']} className="space-y-3">
      <AccordionItem value="lime">
        <AccordionTrigger>
          <div className="flex items-center gap-2.5 text-left">
            <Microscope className="h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white">Why this posting, specifically (LIME)</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Words that drove this individual prediction</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          {limeText && (
            <div className="mb-4 rounded-lg border border-slate-100 bg-slate-50/50 p-3 text-xs leading-relaxed text-slate-700 dark:border-slate-800/60 dark:bg-slate-800/20 dark:text-slate-300">
              <strong className="text-slate-900 dark:text-white">Summary:</strong> {limeText}
            </div>
          )}
          <ExplanationBarChart features={lime.features} valueKey="weight" />
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Red bars push the prediction toward <strong>fraudulent</strong>; green bars push toward{' '}
            <strong>legitimate</strong>.
          </p>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="shap">
        <AccordionTrigger>
          <div className="flex items-center gap-2.5 text-left">
            <Telescope className="h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white">What the model relies on overall (SHAP)</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Global feature importance across a sample of {shap.sample_size ?? 'many'} advertisements
              </p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          {shapText && (
            <div className="mb-4 rounded-lg border border-slate-100 bg-slate-50/50 p-3 text-xs leading-relaxed text-slate-700 dark:border-slate-800/60 dark:bg-slate-800/20 dark:text-slate-300">
              <strong className="text-slate-900 dark:text-white">Summary:</strong> {shapText}
            </div>
          )}
          <ExplanationBarChart features={shap.features} valueKey="mean_impact" />
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            These are the words that most influence the model's fraud predictions in general, not just for this
            advertisement.
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
