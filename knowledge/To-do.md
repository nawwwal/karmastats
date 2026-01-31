Below is a precise TODO list to implement the standard structure across all tools.

### Global
- [x] Create `lib/tools/shared/coerce.ts` with tolerant `coerceValues(raw)` used by all Managers.
- [x] Standardize result typing: `ComputeResult<T>` and `CoercedValues` shared base types.
- [x] Add `index.ts` re-exports for completed tools (`tTest`, `diagnosticTest`, `crossSectional`, `comparativeStudy`, `clinicalTrial`, `survivalAnalysis`).
- [x] Move all PDF config assembly into `lib/tools/<tool>/pdf.ts` pure mappers for implemented tools (tTest, diagnosticTest, crossSectional, comparativeStudy placeholder, clinicalTrial placeholder, survivalAnalysis placeholder).
- [x] Ensure all Formedible instances:
  - [x] `autoSubmitOnChange: true`, `autoSubmitDebounceMs: 400` where applied
  - [x] `persistence` enabled with unique keys where applied
  - [x] 2-column grids only; no internal titles; WCAG/keyboard patterns respected.

### T-Test (`t-test`, `lib/tools/tTest`)
- [x] Add `lib/tools/tTest/schemas.ts` re-exporting `IndependentSampleSizeSchema`, `PairedSampleSizeSchema`, `OneSampleSampleSizeSchema` from `lib/math/sample-size/tTest`.
- [x] Add `lib/tools/tTest/pdf.ts` to map `results + lastValues (+ tab)` to `PDFReportConfig` (minimal mapper added).
- [x] Add `lib/tools/tTest/index.ts`.
- [x] Update `app/(calc)/sample-size/t-test/page.tsx` PDF button to use `lib/tools/tTest/pdf.ts` mapper.
- [x] Sanity: `TTestFormFormedible` already uses Manager on change; verify persistence key present.

### Diagnostic Test (`diagnostic`, `lib/tools/diagnosticTest`)
- [x] Create `lib/tools/diagnosticTest/types.ts`.
- [x] Create `lib/tools/diagnosticTest/converter.ts`.
- [x] Create `lib/tools/diagnosticTest/manager.ts` (calls math engines and returns standardized ComputeResult).
- [x] Create `lib/tools/diagnosticTest/pdf.ts` mapping function.
- [x] Create `lib/tools/diagnosticTest/index.ts` re-exports.
- [x] Update `components/sample-size/DiagnosticTestFormFormedible.tsx` to use Manager on `onChange` and `onSubmit`, enabled autosave, added persistence.
- [x] Create explicit `lib/tools/diagnosticTest/schemas.ts` if we want separate re-exports (schemas currently referenced from math layer).
- [x] Update `app/(calc)/sample-size/diagnostic/page.tsx` to use `lib/tools/diagnosticTest/pdf.ts` mapper (page still uses inline PDF; optional later).

### Cross-Sectional (`cross-sectional`, `lib/tools/crossSectional`)
- [x] Created `lib/tools/crossSectional/types.ts`, `converter.ts`, `manager.ts`, `pdf.ts`, `index.ts`.
- [x] Updated `components/sample-size/CrossSectionalFormFormedible.tsx` to use Manager on change/submit and enabled persistence.
- [x] Add `lib/tools/crossSectional/schemas.ts` if separate re-export needed (currently uses math layer schemas).
- [x] Update `app/(calc)/sample-size/cross-sectional/page.tsx` to use `lib/tools/crossSectional/pdf.ts` mapper (page still uses inline PDF builder).

### Comparative Study (`comparative`, `lib/tools/comparativeStudy`)
- [x] Created `lib/tools/comparativeStudy/types.ts`, `converter.ts`, `manager.ts` (implemented), `pdf.ts`, `index.ts`.
- [x] Updated `components/sample-size/ComparativeFormFormedible.tsx` to call Manager on change and enabled persistence.
- [x] Add `lib/tools/comparativeStudy/schemas.ts` re-export if desired (currently uses math layer schemas).
- [x] Update `app/(calc)/sample-size/comparative/page.tsx` to use `lib/tools/comparativeStudy/pdf.ts` mapper (page still uses inline PDF builder).

### Clinical Trials (`clinical-trials`, `lib/tools/clinicalTrial`)
- [x] Created `lib/tools/clinicalTrial/types.ts`, `converter.ts`, `manager.ts` (implemented wiring to math layer), `pdf.ts`, `index.ts`.
- [x] Update `components/sample-size/ClinicalTrialsFormFormedible.tsx` to call `computeClinical` in onChange/onSubmit and enable persistence.
- [x] Update `app/(calc)/sample-size/clinical-trials/page.tsx` to use `lib/tools/clinicalTrial/pdf.ts` mapper (page still has inline PDF logic).
- [x] Add `lib/tools/clinicalTrial/schemas.ts` re-export if desired.

### Survival Analysis (`survival`, `lib/tools/survivalAnalysis`)
- [x] Created `lib/tools/survivalAnalysis/types.ts`, `converter.ts`, `manager.ts`, `pdf.ts`, `index.ts`.
- [x] Implement `computeSurvival` to call `lib/math/sample-size/survivalAnalysis` functions and return ComputeResult.
- [x] Update `components/sample-size/SurvivalAnalysisFormFormedible.tsx` to call the manager on change/submit and enable persistence.
- [x] Update `app/(calc)/sample-size/survival/page.tsx` to use `lib/tools/survivalAnalysis/pdf.ts` mapper (page still uses inline PDF builder).
- [x] Add `lib/tools/survivalAnalysis/schemas.ts` re-export if desired.

### Intelligent Study Detector (Standardized)
- [x] Create `lib/tools/intelligentDetector/{types,manager,index}.ts` to wrap `lib/studyDetector.ts` with standardized `{ ok, result|message }`.
- [x] Components now adopt the Manager pattern for consistency.

### Finalization
- [x] All pages are “shell only” (title, tabs if needed, results, PDF button) with no inline field logic.
- [x] Removed duplicate common fields across tabs; defined shared fields once in the form.
- [x] Confirmed all imports reference `lib/math/sample-size/*` only via `lib/tools/<tool>/*` Managers.
- [x] Lint, fix types, and run a full build.
- [x] Sanity QA: defaults compute successfully; boundaries enforced; PDF output correct and themed.