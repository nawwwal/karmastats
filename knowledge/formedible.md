### Goal
Standardize all calculator forms on Formedible (TanStack Form v1 + shadcn/ui), keeping KARMASTAT’s design system and enhanced results patterns intact, with a repeatable migration process.

### References
- Formedible docs: `https://formedible.dev/docs`

### Principles and guardrails
- Design system: centralized theme, no hardcoded colors, single-column layout container, max 2 fields per row; use `grid-cols-1 sm:grid-cols-2` for form fields. See `components/design-system`.
- Enhanced form UX: larger typography, contextual help, realistic defaults, comprehensive validation. See `components/enhanced-form-patterns`.
- Results: keep `EnhancedResultsDisplay` (and visualizations) with double-outline effects and proper interpretation sections. See `components/enhanced-results-patterns`.
- Accessibility: WCAG 2.1 AA; touch targets ≥ 44px; ARIA labels; keyboard nav; prefer-reduced-motion.

### Migration architecture (target end-state)
- Each tool keeps the page shell (`ToolPageWrapper`, results visuals, PDF export).
- Each tool’s inputs move to a dedicated Formedible component using `useFormedible<T>()`.
- Validation is Zod-based at field-level via `FieldConfig.validation`.
- Layout via `layout: { type: 'grid', columns: 2, gap: '6', responsive: true }`.
- Emit `onResults` with both results and last submitted values for downstream (PDF/visualizations).

### Step-by-step migration recipe (per tool)
1) Identify scope
- Locate tool page and current form component(s).
- Inventory fields, types, defaults, and Zod schemas used today.

2) Create a Formedible component for the tool
- File: `components/<tool>/<ToolName>FormFormedible.tsx`
- Implement:
  - `fields: FieldConfig[]` with:
    - `name`, `type`, `label`, `description`, `min/max/step`.
    - `validation: z.ZodSchema<unknown>` for field-level constraints.
    - Group fields using `group` and thematic cards in the page.
  - `formOptions.defaultValues`: realistic, contextual defaults.
  - `layout`: `{ type: 'grid', columns: 2, gap: '6', responsive: true }`.
  - `submitLabel`: “Calculate” with `Button`.
  - `onSubmit`: parse with the tool’s schema(s), run calculation function, `onResults(result, values, tab?)` and `onError(null)`. Catch `ZodError` and bubble `onError(issues.map(i => i.message))`.

3) Refactor the tool page
- Replace RHF form (and `FormField` blocks) with the new Formedible component.
- Keep `ToolPageWrapper` and results display as-is.
- Track last submitted values (e.g., `lastValues`) from `onResults` for PDF inputs.
- Ensure PDF export reads from `lastValues` and uses correct labels/units.

4) Preserve design system patterns
- The Formedible form must never exceed 2 inputs per row. Keep spacing: `space-y-6` blocks, `gap-6` grids.
- Group related inputs into themed cards (primary/success/secondary) and avoid hardcoded colors.

5) QA
- Validate defaults produce valid initial calculations.
- Validate all boundaries (min/max) with correct error messages.
- Validate mobile: input sizing, spacing, no horizontal scroll, tap targets.
- Validate PDF: correct inputs/units; results match on-screen; theme applied.

6) Ship
- Add notes to the PR describing changes, defaults, and validation rules.
- Include screenshots (desktop/mobile) and a short Loom/GIF if useful.

### Minimal code templates

- Formedible form component skeleton:
```tsx
// components/<tool>/<ToolName>FormFormedible.tsx
'use client';
import React from 'react';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { useFormedible } from '@/hooks/use-formedible';
import type { FieldConfig } from '@/lib/formedible/types';

type Results = unknown; // replace with calculator result type

export default function ToolNameFormFormedible(props: {
  onResults: (results: Results, values: Record<string, unknown>) => void;
  onError?: (message: string | null) => void;
}) {
  const { onResults, onError } = props;

  const fields: FieldConfig[] = [
    {
      name: 'alpha',
      type: 'number',
      label: 'Significance Level (%)',
      min: 0, max: 100, step: 0.1,
      validation: z.number().min(0).max(100),
      group: 'Parameters',
    },
    // ...more fields, grouped and validated
  ];

  const { Form } = useFormedible({
    fields,
    layout: { type: 'grid', columns: 2, gap: '6', responsive: true },
    formOptions: {
      defaultValues: {
        alpha: 5,
        // ... realistic defaults
      } as any,
      onSubmit: ({ value }) => {
        try {
          // const validated = Schema.parse(value);
          // const result = calculate(validated);
          // onResults(result, value as Record<string, unknown>);
          onError?.(null);
        } catch (err) {
          if (err instanceof z.ZodError) {
            onError?.(err.issues.map(i => i.message).join(', '));
          } else {
            onError?.((err as Error).message);
          }
        }
      },
      canSubmitWhenInvalid: false,
      asyncDebounceMs: 0,
    },
    showSubmitButton: true,
    submitButton: Button,
    submitLabel: 'Calculate',
  });

  return <Form />;
}
```

- Page usage skeleton:
```tsx
// app/(calc)/<tool>/page.tsx
'use client';
import React, { useState } from 'react';
import { ToolPageWrapper } from '@/components/ui/tool-page-wrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Calculator, AlertCircle, Download } from 'lucide-react';
import ToolNameFormFormedible from '@/components/<tool>/ToolNameFormFormedible';

export default function ToolPage() {
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any | null>(null);
  const [lastValues, setLastValues] = useState<Record<string, unknown> | null>(null);

  return (
    <ToolPageWrapper title="Tool Name" description="Calculator description" icon={Calculator} layout="single-column">
      <div className="space-y-8">
        <Card className="shadow-lg border-border bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Tool Name</CardTitle>
            <CardDescription className="text-lg">Short description</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-6 border-destructive/20 bg-destructive/10">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive">{error}</AlertDescription>
              </Alert>
            )}
            <ToolNameFormFormedible
              onResults={(r, vals) => {
                setResults(r);
                setLastValues(vals);
                setError(null);
              }}
              onError={(msg) => setError(msg)}
            />
          </CardContent>
        </Card>

        {results && (
          // Keep your EnhancedResultsDisplay + visualizations here
          <Button onClick={() => { /* generate PDF using lastValues + results */ }} size="lg" className="px-8">
            <Download className="h-5 w-5 mr-3" /> Download PDF
          </Button>
        )}
      </div>
    </ToolPageWrapper>
  );
}
```

### Field mapping guide (RHF → Formedible)
- RHF `FormField control name="x"` → `FieldConfig` with `name: 'x'`, `type`, and `validation`.
- `zodResolver(schema)` → put per-field Zod into `FieldConfig.validation`. If you also need whole-form validation, keep small validators in `formOptions.onSubmit` around `Schema.parse`.
- Input semantics:
  - Percentages: `type: 'number'` with `min: 0, max: 100, step: 0.1`.
  - Ratios / probabilities: constrain with `min`, `max`.
  - Integers: add `step: 1`, `numberConfig: { step: 1 }`.
- Conditional fields: use `conditional` on `FieldConfig` or conditional sections for grouped visibility.

### Naming conventions
- Form components: `XxxFormFormedible.tsx` colocated under `components/<tool>/`.
- Keep page-level shell under `app/(calc)/<tool>/page.tsx`.
- Results types and calculators live in `lib/` (no changes there).

### Repeatable migration checklist (per tool)
- Dependencies
  - [ ] Confirm Formedible resources are installed (hooks, field components).
- Formedible component
  - [ ] Create `components/<tool>/<ToolName>FormFormedible.tsx`.
  - [ ] Define `fields: FieldConfig[]` with Zod `validation` per field.
  - [ ] Set `layout` to 2 columns, `gap: '6'`, `responsive: true`.
  - [ ] Provide realistic defaults, labels, descriptions.
  - [ ] Implement `onSubmit` → Zod parse → calculate → `onResults`.
  - [ ] Translate all RHF-only conditions into `conditional` or conditional sections.
- Page integration
  - [ ] Replace RHF form and inputs with new Formedible component.
  - [ ] Keep `ToolPageWrapper` and results UI intact.
  - [ ] Store `lastValues` from `onResults` for PDF.
  - [ ] Update PDF export to use `lastValues` fields (labels/units).
- Design system
  - [ ] Verify 2-fields-per-row rule, spacing, and no hardcoded colors.
  - [ ] Themed cards for sections; mobile-first layout.
- Validation & accessibility
  - [ ] Verify bounds and messages; aggregated errors in alert.
  - [ ] Labels/ARIA and touch targets ≥ 44px.
- QA (functional)
  - [ ] Defaults auto-calc (if desired) or first submit behaves correctly.
  - [ ] Cross-check results with reference values.
  - [ ] PDF output matches on-screen data, correct units and titles.
- Code health
  - [ ] Lint passes; remove unused imports.
  - [ ] Types are explicit for emitted results.

### Team QA checklist (shared)
- [ ] Desktop and mobile screenshots for form and results.
- [ ] Validation failure states are clear.
- [ ] Conditional fields and tabs work without re-render thrash.
- [ ] Performance acceptable while typing (numbers/debounce).
- [ ] No visual overflow or >2 fields per row.

### Rollout plan
- Phase 1: T-Test (completed) as reference.
- Phase 2: Diagnostic and Cross-Sectional (shared percentage/ratio patterns).
- Phase 3: Clinical Trials and Comparative (larger forms; add conditional sections).
- Phase 4: Survival and Regression (specialized inputs; step/per-field validation).
- Phase 5: Intelligent Detector and disease-math modules.

### Definition of done (per tool)
- Uses Formedible with field-level Zod.
- Adheres to 2-column layout, spacing, cards, and theme.
- Results and PDF export function correctly with last submitted values.
- No linter errors; types explicit for API surfaces.
- Screenshots added to PR; short test notes included.

If you’d like, I can proceed to migrate the next calculators using this exact recipe and open a PR per tool with the completed checklists.