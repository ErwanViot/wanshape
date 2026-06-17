# Mobile release runbook

Index central pour tous les processes mobiles Wan2Fit. Quand tu cherches "comment on fait X côté iOS/Android", commence ici. Si le runbook ne couvre pas X, c'est qu'on a un trou — l'ajouter immédiatement.

---

## Identifiants & comptes

### Apple Developer

- **Team ID** : `DL5537MH8T`
- **Bundle ID iOS** : `fr.wansoft.wan2fit` (fixe, jamais le changer une fois publié)
- **APNs Key** : `52L76VFUMS` (fichier `.p8` dans `~/Downloads/AuthKey_52L76VFUMS.p8`) — utilisée pour push notifications via Firebase
- **App Store Connect** : compte rattaché à `erwan.viot@gmail.com`
- **Small Business Program** : enroll obligatoire avant les IAP, voir [`iap-implementation/01-app-store-connect-setup.md`](./iap-implementation/01-app-store-connect-setup.md)

### Google Play

- **Account type** : Organisation (`Wan Soft`), D-U-N-S validé
- **Console** : <https://play.google.com/console/u/0/developers/6803029396623856678>
- **Package name** : `fr.wansoft.wan2fit`
- **Org ID Play Console** : `6803029396623856678`
- **App ID Play Console** : `4975323865234238857`
- **Important** : compte organisation = pas de pré-requis "12 testeurs / 14 jours" pour la promotion vers Production. Direct submit possible.

### Firebase

- **Project ID** : `wan-shape` (renommé ne traîne pas, c'est l'ancien nom)
- **Android app** : `fr.wansoft.wan2fit`, fichier `android/app/google-services.json`
- **iOS app** : `fr.wansoft.wan2fit`, fichier `ios/App/App/GoogleService-Info.plist`

### Supabase

- **DEV** : projet `rgwwpkyuavhqdautpciu` — utilisé par `npm run dev` (via `.env.local`)
- **PROD** : projet `pipbhkaaqsltnvprmzrl` — utilisé par les builds natifs (via `.env.production`)
- **Compte review Apple/Google** : `review@wan2fit.fr` / `WanReview2026!` — userId prod `625ebcd1-9d48-4702-949c-14a3b290e4fc`, premium activé manuellement, seedé avec données démo

### RevenueCat

- (à compléter après création du compte, voir [`iap-implementation/02-revenuecat-setup.md`](./iap-implementation/02-revenuecat-setup.md))

### Vercel

- **Project ID** : `prj_3pX0aBCx03CjZclLj3tS9sB4qz8e`
- **Org ID** : `team_wUoqxJCi36aq2sl4yaBgGsOa`
- **Project slug** : `wanshape` (legacy, l'app s'appelle Wan2Fit mais le projet Vercel garde l'ancien nom)
- **Pull les env vars Production en local** : `vercel env pull .env.production --environment=production`

---

## Build & signing

### iOS

- **Signing** : Automatic, Team `DL5537MH8T`, certificat Distribution déjà dans le Keychain du Mac
- **Provisioning profiles** : auto-générés par Xcode
- **Marketing version + build number** : driven by `package.json`, propagés via `npm run sync:version` (script `scripts/sync-version.ts`)
  - `versionName` = la version du `package.json`
  - `versionCode` = encodage `major*10000 + minor*100 + patch` (ex: 1.1.4 → 10104)
- **Archive en CLI** (alternative à Xcode UI) :
  ```bash
  cd ios/App
  xcodebuild -workspace App.xcworkspace -scheme App -configuration Release \
    -archivePath /tmp/Wan2Fit.xcarchive \
    -allowProvisioningUpdates \
    -destination 'generic/platform=iOS' archive
  ```
- **dSYM Sentry warning** lors de l'archive : non bloquant, tech-debt à fixer en ajoutant un build phase qui copie le dSYM Sentry. Pour l'instant on clique "Done" et on ignore.

### Android

- **Signing** : `signingConfigs.release` dans `android/app/build.gradle`, lit `android/keystore.properties` (gitignored)
- **Keystore** : `tmp/wan2fit-release.keystore` (gitignored — `tmp/` est dans le `.gitignore` root)
- **Alias** : `wan2fit`
- **Password** : `wan2fit-84d8eef62d450a0d63b7` (à conserver précieusement — perdu = plus jamais de mise à jour de l'app, faut republier sous un nouveau package)
- **SHA-256 fingerprint** : `1B:20:E0:38:0D:54:99:EB:55:88:8B:34:7D:57:94:F6:7F:66:11:29:85:25:2B:74:80:F4:C0:67:BE:A0:38:93`
- **assetlinks.json** déployé sur `wan2fit.fr/.well-known/assetlinks.json` doit avoir ce SHA pour que les App Links fonctionnent
- **Build AAB** :
  ```bash
  export JAVA_HOME=/opt/homebrew/Cellar/openjdk@21/21.0.11/libexec/openjdk.jdk/Contents/Home
  npm run build && npx cap sync android
  cd android && ./gradlew bundleRelease
  # AAB output: android/app/build/outputs/bundle/release/app-release.aab
  ```

### Cycle complet d'une release (version bump → store upload)

```bash
# 1. Bump version
npm version patch --no-git-tag-version
npm run sync:version

# 2. Build web (mode production = utilise .env.production = backend Supabase prod)
npm run build

# 3. Sync vers natif
npx cap sync

# 4a. iOS — Archive + upload via Xcode UI (Product > Archive > Distribute App > App Store Connect > Upload)
#     OU via CLI (voir ci-dessus xcodebuild archive)

# 4b. Android — Build AAB signé
export JAVA_HOME=/opt/homebrew/Cellar/openjdk@21/21.0.11/libexec/openjdk.jdk/Contents/Home
cd android && ./gradlew bundleRelease

# 5. Vérifier que le bundle pointe sur PROD
grep -rh -oE "https://[a-z0-9]+\.supabase\.co" ios/App/App/public/assets/ android/app/src/main/assets/public/assets/ | sort -u
# doit montrer pipbhkaaqsltnvprmzrl.supabase.co, PAS rgwwpkyuavhqdautpciu
```

---

## Store submissions

### Apple App Store

Workflow détaillé : [`apple-submission-runbook.md`](./apple-submission-runbook.md) *(à écrire — pour l'instant, voir l'historique dans les conversations)*

Récap rapide :
1. Bump version + build (voir section précédente)
2. Xcode > Product > Archive > Distribute App > App Store Connect > Upload
3. Attendre processing Apple (~15 min)
4. App Store Connect > Wan2Fit > version en review > Build > sélectionner le nouveau build
5. Save
6. Si la submission est rejetée ou nouvelle : Submit for Review

**Compte de test pour le reviewer** : déclarer `review@wan2fit.fr` / `WanReview2026!` dans App Information → Sign-in Required → Demo Account.

**Resolution Center** : si Apple flag une issue, répondre dans App Store Connect → version → Resolution Center, message en anglais, courtois, factuel, en pointant le build qui contient le fix.

### Google Play Store

Workflow détaillé : [`play-store-submission-runbook.md`](./play-store-submission-runbook.md) *(à écrire)*

Récap rapide :
1. Build AAB signé (voir section précédente)
2. Play Console > Wan2Fit > Tester et publier > track (Tests internes / Tests fermés / Production)
3. Créer une release > Importer l'AAB OU "Ajouter à partir de la bibliothèque" (si déjà uploadé)
4. Remplir notes de version (FR + EN), placeholder `<fr-FR>…</fr-FR><en-US>…</en-US>`
5. Suivant > Examiner > corriger éventuelles erreurs > Enregistrer
6. Vue d'ensemble de la publication > "Envoyer N modifications pour examen"
7. Google examine (1-7j, plus long pour le 1er compte)
8. **Publication gérée activée par défaut** — après approbation Google, l'app reste cachée du store tant qu'on ne clique pas "Publier N modification"

**Compte organisation Wan Soft** : pas de pré-requis 12 testeurs / 14 jours. Direct Production possible.

**Pays/Régions** : à configurer dans Production > Pays/Régions séparément. Pour Wan2Fit on a sélectionné les 177 disponibles (monde entier).

---

## CI / Backend

### Edge functions Supabase

- Toutes dans `supabase/functions/<name>/index.ts`
- **Toujours déployer avec `--no-verify-jwt`** : on utilise des publishable keys (pas anon JWT), Supabase Gateway rejette sinon
  ```bash
  npx supabase functions deploy <name> --no-verify-jwt --project-ref pipbhkaaqsltnvprmzrl  # PROD
  npx supabase functions deploy <name> --no-verify-jwt --project-ref rgwwpkyuavhqdautpciu  # DEV
  ```
- **Règle stricte** : pas de déploiement PROD sans validation explicite de l'utilisateur. DEV librement.
- CORS partagé dans `supabase/functions/_shared/cors.ts`. La whitelist inclut `wan2fit.fr`, `www.wan2fit.fr`, `capacitor://localhost` (iOS Capacitor), `https://localhost` + `http://localhost` (Android Capacitor).

### Vercel deployments

- Push sur n'importe quelle branche → preview deploy auto
- Merge sur `main` → deploy production sur `wan2fit.fr`
- Convention : PRs ciblent **toujours `develop`**, **jamais `main`**. Le PM merge `develop` → `main` quand il est prêt à promouvoir une release web.

---

## Données démo & seeds

- **Compte review (PROD)** : `review@wan2fit.fr` — voir la mémoire Claude `reference_review_account.md`
- **Seed prod du compte review** : script SQL préservé dans la conversation (à archiver dans `claudedocs/seeds/` quand on aura du temps)
- **Compte personnel dev** : `erwan.viot@gmail.com` — seedé en DEV avec 23 séances complétées, 34+ meal logs, 7 recettes favorites, programme Débutant 4 sem en cours

---

## Sous-chantiers

- **[IAP Apple StoreKit](./iap-implementation/)** — en cours, après le rejet Apple 3.1.1 du 2026-06-07
- **[Audit pre-merge develop 2026-04-25](./audit-pre-merge-develop-2026-04-25.md)** — audit historique
- **[Mobile dev guide](./mobile-dev.md)** — notes dev mobile générales

---

## Trous à combler (TODO)

- Runbook dédié Apple App Store (`apple-submission-runbook.md`)
- Runbook dédié Google Play (`play-store-submission-runbook.md`)
- Documentation officielle des secrets Supabase (quels secrets sont dans le dashboard PROD vs DEV)
- Documentation officielle des secrets Vercel (qui correspond à quelle var dans `.env.production`)
- Procédure de rotation du keystore Android (si compromis)
- Procédure de rotation du certificat Apple Distribution (si compromis)
