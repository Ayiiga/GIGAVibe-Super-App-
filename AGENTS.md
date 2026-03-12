# AGENTS.md

Instructions for coding agents (and humans) working in this repo.

## Project overview

- **App type**: Vite + React + TypeScript single-page app (PWA-oriented).
- **Entry points**: `index.html`, `index.tsx`, `App.tsx`.
- **UI**: Components live in `components/`.
- **AI**: Gemini integration lives in `services/geminiService.ts`.
- **Service worker**: `sw.js`.
- **TS path alias**: `@/` maps to repo root (see `tsconfig.json` + `vite.config.ts`).

## Quickstart (local dev)

Install and run:

```bash
npm install
npm run dev
```

The dev server is configured for:
- **host**: `0.0.0.0`
- **port**: `3000`

## Environment variables (Gemini)

This project expects a Gemini API key at runtime.

- **Required**: `GEMINI_API_KEY`
- **Vite define mapping**: `vite.config.ts` injects it as `process.env.GEMINI_API_KEY` and `process.env.API_KEY`.

Create a local env file (don’t commit secrets):

```bash
cat > .env.local <<'EOF'
GEMINI_API_KEY=your_key_here
EOF
```

If you’re running in CI or a hosted environment, configure `GEMINI_API_KEY` as a secret/environment variable instead.

## Common commands

```bash
npm run dev      # start dev server
npm run build    # production build
npm run preview  # preview production build locally
```

## Development conventions

- **TypeScript-first**: keep types in `types.ts` (or colocate as needed) and avoid `any`.
- **Components**:
  - Prefer small, focused components in `components/`.
  - Keep component props typed and exported when reused.
- **Imports**:
  - Prefer `@/…` imports instead of deep relative paths where it improves readability.
- **Secrets**:
  - Never hardcode API keys.
  - Don’t log secrets or full AI responses containing sensitive user content.
- **Dependencies**:
  - Avoid adding new dependencies unless necessary.
  - When adding scripts (lint/test/format), ensure they run on a clean install.

## What to check before committing

- `npm run build` succeeds.
- Manual smoke test key flows in dev (navigation + any changed UI).
- If you touch Gemini-related code, verify behavior with and without `GEMINI_API_KEY` set (graceful error handling).

## Repo structure (high level)

- `App.tsx`: top-level app shell / routing-like state.
- `components/`: feature UI (Auth, Chat, Marketplace, Wallet, etc.).
- `services/`: integrations (Gemini).
- `sw.js`: service worker (PWA).
