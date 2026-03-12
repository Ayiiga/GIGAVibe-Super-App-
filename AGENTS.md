# AGENTS.md - AI Agent Guidelines for GIGAVibe Super App

This document provides instructions for AI agents working on the GIGAVibe codebase.

## Project Overview

GIGAVibe is an AI-driven Super-App built with React 19 and TypeScript. It combines social features, messaging, marketplace, AI creation tools, and a digital wallet into a unified mobile-first PWA experience.

### Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS (utility-first classes)
- **Icons**: Lucide React
- **Charts**: Recharts
- **AI Integration**: Google Gemini API (`@google/genai`)
- **Target**: Progressive Web App (PWA)

## Project Structure

```
/workspace/
├── App.tsx              # Main app component with routing and state
├── index.tsx            # React entry point
├── index.html           # HTML template
├── types.ts             # TypeScript type definitions
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
├── manifest.json        # PWA manifest
├── sw.js                # Service worker
├── components/          # React components
│   ├── AILab.tsx        # AI creation suite
│   ├── Auth.tsx         # Authentication
│   ├── ChatInterface.tsx # Messaging
│   ├── LiveHost.tsx     # Live streaming
│   ├── Marketplace.tsx  # E-commerce
│   ├── Navbar.tsx       # Bottom navigation
│   ├── NotificationSystem.tsx
│   ├── Onboarding.tsx   # User onboarding
│   ├── Profile.tsx      # User profile
│   ├── SocialFeed.tsx   # Social media feed
│   └── Wallet.tsx       # Digital wallet
└── services/
    └── geminiService.ts # Google Gemini AI service
```

## Development Commands

```bash
npm run dev      # Start development server (port 3000)
npm run build    # Build for production
npm run preview  # Preview production build
```

## Coding Conventions

### TypeScript

- Use TypeScript for all `.tsx` and `.ts` files
- Define interfaces and types in `types.ts` for shared types
- Use `React.FC` for functional components with props
- Prefer `interface` over `type` for object shapes

### Component Patterns

1. **Functional Components**: All components use React functional components with hooks

```typescript
const ComponentName: React.FC<PropsInterface> = ({ prop1, prop2 }) => {
  // Component logic
  return <div>...</div>;
};

export default ComponentName;
```

2. **State Management**: Use React hooks (`useState`, `useEffect`) for local state
3. **Props**: Define prop interfaces above the component

```typescript
interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}
```

### Styling Guidelines

- Use Tailwind CSS utility classes exclusively
- Follow mobile-first responsive design
- Common patterns used in this codebase:
  - Rounded corners: `rounded-2xl`, `rounded-3xl`, `rounded-full`
  - Backgrounds: `bg-black`, `bg-white/5`, `bg-white/10`
  - Borders: `border border-white/10`, `border border-white/20`
  - Text colors: `text-white`, `text-gray-400`, `text-gray-500`
  - Gradients: `bg-gradient-to-br from-blue-700 to-indigo-900`
  - Animations: `animate-pulse`, `animate-bounce`, `transition-all`
  - Active states: `active:scale-90`, `hover:bg-white/10`

### Icons

- Import icons from `lucide-react`
- Use consistent sizing (typically `size={16}`, `size={20}`, `size={24}`)
- Apply colors via Tailwind: `className="text-blue-500"`

### File Naming

- Components: PascalCase (e.g., `SocialFeed.tsx`)
- Services: camelCase (e.g., `geminiService.ts`)
- Types: camelCase file, PascalCase exports (e.g., `types.ts` with `TabType`)

## Gemini AI Service

The `services/geminiService.ts` provides AI functionality:

- `generateViralCaption(input)` - Generate social media captions
- `generateGroupDescription(name, category)` - Create community descriptions
- `generateProductDescription(name, category)` - Write product descriptions
- `generateGrowthStrategy(profileStats)` - Analyze and suggest growth strategies
- `generateAdVisual(prompt, base64Image?)` - Generate advertising visuals
- `generateImage(prompt, base64Image?, aspectRatio?)` - General image generation
- `generateVideo(prompt, aspectRatio?)` - Video generation with Veo 3.1

### Environment Variables

- `GEMINI_API_KEY` - Required for AI features (injected via Vite)

## Important Patterns

### Tab Navigation

The app uses a `TabType` enum for navigation:

```typescript
enum TabType {
  SOCIAL = 'SOCIAL',
  CHATS = 'CHATS',
  MARKETPLACE = 'MARKETPLACE',
  AI_LAB = 'AI_LAB',
  WALLET = 'WALLET'
}
```

### Local Storage Keys

- `gigavibe_auth` - Authentication status
- `gigavibe_onboarded` - Onboarding completion status

### PWA Features

- Service worker registration in `App.tsx`
- Install prompt handling via `beforeinstallprompt` event
- Standalone mode detection for "Live" indicator

## UI/UX Guidelines

1. **Dark Theme**: The app uses a dark theme with black backgrounds
2. **Mobile-First**: Design for mobile viewport (max-width container)
3. **Animations**: Use subtle animations for feedback
4. **Modals**: Full-screen overlays with backdrop blur
5. **Buttons**: Include visual feedback (scale on press)
6. **Text Hierarchy**: Use font weights and sizes for hierarchy
   - Headers: `text-2xl font-black` or `text-3xl font-black`
   - Labels: `text-xs font-black uppercase tracking-widest`
   - Body: `text-sm`

## Common Gotchas

1. **Path Aliases**: Use `@/` for imports from root (configured in `tsconfig.json`)
2. **API Key**: Access via `process.env.API_KEY` (Vite injects this)
3. **Image Sources**: Demo uses `picsum.photos` for placeholder images
4. **Tailwind Animations**: Custom animations may be defined inline with `<style>` tags

## Testing Changes

After making changes:
1. Run `npm run dev` to verify the development build
2. Check for TypeScript errors
3. Test on mobile viewport (max-width: 448px container)
4. Verify PWA functionality if touching service worker or manifest

## Do Not

- Do not add external CSS files; use Tailwind classes
- Do not use class components; use functional components with hooks
- Do not store sensitive data in localStorage without encryption considerations
- Do not modify the service worker without understanding caching implications
