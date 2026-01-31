# Refactor Plan: Repository Restructure and Sanitation

Status legend: [ ] pending • [x] done • [~] in progress

## Phase 1 — Audit & Planning
- [x] Inventory current folders, tools, and routes
- [x] Define target architecture: one backend and one frontend file per tool; shared barrels in `common/`
- [x] Create contributor guide (`AGENTS.md`) and this plan checklist
- [x] Introduce `common/backend.ts` and `common/frontend.tsx` barrels
- [x] Create backend entries for 15 tools under `backend/`
- [x] Create frontend entries for 15 tools under `frontend/`

## Phase 2 — Standardize Imports and Boundaries
- [x] Replace `@/lib/pdf-utils` imports with `@/common/backend` re-exports (pages + components)
- [x] Replace direct math/type imports with `@/backend/*` outputs or `@/common/backend` shared types where applicable
- [x] Ensure all `app/(calc)/*/page.tsx` use their corresponding `@/backend/*` module for compute/output
- [~] Ensure tree-shakable, explicit imports in UI via `components/ui/*` or `common/frontend` where appropriate (barrel extended)
- [x] Consolidate duplicate Compute* types across `lib/tools/*` into `lib/tools/shared/*`

## Phase 3 — Extract/Unify Shared Logic
- [ ] Identify and extract repeated PDF mappers to shared helpers re-exported from `common/backend`
- [ ] Centralize field coercion/validation in `lib/tools/shared` and remove per-page duplicates
- [ ] Introduce consistent error/reporting helpers (download PDF, reset state, toasts) used by all tool pages

## Phase 4 — Remove/Archive Legacy & Unused
- [ ] Audit `karmastats-old/` and move to `docs/legacy/` or remove after confirmation
- [ ] Remove unused components/hooks; keep a safety list in this file
- [ ] Delete orphaned files under `lib/` not referenced by any route/build

## Phase 5 — Typecheck, Lint, Build
- [ ] Ensure `tsconfig` paths fully cover `backend/` and `frontend/` entries (currently `@/*` is OK)
- [ ] Run `npm run typecheck` and resolve type boundary breaks
- [ ] Run `npm run lint` and fix import/order rules
- [ ] Run `npm run build` and fix any path/alias regressions

## Phase 6 — Documentation & DX
- [ ] Update README project structure diagram and commands to match new layout
- [ ] Document per-tool backend/frontend contract in `AGENTS.md`
- [ ] Add short contributing checklist for PRs (lint, typecheck, build, preview)

## Phase 7 — Final QA & Cleanup
- [ ] Manual smoke test for each of the 15 tools (compute + PDF)
- [ ] Verify consistent UI/UX and navigation
- [ ] Remove plan items below this line once complete

---

## Tool Inventory (15/15 in place)

Sample Size (7):
- [x] Intelligent Detector — `backend/sample-size.intelligent-detector.ts`, `frontend/sample-size/intelligent-detector.tsx`
- [x] Clinical Trials — `backend/sample-size.clinical-trials.ts`, `frontend/sample-size/clinical-trials.tsx`
- [x] Diagnostic — `backend/sample-size.diagnostic.ts`, `frontend/sample-size/diagnostic.tsx`
- [x] Comparative — `backend/sample-size.comparative.ts`, `frontend/sample-size/comparative.tsx`
- [x] Cross-sectional — `backend/sample-size.cross-sectional.ts`, `frontend/sample-size/cross-sectional.tsx`
- [x] Survival — `backend/sample-size.survival.ts`, `frontend/sample-size/survival.tsx`
- [x] T-test — `backend/sample-size.t-test.ts`, `frontend/sample-size/t-test.tsx`

Regression (4):
- [x] Linear — `backend/regression.linear.ts`, `frontend/regression/linear.tsx`
- [x] Logistic — `backend/regression.logistic.ts`, `frontend/regression/logistic.tsx`
- [x] Multiple — `backend/regression.multiple.ts`, `frontend/regression/multiple.tsx`
- [x] Polynomial — `backend/regression.polynomial.ts`, `frontend/regression/polynomial.tsx`

Disease Math (2):
- [x] SEIR — `backend/disease-math.seir.ts`, `frontend/disease-math/seir.tsx`
- [x] SEIRDV — `backend/disease-math.seirdv.ts`, `frontend/disease-math/seirdv.tsx`

Health Studies (2):
- [x] Family Study — `backend/family-study.ts`, `frontend/family-study.tsx`
- [x] Adult Vaccination — `backend/adult-vaccination.ts`, `frontend/adult-vaccination.tsx`

---

## Active Work Log

2025-08-17
- [x] Phase 1 completed (audit + plan + barrels)
- [~] Phase 2 started: converting page imports to `@/common/backend` for PDF + types
2025-08-18
- [x] Switched all `app/(calc)` pages to `@/backend/*` for types and kept PDF via `@/common/backend`
- [x] Updated regression and disease-math components to import compute/types from backend entries
- [x] Forms (t-test, cross-sectional, survival, clinical) now import result types via backend
- [~] Introduced helper `generateReportOrError` in `common/backend` (adoption pending)
- [x] Consolidated ComputeResult/Ok/Err generics in `lib/tools/shared/types` and updated tool `types.ts`
- [~] Expanded `common/frontend` barrel with common UI atoms (table, input, textarea, select, progress, accordion, checkbox)
- [x] Fixed duplicate type exports by unifying `RawValues/CoercedValues` in shared; removed default exports
- [x] Extended backend entries to re-export math-layer types where needed (diagnostic, cross-sectional, survival, comparative)
- [x] Lint passes cleanly; typecheck/build deferred (sandbox + existing type mismatches in pages)
