# AGENTS.md

This file provides guidance to AI coding agents working on the GIGAVibe Super App codebase.

## Project Overview

GIGAVibe is an AI-driven Super-App built with React 19, TypeScript, and Vite. It combines social media, messaging, marketplace, AI creation tools, and wallet functionality into a single Progressive Web App (PWA).

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS (utility classes inline)
- **Icons**: Lucide React
- **Charts**: Recharts
- **AI Integration**: Google Gemini API (`@google/genai`)
- **Video Generation**: Google Veo 3.1

## Project Structure

```
/
├── App.tsx              # Main application component with routing/state
├── index.tsx            # React entry point
├── index.html           # HTML template
├── types.ts             # TypeScript interfaces and enums
├── components/          # React components
│   ├── AILab.tsx        # AI creation tools (image/video generation)
│   ├── Auth.tsx         # Authentication flow
│   ├── ChatInterface.tsx # Messaging interface
│   ├── LiveHost.tsx     # Live streaming functionality
│   ├── Marketplace.tsx  # E-commerce marketplace
│   ├── Navbar.tsx       # Bottom navigation
│   ├── NotificationSystem.tsx # Push notifications
│   ├── Onboarding.tsx   # User onboarding flow
│   ├── Profile.tsx      # User profile management
│   ├── SocialFeed.tsx   # TikTok-style social feed
│   └── Wallet.tsx       # Financial/wallet features
├── services/
│   └── geminiService.ts # Google Gemini AI service wrapper
├── sw.js                # Service worker for PWA
├── manifest.json        # PWA manifest
├── vite.config.ts       # Vite configuration
└── tsconfig.json        # TypeScript configuration
```

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on port 3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Code Style Guidelines

### TypeScript

- Use TypeScript for all new code
- Define interfaces in `types.ts` for shared types
- Use enums for fixed sets of values (e.g., `TabType`)
- Prefer functional components with explicit `React.FC<Props>` typing

### React Components

- Use functional components with hooks
- Export components as default exports
- Props interfaces should be defined inline or imported from `types.ts`
- Use descriptive component names that reflect their purpose

### Styling

- Use Tailwind CSS utility classes exclusively
- Follow the existing dark theme aesthetic (black backgrounds, white/gray text)
- Use gradient accents (`from-blue-500 to-purple-500`) for interactive elements
- Apply backdrop blur effects for overlay elements (`backdrop-blur-md`)
- Use consistent border styling (`border-white/10`)

### State Management

- Use React hooks (`useState`, `useEffect`) for local state
- Use `localStorage` for persistence (prefixed with `gigavibe_`)
- Pass state down through props; lift state up when needed

## Environment Variables

The app uses a Gemini API key for AI features:

- `GEMINI_API_KEY` - Google Gemini API key (loaded via Vite's `loadEnv`)
- Accessed in code as `process.env.API_KEY` or `process.env.GEMINI_API_KEY`

## AI Service Usage

The `GeminiService` class in `services/geminiService.ts` provides:

- `generateViralCaption(input)` - Generate social media captions
- `generateGroupDescription(name, category)` - Generate community descriptions
- `generateProductDescription(name, category)` - Generate marketplace listings
- `generateGrowthStrategy(profileStats)` - Analyze and suggest growth strategies
- `generateAdVisual(prompt, base64Image?)` - Generate advertisement images
- `generateImage(prompt, base64Image?, aspectRatio?)` - General image generation
- `generateVideo(prompt, aspectRatio?)` - Video generation with Veo 3.1

## PWA Features

- Service worker registration in `App.tsx`
- Install prompt handling for "Add to Home Screen"
- Standalone mode detection for enhanced features
- Manifest configured for mobile app experience

## Common Patterns

### Adding a New Tab/Feature

1. Add new enum value to `TabType` in `types.ts`
2. Create component in `components/`
3. Add case in `renderContent()` switch in `App.tsx`
4. Add tab entry in `Navbar.tsx`

### Adding New Types

Define interfaces in `types.ts` following existing patterns:

```typescript
export interface NewType {
  id: string;
  // ... other fields
}
```

### Using AI Features

```typescript
import { gemini } from '../services/geminiService';

// In component
const result = await gemini.generateViralCaption("My topic");
```

## Important Notes

- This is a mobile-first PWA - always test on mobile viewports
- The app uses a max-width container (`max-w-lg`) for consistent mobile appearance
- Authentication state is stored in localStorage
- All AI features require a valid Gemini API key
- Video generation uses polling and may take time to complete

## Testing Considerations

- Test PWA install flow on both iOS Safari and Android Chrome
- Verify AI features gracefully handle API errors
- Check responsive behavior at various screen sizes
- Test offline behavior with service worker
