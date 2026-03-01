# Wan Shape

Application de sport gratuite avec des séances guidées, des programmes structurés et un suivi de progression.

## Stack

- **Frontend** : React 19 + TypeScript 5.9 + Tailwind v4
- **Build** : Vite 7 (PWA via vite-plugin-pwa)
- **Backend** : Supabase (Auth, PostgreSQL, RLS)
- **Déploiement** : Vercel
- **Qualité** : Biome (lint + format), Knip (dead code)

## Démarrage

```bash
npm install
cp .env.example .env.local   # renseigner les clés Supabase
npm run dev
```

L'app fonctionne sans Supabase (les fonctionnalités auth/historique sont désactivées).

## Variables d'environnement

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | URL du projet Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Clé publique (anon/publishable) |

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build production (tsc + Vite) |
| `npm run preview` | Preview du build local |
| `npm run lint` | Lint + format (Biome) |
| `npx knip` | Détection de code mort |
| `npx tsx scripts/seed-programs.ts` | Seed des programmes (nécessite `SUPABASE_SERVICE_ROLE_KEY`) |

## Structure

```
src/
  components/       # Composants React (pages + UI)
  components/auth/  # Pages authentification
  contexts/         # AuthContext (Supabase Auth)
  data/             # Formats, exercices, programmes (seed)
  hooks/            # Hooks métier (useHistory, useProgram, useTheme...)
  lib/              # Client Supabase
  types/            # Types TypeScript
  utils/            # Utilitaires (images, difficulté, liens)
public/
  sessions/         # Séances JSON (contenu éditorial)
supabase/
  migrations/       # Migrations SQL
  email-templates/  # Templates email (confirm signup, reset password)
```

## Base de données

Deux migrations :

1. **001** : `profiles`, `organizations`, trigger `handle_new_user`, RLS
2. **002** : `session_completions`, `programs`, `program_sessions`, seed des 3 programmes fixes

## Licence

Propriétaire.
