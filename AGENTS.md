# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Next.js App Router entry, pages, and global styles.
- `components/`: Reusable UI and feature components (kebab-case folders, PascalCase files).
- `hooks/`: Reusable React hooks (files start with `use-...`).
- `lib/`: Utilities, domain logic, and math helpers.
- `public/`: Static assets served at the app root.
- `knowledge/` and `karmastats-old/`: Reference and legacy materials.

## Build, Test, and Development Commands
- `npm run dev`: Start local dev server with Turbopack.
- `npm run build`: Production build via Next.js.
- `npm run start`: Run the built app locally.
- `npm run lint`: Lint with ESLint (Next.js config).

Use Node.js LTS (v18+) and npm. Install deps with `npm ci` for reproducible builds.

## Coding Style & Naming Conventions
- **Language**: TypeScript + React. Tailwind CSS for styling.
- **Indentation**: 2 spaces; no semicolons; double quotes for strings (match existing files).
- **Components**: PascalCase files (e.g., `ErrorBoundary.tsx`), kebab-case directories (e.g., `adult-vaccination/`).
- **Hooks**: kebab-case file names prefixed with `use-` (e.g., `use-debounce.ts`).
- **Imports**: Prefer absolute `@/...` paths where configured.
- **Linting**: Keep code `npm run lint` clean; see `.eslintrc.json` for rules.

## Testing Guidelines
- No test framework is configured yet. When adding tests, colocate `*.test.ts(x)` near sources or mirror structure under `__tests__/`.
- Aim for unit tests around `lib/` and hooks; smoke-test critical pages under `app/`.
- Keep tests deterministic; mock network and timers.

## Commit & Pull Request Guidelines
- **Commits**: Imperative mood and concise (e.g., "Refactor sample size ratio logic"). Optional scope is fine; keep subjects under ~72 chars. Use multiple commits for distinct changes.
- **PRs**: Include a clear description, linked issues (e.g., `Closes #123`), and screenshots/GIFs for UI changes. Note breaking changes and manual test steps.

## Security & Configuration Tips
- Never commit secrets. Use environment variables (`NEXT_PUBLIC_*` only for safe client-side config).
- Review `next.config.ts` and `vercel.json` before deploying.
