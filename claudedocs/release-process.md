# Release process — Wan2Fit

Procédure pour publier une nouvelle version, basée sur ce qu'on a fait pour la **v2.1.0** (mai 2026). Document vivant : à mettre à jour quand un step change ou qu'un nouveau outil entre en jeu (Capgo OTA, etc.).

## TL;DR pour une release web (état actuel)

```bash
# 1. Branche release depuis le dernier commit sain de develop
git checkout -b release/web-YYYY-MM-DD <sha>

# 2. Bump version
# Editer package.json + package-lock.json (npm install --package-lock-only)

# 3. Commit + push + PR vers main
git push -u origin release/web-YYYY-MM-DD
gh pr create --base main --title "release: ..." --body "..."

# 4. Merge sur main → Vercel auto-deploy wan2fit.fr
gh pr merge <num> --squash --delete-branch

# 5. Tag annotated sur main
MAIN_SHA=$(git rev-parse origin/main)
git tag -a vX.Y.Z -m "vX.Y.Z — résumé" $MAIN_SHA
git push origin vX.Y.Z

# 6. Migrations Supabase prod (si applicable)
npx supabase link --project-ref pipbhkaaqsltnvprmzrl
npx supabase migration list --linked    # voir l'écart
npx supabase db push --linked --yes     # pousser ce qui manque

# 7. Seed (si applicable)
VITE_SUPABASE_URL='https://pipbhkaaqsltnvprmzrl.supabase.co' \
SUPABASE_SERVICE_ROLE_KEY='<service_role>' \
npx tsx scripts/seed-X.ts

# 8. Cleanup : re-link DEV pour le quotidien
npx supabase link --project-ref rgwwpkyuavhqdautpciu
```

## Détails par étape

### 1. Choix du commit base

Identifier le dernier commit qu'on veut promouvoir en prod (cf. `git log develop`). Pour exclure des chantiers en cours dans `develop` (ex. PRs mobiles non testées E2E), partir d'un SHA antérieur au début du chantier — la release v2.1.0 est partie de `025d52c` pour exclure les 11 PRs Capacitor `#179..#189`.

### 2. Versioning

`package.json.version` doit refléter la sémantique de la release :
- **patch** (X.Y.Z+1) : fix-only, OTA-able
- **minor** (X.Y+1.0) : nouvelles features, breaking change UX modeste
- **major** (X+1.0.0) : breaking change utilisateur visible

Aligner avec la série de tags Git existants (vérifier `git tag --sort=-version:refname | head -5` avant de choisir).

`package-lock.json` doit être resync : `npm install --package-lock-only`.

### 3. PR release vers main

- Titre : `release: <résumé en une ligne>`
- Description : liste les PRs incluses (`gh pr list --base develop --state merged`), exclusions explicites, smoke test plan.
- **Ne pas merger** sans le feu vert explicite du PM (cf. `feedback_no_prod_deploy.md`).

### 4. Merge + Vercel deploy

- `gh pr merge --squash --delete-branch` → Vercel détecte le push sur main et déploie auto.
- Vercel deploy = ~3-5 min. Vérifier le status `gh pr view <num> --json state,mergedAt`.

### 5. Tag git

Tag **annotated** (pas léger) sur le commit de merge dans main. L'annotation porte le détail de la release pour qu'on retrouve facilement ce qui a shippé via `git show vX.Y.Z`.

### 6. Migrations Supabase prod

**Linked project** : par défaut le repo est linked sur DEV (`rgwwpkyuavhqdautpciu`). Pour pousser sur PROD il faut basculer le link. Toujours **re-linker DEV à la fin** pour ne pas faire de fausse manip ensuite.

**Migrations historiques non trackées** : prod a des migrations appliquées via Studio sans entry dans `schema_migrations`. Avant un `db push`, lister via `migration list --linked`. Si on voit des numéros locaux sans Remote :
- Si le SQL a déjà été appliqué (table existe en prod) → `migration repair --status applied <version>` pour marquer trackée sans rejouer.
- Si la migration est nouvelle → la laisser, elle sera dans le `db push`.

**Migrations Remote sans local** (timestamps comme `20260427184046`) = migrations créées via Studio, jamais committées côté repo. Les marquer `--status reverted` pour cleanup le tracker (les data restent en place).

### 7. Seed data

Pour des bulk inserts (recettes, programmes fixes, exercices…) : scripts `scripts/seed-*.ts` qui utilisent `SUPABASE_SERVICE_ROLE_KEY`. Récupérer la key via :

```bash
npx supabase projects api-keys --project-ref pipbhkaaqsltnvprmzrl
```

**Ne jamais** committer la key, ne jamais l'écrire dans un fichier. Inline dans la commande (`KEY=... npx tsx ...`) et c'est tout.

Les scripts sont **idempotents** (UPSERT) : on peut les rerun sans crainte.

### 8. Re-link DEV

Toujours finir par :
```bash
npx supabase link --project-ref rgwwpkyuavhqdautpciu
```

Sinon le prochain `supabase` sur ce repo touche prod par accident.

## Releases mobiles (futur, post-Capgo + Apple Dev validé)

À venir quand le chantier mobile sort de develop :

- **OTA via Capgo** (patches JS) : `npm run build:native && capgo upload --channel production`. Pas de re-submission stores.
- **Native rebuild** (changement de plugin natif, permission, bump SDK) : Xcode Archive → App Store Connect, Android Studio AAB → Play Console. Bump version requise.
- **Versioning multi-cibles** : `npm run sync:version` lit `package.json.version` et propage vers iOS (`MARKETING_VERSION` + `CURRENT_PROJECT_VERSION` dans `project.pbxproj`) et Android (`versionName` + `versionCode` dans `build.gradle`). Le code numérique = `major*10000 + minor*100 + patch` (e.g. `2.1.0` → `20100`), strictement croissant. Lancer ce script à chaque bump version, juste après l'edit de `package.json`.

## Glossaire

- **DEV project ref** : `rgwwpkyuavhqdautpciu`
- **PROD project ref** : `pipbhkaaqsltnvprmzrl`
- **Bundle ID** : `fr.wansoft.wan2fit`
