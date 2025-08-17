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
    // Live updates and autosave
    autoSubmitOnChange: true,
    autoSubmitDebounceMs: 400,
    persistence: { key: '<tool>-form', storage: 'localStorage', debounceMs: 800, restoreOnMount: true },
    // Hide calculate button unless required by UX
    showSubmitButton: false,
    submitButton: Button,
    submitLabel: 'Calculate',
  });

  // Do not add duplicate tool titles here; the page shell provides it
  return <Form />;
}
```

- Tabbed form skeleton (single instance with fields assigned to tabs):
```tsx
const fields: FieldConfig[] = [
  { name: 'paramA', type: 'number', label: 'Param A', tab: 'tab1', validation: z.number() },
  { name: 'paramB', type: 'number', label: 'Param B', tab: 'tab1' },
  { name: 'paramX', type: 'number', label: 'Param X', tab: 'tab2' },
  // ...
];

const { Form } = useFormedible({
  fields,
  tabs: [
    { id: 'tab1', label: 'Scenario 1' },
    { id: 'tab2', label: 'Scenario 2' },
  ],
  layout: { type: 'grid', columns: 2, gap: '6', responsive: true },
  autoSubmitOnChange: true,
  autoSubmitDebounceMs: 400,
  showSubmitButton: false,
  // optional: compute results live without waiting for submit
  formOptions: {
    onChange: ({ value, formApi }) => {
      // Validate and compute; emit results to page shell
    },
  },
});

return <Form />;
```

### Accessibility & Keyboard Standards (Updated)
- Numeric inputs must support robust keyboard interactions:
  - ArrowUp/ArrowDown: increment/decrement by `step`
  - Shift + Arrow: 10x step multiplier
  - PageUp/PageDown: 10x step multiplier
  - Home/End: jump to min/max (when provided)
  - Enter: prevent form submit (for autosave/live-calc UX)
  - Wheel: disabled while focused to avoid accidental changes
- Clamp values to `min`/`max` on blur
- Use `inputMode="decimal"` and appropriate `aria-*` attributes
- Prevent focus from jumping to the next field during key increments

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
  - [ ] Use a single form instance (use `tabs` and `field.tab` for multi-mode tools).
  - [ ] Set `layout` to 2 columns, `gap: '6'`, `responsive: true`.
  - [ ] Provide realistic defaults, labels, descriptions.
  - [ ] Implement `onSubmit` → Zod parse → calculate → `onResults`.
  - [ ] Enable autosubmit (`autoSubmitOnChange`) with debounce; enable `persistence` with restore.
  - [ ] Live results on change (`formOptions.onChange`) when feasible.
  - [ ] Hide the submit button by default (`showSubmitButton: false`) unless manual submit is required.
  - [ ] Do NOT render internal tool titles in the form; rely on page shell to avoid duplication.
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
  - [ ] Defaults auto-calc (with debounce) behaves correctly across tabs.
  - [ ] Cross-check results with reference values.
  - [ ] PDF output matches on-screen data, correct units and titles.
- Code health
  - [ ] Lint passes; remove unused imports.
  - [ ] Types are explicit for emitted results.

### Standardized Form Pipeline (All Tools)
1) Input (UI)
- All numeric fields allow free typing. No premature errors for partial strings.
- Wheel disabled while focused; Enter does not submit.

2) Tolerant Field Validation (per-field)
- For `type: 'number'`, validators:
  - accept numeric strings
  - ignore partial states (`''`, '-', '.', '-.')
  - only validate when a finite number is present

3) Coercion Layer (form-level)
```ts
const coerceValues = (raw: Record<string, unknown>) => {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (typeof v === 'string') {
      const t = v.trim();
      if (t === '' || t === '-' || t === '.' || t === '-.') { out[k] = undefined; continue; }
      const n = Number(t);
      out[k] = Number.isFinite(n) ? n : v;
    } else {
      out[k] = v;
    }
  }
  return out;
};
```

4) Schema Parse → Compute
- In `formOptions.onChange` (debounced) and `onSubmit`:
  - `const coerced = coerceValues(value)`
  - `Schema.safeParse(coerced)` for live; `Schema.parse(coerced)` for submit
  - compute results only if parse succeeds

5) Emit
- `onResults(result, coerced, activeTab)`
- Clear errors on success; surface Zod errors on submit or meaningful failure

6) Tabs + Shared Fields
- Common parameters (e.g., alpha/power/dropout) should be defined once (no `tab`) so they render on all tabs.
- Tab-specific fields include `tab: '...'`.
- Renderer merges `default` fields with the active tab.

### Manager/Converter Standard (Tools)
- Converter: `coerceValues(raw)` converts numeric strings to numbers; ignores partial states.
- Manager: `computeTool(tab, raw)` orchestrates: coerce → schema selection → safeParse/parse → compute → standardized result/err.
- Schemas: Zod schemas per tab, exported from `lib/tools/<tool>/schemas.ts`.

### Tab Patterns
- **Diagnostic Style**: page owns tabs; passes `activeTab` to form; form shows fields based on `activeTab`. Use for complex layouts with unique fields per tab.
  - Page: `useState<TabType>('default')`, renders `<EnhancedTabs>`, passes `activeTab` to Formedible.
  - Form: receives `activeTab`, uses `getFieldsForTab(activeTab)`.
- **T-Test Style**: form owns tabs (`useFormedible({ tabs })`), manages its own state. Use for simpler forms where `field.tab` is sufficient.
  - Form: `useState<TabType>('default')`, `analytics.onTabChange` updates state.

### Reference Implementation (T-Test)
```ts
// lib/tools/tTest/converter.ts
export function coerceValues(raw: Record<string, unknown>): Record<string, unknown> { /* ... */ }

// lib/tools/tTest/manager.ts
export async function computeTTest(tab: TTestTab, raw: Record<string, unknown>) {
  // coerce → pick schema → safeParse/parse → compute → standardized result
}
```

Usage in a form:
```ts
// Page owns tabs
const [activeTab, setActiveTab] = useState<TTestTab>('independent');
// ...
<EnhancedTabs value={activeTab} onValueChange={setActiveTab}>...</EnhancedTabs>
<TTestFormFormedible activeTab={activeTab} ... />

// Form receives activeTab
export default function TTestFormFormedible({ activeTab, onResults, onError }: Props) {
  const fields = getFieldsForTab(activeTab); // Selects fields based on tab
  const { Form } = useFormedible({
    fields,
    formOptions: {
      onSubmit: async ({ value }) => { // Autosave uses onChange
        const res = await computeTTest(activeTab, value as any);
        if (res.ok) onResults(res.result, res.values, activeTab);
        else throw new Error(res.message);
      },
    },
    showSubmitButton: true, // Diagnostic style uses manual submit
  });
  return <Form />;
}
```

### Migration Steps
- [ ] Create `lib/tools/<tool>/{schemas,converter,manager,types,pdf}.ts`.
- [ ] Choose tab pattern (diagnostic recommended for consistency).
- [ ] Form receives `activeTab` and selects fields.
- [ ] Page owns tabs.
- [ ] Form calls Manager in `onSubmit` (diagnostic) or `onChange` (autosave).
- [ ] Remove duplicate common fields.
- [ ] Coerce values pre-parse in Manager.
- [ ] No internal titles.

### Error Handling
- Field-level: friendly messages; no errors while typing partials.
- Form-level: only show aggregated Zod errors on submit or when helpful.

### Clean Code Checklist
- [ ] No duplicated field names across tabs.
- [ ] No ad-hoc validation; use centralized tolerant validator.
- [ ] Coercion used consistently pre-parse.
- [ ] Strong typing for results; no `any` in public APIs.

### Manager/Converter Standard (Tools)
- Converter: `coerceValues(raw)` converts numeric strings to numbers; ignores partial states.
- Manager: `computeTool(tab, raw)` orchestrates: coerce → schema selection → safeParse/parse → compute → standardized result/err.
- Schemas: Zod schemas per tab, exported from `lib/tools/<tool>/schemas.ts`.

### Tab Patterns
- **Diagnostic Style**: page owns tabs; passes `activeTab` to form; form shows fields based on `activeTab`. Use for complex layouts with unique fields per tab.
  - Page: `useState<TabType>('default')`, renders `<EnhancedTabs>`, passes `activeTab` to Formedible.
  - Form: receives `activeTab`, uses `getFieldsForTab(activeTab)`.
- **T-Test Style**: form owns tabs (`useFormedible({ tabs })`), manages its own state. Use for simpler forms where `field.tab` is sufficient.
  - Form: `useState<TabType>('default')`, `analytics.onTabChange` updates state.

### Reference Implementation (T-Test)
```ts
// lib/tools/tTest/converter.ts
export function coerceValues(raw: Record<string, unknown>): Record<string, unknown> { /* ... */ }

// lib/tools/tTest/manager.ts
export async function computeTTest(tab: TTestTab, raw: Record<string, unknown>) {
  // coerce → pick schema → safeParse/parse → compute → standardized result
}
```

Usage in a form:
```ts
// Page owns tabs
const [activeTab, setActiveTab] = useState<TTestTab>('independent');
// ...
<EnhancedTabs value={activeTab} onValueChange={setActiveTab}>...</EnhancedTabs>
<TTestFormFormedible activeTab={activeTab} ... />

// Form receives activeTab
export default function TTestFormFormedible({ activeTab, onResults, onError }: Props) {
  const fields = getFieldsForTab(activeTab); // Selects fields based on tab
  const { Form } = useFormedible({
    fields,
    formOptions: {
      onSubmit: async ({ value }) => { // Autosave uses onChange
        const res = await computeTTest(activeTab, value as any);
        if (res.ok) onResults(res.result, res.values, activeTab);
        else throw new Error(res.message);
      },
    },
    showSubmitButton: true, // Diagnostic style uses manual submit
  });
  return <Form />;
}
```

Apply this pattern across tools to ensure consistent validation, calculation, and error handling.