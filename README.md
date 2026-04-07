# Monstrolingo App

Translation application for Monster Hunter Wilds.

## Stack

- Svelte 5 + TypeScript  
- Vite  
- Tailwind CSS v4  
- UI components: shadcn-svelte / bits-ui  

## Prerequisites

- Node.js 20+ (recommended)  
- npm  

## Installation

```bash
npm install
```

## Scripts

- `npm run dev`: starts the development server  
- `npm run check`: runs Svelte + TypeScript checks  
- `npm run build`: builds for production  
- `npm run preview`: previews the local production build  

## Architecture (feature-based)

- `src/App.svelte`: main orchestrator (global state, API calls, local category/build routing)  
- `src/lib/features/layout/*`: sidebar and toolbar  
- `src/lib/features/category/*`: category table, details, parsers/builders  
- `src/lib/features/build/*`: build translation panel  
- `src/styles/global/*`: global tokens/theme/base  
- `src/styles/features/*`: lightweight feature-specific styles  

## Useful links

- Repository: https://github.com/MeowSH/monstrolingo_app  
- Issues / bug reports: https://github.com/MeowSH/monstrolingo_app/issues  
