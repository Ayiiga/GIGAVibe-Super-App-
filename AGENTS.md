# AGENTS.md

## Project overview
- **App**: GIGAVibe Super App (React 19 + Vite + TypeScript).
- **UI**: Component-driven in `components/`.
- **AI**: Gemini API integration in `services/`.
- **PWA**: `manifest.json` and `sw.js`.

## Key locations
- `App.tsx`: main application shell.
- `components/`: feature UI modules (chat, social, wallet, etc.).
- `services/geminiService.ts`: Gemini API access.
- `types.ts`: shared type definitions.
- `index.tsx` / `index.html`: app entry and HTML template.

## Local development
```bash
npm install
npm run dev
```
Vite dev server runs on **http://localhost:3000**.

## Build / preview
```bash
npm run build
npm run preview
```

## Environment variables
Create a `.env` file for local development:
```
GEMINI_API_KEY=your_key_here
```
This is injected at build time via Vite (`process.env.GEMINI_API_KEY`).

## Notes for agents
- Prefer TypeScript-first changes; keep components functional and typed.
- Keep UI changes in `components/` unless they are app-wide.
- Avoid committing secrets or real API keys.
