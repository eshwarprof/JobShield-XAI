import { useState } from 'react';
import type { LimeExplanation, ShapExplanation } from '@/types';
import { ExplanationBarChart } from '@/components/dashboard/ExplanationBarChart';

function CollapsiblePanel({
  title,
  subtitle,
  defaultOpen,
  children,
}: {
  title: string;
  subtitle: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-white">{title}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
        <span className="text-slate-400">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="border-t border-slate-200 px-4 py-4 dark:border-slate-700">{children}</div>}
    </div>
  );
}

export function ExplainabilityPanels({
  shap,
  lime,
}: {
  shap: ShapExplanation;
  lime: LimeExplanation;
}) {
  return (
    <div className="space-y-4">
      <CollapsiblePanel
        title="Why this posting, specifically (LIME)"
        subtitle="Words that drove this individual prediction"
        defaultOpen
      >
        <ExplanationBarChart features={lime.features} valueKey="weight" />
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Red bars push the prediction toward <strong>fraudulent</strong>; green bars push toward{' '}
          <strong>legitimate</strong>.
        </p>
      </CollapsiblePanel>

      <CollapsiblePanel
        title="What the model relies on overall (SHAP)"
        subtitle={`Global feature importance across a sample of ${shap.sample_size ?? 'many'} advertisements`}
      >
        <ExplanationBarChart features={shap.features} valueKey="mean_impact" />
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          These are the words that most influence the model's fraud predictions in general, not just for this
          advertisement.
        </p>
      </CollapsiblePanel>
    </div>
  );
}
