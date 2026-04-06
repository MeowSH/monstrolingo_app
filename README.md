# Monstrolingo App

Application de traduction pour Monster Hunter Wilds.

## Stack

- Svelte 5 + TypeScript
- Vite
- Tailwind CSS v4
- Composants UI shadcn-svelte / bits-ui

## Prerequisites

- Node.js 20+ (recommande)
- npm

## Installation

```bash
npm install
```

## Scripts

- `npm run dev` : demarre le serveur de developpement
- `npm run check` : verification Svelte + TypeScript
- `npm run build` : build de production
- `npm run preview` : previsualisation du build local

## Architecture (feature-based)

- `src/App.svelte` : orchestrateur principal (etat global, appels API, routing local category/build)
- `src/lib/features/layout/*` : sidebar et toolbar
- `src/lib/features/category/*` : table categorie, detail, parsers/builders
- `src/lib/features/build/*` : panneau de traduction de build
- `src/styles/global/*` : tokens/theme/base globaux
- `src/styles/features/*` : styles legers par fonctionnalite

## Liens utiles

- Repository : https://github.com/MeowSH/monstrolingo_app
- Issues / bug reports : https://github.com/MeowSH/monstrolingo_app/issues
