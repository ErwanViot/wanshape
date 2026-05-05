# Plan de migration Wan2Fit Mobile (iOS + Android)

**Stratégie** : wrapping Capacitor de la PWA existante, big-bang release, monétisation Spotify-style (0% IAP), stack Sentry + Capgo + PostHog + HealthKit/Health Connect.

**Durée estimée** : ~3 semaines de dev solo + 1-2 semaines review stores.

**Git flow** : chaque phase = 1 PR vers `develop` (sauf mentions parallèles). Utiliser le skill `/commit-push-review` pour les PRs multi-fichiers.

---

## Avancement réel (mis à jour 2026-05-05)

| Phase | PR(s) | Statut | Notes |
|---|---|---|---|
| Foundation Capacitor | [#179](https://github.com/ErwanViot/wanshape/pull/179) | ✅ | |
| Auth storage natif + deep links + AASA | [#180](https://github.com/ErwanViot/wanshape/pull/180) | ✅ | TODO_APPLE_TEAM_ID + TODO_ANDROID_RELEASE_SHA256 à remplacer avant 1ʳᵉ soumission |
| Wake Lock + Network + OfflineBanner | [#181](https://github.com/ErwanViot/wanshape/pull/181) | ✅ | iOS WebView WakeLock cassé → plugin natif keep-awake |
| Paywall SSO via magic link | [#182](https://github.com/ErwanViot/wanshape/pull/182) | ✅ | Apple 3.1.3(b) respecté |
| Account deletion (Apple 5.1.1.v) | [#183](https://github.com/ErwanViot/wanshape/pull/183) | ✅ | |
| Push notifications FCM | [#184](https://github.com/ErwanViot/wanshape/pull/184) | ✅ | Migration 025, register-push-device + send-push |
| iOS + Android natifs (cap add) | [#185](https://github.com/ErwanViot/wanshape/pull/185) | ✅ | JDK 21 requis, iOS via SPM (pas Pods) |
| App icon Wan2Fit | [#186](https://github.com/ErwanViot/wanshape/pull/186) | ✅ | `npm run icons` pour régénérer |
| Mobile header truncation | [#187](https://github.com/ErwanViot/wanshape/pull/187) | ✅ | |
| Health foundation pure-TS | [#188](https://github.com/ErwanViot/wanshape/pull/188) | ✅ | Calorie estimator + format → HK/HC mappers, 10 tests |
| iOS Privacy Manifest | [#189](https://github.com/ErwanViot/wanshape/pull/189) | ✅ | Required Reasons APIs déclarées |
| Sentry Capacitor (crashs natifs) | [#191](https://github.com/ErwanViot/wanshape/pull/191) + [#192](https://github.com/ErwanViot/wanshape/pull/192) | ✅ | Pin `@sentry/react@10.43.0` |
| Onboarding carousel (4 écrans) | [#194](https://github.com/ErwanViot/wanshape/pull/194) + [#196](https://github.com/ErwanViot/wanshape/pull/196) | ✅ | Native-only, gate via Preferences |
| Tests deep-link + auth-redirects | [#195](https://github.com/ErwanViot/wanshape/pull/195) | ✅ | 13 tests, jsdom devDep |
| Doc rebrand DESIGN_SYSTEM | [#197](https://github.com/ErwanViot/wanshape/pull/197) | ✅ | |

**Release web associée** : [#190](https://github.com/ErwanViot/wanshape/pull/190) → tag `v2.1.0` → wan2fit.fr (recettes + nutrition retro + nav + POC acquisition). Migrations prod 023+024 appliquées + 49 recettes FR/EN seedées.

### Restant

**Sans bloqueur externe** :
- Splash screen polish (animation transition, fond brand)

**Bloqué par Apple Developer enrollment** (D-U-N-S en cours) :
- Associated Domains entitlement iOS (`applinks:wan2fit.fr`)
- Push Notifications + Background Modes entitlements iOS
- Health bridge natif (HealthKit capability + plugins iOS/Android)
- Code signing iOS + TestFlight + soumission App Store

**Bloqué par comptes externes à créer** :
- PostHog Cloud EU (gratuit) — analytics
- Capgo (14-99 €/mois) — OTA updates
- Firebase project + APNs key (.p8) + `google-services.json` — push réellement fonctionnel

**Bloqué par assets à fournir** :
- Apple Team ID (post enrollment) → remplacer `TODO_APPLE_TEAM_ID` dans `apple-app-site-association`
- Android release keystore SHA-256 → remplacer `TODO_ANDROID_RELEASE_SHA256` dans `assetlinks.json`
- Demo account App Review (`review@wan2fit.fr`)
- Screenshots stores

---

## Phase 0 — Pré-requis externes (en parallèle de tout le dev)

**À provisionner par toi avant de débloquer certaines phases.** Peut se faire pendant que le dev Phase 1-2 tourne.

| Élément | Pour débloquer | Coût | Temps setup |
|---|---|---|---|
| **Apple Developer Program** (Wan Soft entity) | Phase 9 (soumission) | 99 $/an | 24-48 h validation |
| **Google Play Console** (Wan Soft) | Phase 9 (soumission) | 25 $ one-shot | ~1 h |
| **Firebase project** (wan2fit-prod) | Phase 4 (push) | gratuit | 10 min |
| **APNs key** (Apple Dev Console) | Phase 4 (push iOS) | inclus 99 $ | 15 min |
| **Firebase Service Account** (JSON) | Phase 4 (edge fn) | gratuit | 5 min |
| **RevenueCat account** | Phase 3 (paywall) | gratuit <2 500 $ MTR | 30 min (incl. connexion Stripe) |
| **Capgo account** | Phase 7 (OTA) | 14 €/mois starter | 15 min |
| **PostHog Cloud EU** | Phase 7 (analytics) | gratuit <1M events | 10 min |
| **Bundle ID finalisé** | Phase 1 (config Capacitor) | 0 | 5 min de décision |
| **Reverse-DNS scheme** | Phase 2 (deep links) | 0 | à trancher : `wan2fit://` |
| **AASA + assetlinks.json hosting** | Phase 2 (Universal Links) | déjà Vercel | 15 min |

**Bundle ID proposé** : `fr.wansoft.wan2fit` (raison sociale = Wan Soft, produit = Wan2Fit). À confirmer.

---

## Phase 1 — Foundation Capacitor (PR #1)

**Branche** : `feature/capacitor-foundation`
**Effort** : 1-2 j
**Pré-requis** : Bundle ID décidé

### Fichiers créés
- `capacitor.config.ts` (racine)
- `ios/` (projet Xcode généré par `cap add ios`)
- `android/` (projet Gradle généré par `cap add android`)
- `src/lib/platform.ts` (détection natif/web)
- `resources/icon.png` + `resources/splash.png` (1024×1024 + 2732×2732)

### Fichiers modifiés
- `package.json` : scripts `build:mobile`, `cap:sync`, `cap:ios`, `cap:android`
- `vite.config.ts` : SW disable conditionnel selon cible build
- `src/main.tsx` : skip SW register si `Capacitor.isNativePlatform()`
- `src/index.css` : `env(safe-area-inset-*)` sur BrandHeader + BottomNav
- `index.html` : CSP meta (fallback pour natif) + viewport-fit=cover

### Packages
```
npm i @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
npm i @capacitor/status-bar @capacitor/splash-screen @capacitor/haptics
npm i -D @capacitor/assets
```

### Acceptance criteria
- [ ] `npm run build && npx cap sync` passe sans erreur
- [ ] `npx cap open ios` → Xcode → Run → app se lance sur simulateur iPhone 15, affiche Home
- [ ] `npx cap open android` → Android Studio → Run → app se lance sur émulateur Pixel 7, affiche Home
- [ ] Signup + login fonctionnent (via Supabase existant, même si deep link pas encore branché)
- [ ] Une séance existante (programme fixe) se lance et se termine
- [ ] Safe-area respecté sur notch iPhone 15 + barre système Android 14
- [ ] Status bar foncée en haut (cohérent avec theme `#0f0f17`)
- [ ] Splash screen s'affiche <2 s puis fade out

### Risques
- **SW conflit** : si register SW se déclenche en natif, bug d'assets. Double-check détection plateforme.
- **CSP trop stricte** : le CSP actuel de `vercel.json` ne s'applique pas en natif, on la porte en meta mais attention à `'unsafe-eval'` pour Capacitor Bridge (nécessaire).

---

## Phase 2 — Auth natif + deep links (PR #2)

**Branche** : `feature/capacitor-auth-deeplinks`
**Effort** : 1-2 j
**Dépend de** : PR #1 mergée

### Fichiers créés
- `src/lib/storage.ts` : abstraction Preferences/localStorage
- `src/hooks/useDeepLink.ts` : listener `App.addListener('appUrlOpen')`
- `public/.well-known/apple-app-site-association` (servi par Vercel)
- `public/.well-known/assetlinks.json`

### Fichiers modifiés
- `src/lib/supabase.ts` : adapter storage via Preferences en natif
- `src/contexts/AuthContext.tsx:177` : `resetPassword` redirect → `wan2fit://reset-password` en natif, URL web sinon
- `src/components/auth/AuthCallback.tsx` : handle deep link en plus du parsing URL classique
- `ios/App/App/Info.plist` : scheme `wan2fit` + Associated Domains
- `android/app/src/main/AndroidManifest.xml` : intent-filter scheme + App Links
- `capacitor.config.ts` : `server.allowNavigation` + scheme
- `vercel.json` : headers spécifiques pour AASA (Content-Type JSON, pas de rewrite)

### Packages
```
npm i @capacitor/preferences @capacitor/app
```

### Supabase config
- Auth → URL Configuration → ajouter `wan2fit://auth/callback` + `wan2fit://reset-password` aux Redirect URLs
- Vérifier que `https://wan2fit.fr/*` y est déjà

### Acceptance criteria
- [ ] Clean install → signup → session persistée après kill & relaunch app
- [ ] Clear app data → re-login → session recréée proprement
- [ ] Reset password : email reçu → lien ouvre l'app (pas Safari) → flow reset continue dans l'app
- [ ] Universal Link : share `https://wan2fit.fr/programmes/remise-en-forme` depuis iMessage → ouvre l'app directement sur cette route (si app installée)
- [ ] Magic link Supabase (si utilisé) ouvre l'app et authentifie
- [ ] AASA accessible sur `https://wan2fit.fr/.well-known/apple-app-site-association` avec Content-Type `application/json`

### Risques
- **Token rotation Supabase + HMR** : ton code a déjà un lock custom pour éviter le bug Navigator Locks. Vérifier que ça reste compatible avec Preferences plugin.
- **AASA caching** : Apple cache l'AASA agressivement (~1 semaine). Bien tester avec `xcrun swift-atools` ou reset device settings.

---

## Phase 3 — Paywall Spotify-style + RevenueCat (PR #3)

**Branche** : `feature/capacitor-paywall-sso`
**Effort** : 3-5 j
**Dépend de** : PR #2 mergée + compte RevenueCat + Stripe branché sur RC

### Fichiers créés
- `supabase/functions/create-web-upgrade-link/index.ts` (edge function magic link)
- `supabase/functions/revenuecat-webhook/index.ts` (consolidation Stripe+Apple+Google via RC)
- `src/lib/revenuecat.ts` : init + abstraction
- `src/hooks/usePremiumEntitlement.ts` : check RC entitlement
- Route web `/upgrade` : hydrate session + auto-redirect vers `/pricing?from=mobile`

### Fichiers modifiés
- `src/hooks/useSubscription.ts` : `checkout()` devient différent en natif (ouvre `Browser` avec magic link) vs web (flow actuel)
- `src/components/auth/AuthCallback.tsx` : gérer `?source=ios` pour UX post-magic-link
- `supabase/functions/stripe-webhook/index.ts` : **garde le double forward** (vers table `subscriptions` + vers RC si cross-platform activé plus tard)
- `.env.example` : `VITE_REVENUECAT_API_KEY_IOS`, `VITE_REVENUECAT_API_KEY_ANDROID`, `VITE_REVENUECAT_API_KEY_WEB`

### Packages
```
npm i @revenuecat/purchases-capacitor @capacitor/browser
```

### RevenueCat setup
1. Créer projet RC "Wan2Fit"
2. Connecter Stripe account (API key) → RC sync auto les abonnements existants
3. Créer entitlement `premium`
4. Lier au produit Stripe `price_xxx` (tu as déjà `priceId` dans `useSubscription`)
5. Webhook RC → pointer vers edge function `revenuecat-webhook`
6. **Pas de produit iOS/Android** au début (Spotify-style, pas d'IAP)

### Flow bout-en-bout testé
1. User mobile non-premium tape "Débloquer IA"
2. App call edge fn `create-web-upgrade-link` avec JWT mobile
3. Edge fn génère magic link Supabase vers `https://wan2fit.fr/upgrade`
4. `Browser.open()` → SFSafariViewController ouvre la page
5. Page `/upgrade` : session auto hydratée via hash URL
6. Auto-redirect `/pricing` → user clique "Valider" → Stripe Checkout
7. Success → Stripe redirect `wan2fit.fr/upgrade-success` → `<script>window.location = 'wan2fit://upgrade-success'`
8. iOS/Android interceptent le scheme → app se ré-ouvre
9. App reçoit deep link via `App.addListener('appUrlOpen')` → `Purchases.syncPurchases()` → entitlement `premium` = active
10. UI débloque les features IA

### Acceptance criteria
- [ ] User mobile non-premium → tap "Débloquer" → arrive sur `/pricing` wan2fit.fr **déjà connecté**
- [ ] Paiement Stripe → revient automatiquement dans l'app (pas besoin de switch manuel)
- [ ] Features IA débloquées sous 3 s après retour
- [ ] User qui s'abonne sur web (hors app) → ouvre app → premium reconnu immédiatement
- [ ] `useSubscription().isPremium` reste la seule source de vérité côté UI (source agnostic via RC)
- [ ] Cas edge : user annule paiement Stripe → revient dans l'app → pas d'état foireux

### Risques
- **Stripe → RC delay** : webhook RC peut prendre 10-30 s après paiement. Prévoir polling `Purchases.syncPurchases()` sur 60 s si entitlement pas encore reçu.
- **RevenueCat sans IAP iOS** : config edge case, s'assurer que Apple ne demande pas de produits IAP déclarés. Normalement OK tant que l'app ne call pas `Purchases.purchase()`.

---

## Phase 4 — Push notifications (PR #4)

**Branche** : `feature/capacitor-push-notifications`
**Effort** : 3 j
**Dépend de** : PR #1 mergée + Firebase project + APNs key

### Fichiers créés
- `supabase/migrations/005_push_notifications.sql` (tables `user_devices`, `notification_preferences`)
- `supabase/functions/send-push/index.ts` (FCM HTTP v1 avec JWT service account maison)
- `supabase/functions/_shared/fcm-jwt.ts` (génération JWT Deno-compatible)
- `src/lib/push.ts` : `registerPushNotifications()` + listeners
- `src/hooks/usePushRegistration.ts` : enregistrement à la connexion
- `src/components/settings/NotificationPreferences.tsx`
- `android/app/src/main/google-services.json` (depuis Firebase console)
- `ios/App/App/GoogleService-Info.plist`

### Fichiers modifiés
- `src/contexts/AuthContext.tsx` : call `usePushRegistration` post-login
- `supabase/functions/generate-session/index.ts` : à fin de génération, trigger `send-push` avec `type: 'ai_generation_ready'`
- `supabase/functions/generate-program/index.ts` : idem

### Packages
```
npm i @capacitor/push-notifications
```

### Schema DB (concis, détail dans la migration)
```sql
create table user_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  fcm_token text not null,
  platform text check (platform in ('ios','android','web')),
  last_seen_at timestamptz default now(),
  unique(user_id, fcm_token)
);

create table notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  ai_generation_ready boolean default true,
  program_milestones boolean default true,
  coach_content boolean default false,
  overtraining_warnings boolean default true,
  updated_at timestamptz default now()
);

-- RLS : user peut lire/maj que ses propres prefs & devices
alter table user_devices enable row level security;
alter table notification_preferences enable row level security;
-- policies: user_id = auth.uid()
```

### Catalogue V1 des notifs (décision reportée)
À définir ensemble plus tard, mais le système code les 4 types déjà prévus dans `notification_preferences`. Les wording et triggers précis seront ajoutés en PR dédiée.

**Seule notif activée live en PR #4** : `ai_generation_ready` (déclenchée par les edge functions de génération IA). Les autres sont câblées mais pas déclenchées.

### Acceptance criteria
- [ ] Install clean → permission prompt au bon moment (après génération IA, pas au D1)
- [ ] Acceptation → token FCM enregistré en DB
- [ ] Trigger manuel via `supabase functions invoke send-push` → notif reçue en <5 s sur device réel
- [ ] Tap notif → ouvre l'app sur route `/seance/custom/:id` (deep link via payload `data.route`)
- [ ] Révoquer permission système → app ne crash pas, `registerPushNotifications()` no-op
- [ ] Settings toggle off sur un type → pas de notif pour ce type

### Risques
- **APNs sandbox vs prod** : TestFlight utilise APNs sandbox, App Store utilise prod. Vérifier que la config Firebase pointe la bonne env. Double key parfois nécessaire.
- **Android 13+ permission** : runtime prompt obligatoire. Vérifier qu'on le gère (plugin le fait mais check UI).

---

## Phase 5 — HealthKit + Health Connect (PR #5)

**Branche** : `feature/capacitor-health-integration`
**Effort** : 4 j
**Dépend de** : PR #1 mergée

### Fichiers créés
- `supabase/migrations/006_health_sync.sql` (colonnes `profiles.sync_health`, `profiles.weight_kg`, table `health_syncs`)
- `src/lib/health.ts` : abstraction multi-plateforme
- `src/lib/health-ios.ts` : implémentation HealthKit
- `src/lib/health-android.ts` : implémentation Health Connect
- `src/lib/calorie-estimator.ts` : MET-based calculation par format
- `src/components/settings/HealthSync.tsx` : toggle + champ poids

### Fichiers modifiés
- `src/hooks/useSaveCompletion.ts` : post-save, call `syncWorkoutToHealth()` si opt-in
- `ios/App/App/Info.plist` : `NSHealthUpdateUsageDescription`
- `android/app/src/main/AndroidManifest.xml` : permissions `health.WRITE_*`
- `android/app/build.gradle` : minSdk 28 pour Health Connect (feature-flag si on reste minSdk 26 pour le reste)

### Packages
```
npm i @perfood/capacitor-healthkit @kiwi-health/capacitor-health-connect
```

### Mapping formats Wan2Fit → HealthKit types
```
'hybrid'         → HKWorkoutActivityTypeHighIntensityIntervalTraining
'hiit'           → HKWorkoutActivityTypeHighIntensityIntervalTraining
'strength'       → HKWorkoutActivityTypeTraditionalStrengthTraining
'cardio'         → HKWorkoutActivityTypeMixedCardio
'yoga'           → HKWorkoutActivityTypeYoga
'core'           → HKWorkoutActivityTypeCoreTraining
'mobility'       → HKWorkoutActivityTypeFlexibility
'unknown/other'  → HKWorkoutActivityTypeOther
```

### Table MET
Dans `calorie-estimator.ts`, constante par format. Fallback poids 70 kg si `profile.weight_kg` null.

### Acceptance criteria
- [ ] Settings → toggle "Sync Santé" → permission prompt système (HealthKit)
- [ ] Fin de séance → workout apparaît dans app Santé iOS (vérif visuelle)
- [ ] Ring Exercice Apple Watch se remplit proportionnellement aux calories estimées
- [ ] Android 14 avec Health Connect installé : workout apparaît dans l'app Health Connect
- [ ] Android 8-13 sans Health Connect : toggle grisé, message "Installer Health Connect"
- [ ] Re-sync pas de doublon (check table `health_syncs` avant écriture)
- [ ] Champ poids optionnel, calculs OK avec valeur par défaut sinon
- [ ] Permission HealthKit révoquée après coup → sync silencieux échoue proprement (log Sentry, pas crash)

### Risques
- **Permissions granulaires iOS** : user peut autoriser write sans read. Ne pas supposer que l'un implique l'autre.
- **Health Connect minSdk 28** : décision à confirmer. Alternative : minSdk 26 global + feature-flag HC pour 28+.

---

## Phase 6 — Onboarding mobile + i18n scaffold (PR #6)

**Branche** : `feature/capacitor-onboarding`
**Effort** : 1-2 j
**Dépend de** : PR #4 + PR #5 (pour les permission prompts séquencés)

### Fichiers créés
- `src/i18n/fr.ts` : toutes les strings centralisées
- `src/i18n/index.ts` : helper `t(key)`
- `src/components/onboarding/OnboardingCarousel.tsx` (3-4 slides swipe)
- `src/components/onboarding/OnboardingSlide.tsx`
- `src/hooks/useOnboarding.ts` : flag localStorage/Preferences `onboarding_completed`

### Fichiers modifiés (refacto progressive, pas tout d'un coup)
- `src/components/Home.tsx`, routes clés : importer strings depuis `i18n/fr.ts`
- `src/App.tsx` ou router : check `onboarding_completed` au premier lancement, render Onboarding sinon
- Flow permissions : après slide 3, prompt notifications ; après premier usage IA, prompt Health

### Slides proposés (wording à affiner)
1. **Bienvenue** — "Ta séance de sport, prête à lancer" + visuel signature
2. **Formats & programmes** — "8 formats, 3 programmes, des exercices ciblés" + carrousel
3. **IA personnalisée** — "Des séances générées selon tes objectifs" + teaser premium (sans prix)
4. **On te prévient ?** — permission notifs contextualisée

### Acceptance criteria
- [ ] Clean install → onboarding s'affiche
- [ ] Skip possible → direct Home
- [ ] Complétion → flag persisté, pas re-affiché
- [ ] Réinstall → onboarding s'affiche à nouveau (normal)
- [ ] Permission notifs proposée dans l'onboarding, pas au D1 brutal
- [ ] Toutes les strings en natif viennent de `i18n/fr.ts` (pas de hardcoded)
- [ ] Web : onboarding non affiché (comportement inchangé)

---

## Phase 7 — Analytics PostHog + OTA Capgo (PR #7)

**Branche** : `feature/capacitor-observability`
**Effort** : 1-2 j
**Dépend de** : compte PostHog + compte Capgo

### Fichiers créés
- `src/lib/analytics.ts` : wrapper PostHog avec typed events
- `src/lib/capgo.ts` : config updater + listener update ready
- `src/hooks/useAnalytics.ts` : track funnel signup, première séance, etc.

### Fichiers modifiés
- `src/contexts/AuthContext.tsx` : identify PostHog user post-login
- `src/main.tsx` : init PostHog + Capgo updater
- `src/hooks/useSaveCompletion.ts` : track `session_completed`
- `src/hooks/useGenerateSession.ts`, `useGenerateProgram.ts` : track `ai_generation_started/completed`
- Boutons upgrade : track `upgrade_cta_clicked`, `upgrade_web_opened`, `upgrade_completed`
- `.env` : `VITE_POSTHOG_KEY`, `VITE_POSTHOG_HOST` (EU cloud), `VITE_CAPGO_APP_ID`

### Packages
```
npm i posthog-js @capgo/capacitor-updater
```

### Events instrumentés V1
- `signup_completed` (source: web|ios|android)
- `first_session_completed`
- `session_completed` (format, duration, source program/custom/fixed)
- `session_abandoned` (at_percent, format)
- `ai_generation_started` / `ai_generation_completed` (duration)
- `upgrade_cta_clicked` / `upgrade_web_opened` / `upgrade_completed`
- `health_sync_enabled` / `health_sync_disabled`
- `push_permission_granted` / `push_permission_denied`
- `onboarding_completed` / `onboarding_skipped`

### Acceptance criteria
- [ ] Events remontent sur PostHog dashboard EU
- [ ] User identify post-login (user_id Supabase → PostHog distinct_id)
- [ ] Funnel signup → première séance mesurable sur 7 j
- [ ] Capgo : push d'un update JS mineur → app récupère automatiquement au prochain cold start
- [ ] Rollback test : Capgo rollback → app revient au bundle précédent

### Risques
- **Privacy labels App Store** : PostHog + Sentry + RevenueCat + FCM = 4 déclarations. À préparer pour Phase 8.
- **Capgo bundle size limit** : ~50 MB par bundle, OK pour ton app.

---

## Phase 8 — Polish, assets stores, privacy (PR #8)

**Branche** : `feature/capacitor-store-ready`
**Effort** : 2-3 j (+2 j assets marketing en parallèle)

### Fichiers créés / assets
- `src/lib/haptics.ts` : wrapper `Haptics.impact()` pour countdown 3-2-1 du player
- `resources/android/adaptive-icon/` (foreground + background layers)
- Screenshots App Store (iPhone 15 Pro Max, iPhone 8 Plus, iPad) — 6-8 shots par taille
- Screenshots Play Store (phone, tablet) — 6-8 shots
- Video preview App Store (optionnel, 15-30 s)
- `docs/app-store-description.md` (FR)
- `docs/privacy-labels.md` (déclarations pour Apple + Google)

### Fichiers modifiés
- `src/components/workout/Player.tsx` (ou équivalent) : ajout haptics sur countdown final
- `app-info.json` / Info.plist : name, subtitle, keywords, category (Health & Fitness)
- Politique de confidentialité `legal/privacy` : ajouter mentions Sentry, PostHog, RevenueCat, FCM, HealthKit, deep links, RevenueCat
- `ios/App/App/Info.plist` : toutes les `*UsageDescription` en français

### Privacy Labels à déclarer
| Data type | Collected | Linked to user | Tracking |
|---|---|---|---|
| Contact Info (email) | Yes (Supabase auth) | Yes | No |
| User Content (sessions, programs) | Yes | Yes | No |
| Identifiers (user_id) | Yes (Supabase, Sentry, PostHog) | Yes | No |
| Usage Data (events) | Yes (PostHog) | Yes | No |
| Diagnostics (crashes) | Yes (Sentry) | Yes | No |
| Health & Fitness | Yes (si opt-in) | Yes | No |
| Purchases | Yes (RevenueCat) | Yes | No |

**Pas de "Tracking"** (pas d'IDFA, pas de cross-site tracking) → **pas besoin d'ATT prompt iOS**. Gros gain UX.

### Acceptance criteria
- [ ] Icons adaptives Android OK sur Pixel (fond thématique)
- [ ] Screenshots respectent guidelines Apple (pas de mock frame, 72 DPI min)
- [ ] Description FR finale rédigée (4000 caractères max)
- [ ] 10 keywords ASO sélectionnés (max 100 caractères total iOS)
- [ ] Privacy policy wan2fit.fr à jour (lien dans App Store + Play Store listing)
- [ ] Demo account Supabase pour App Review (credentials à fournir)
- [ ] Haptic countdown testé sur device réel iOS + Android

---

## Phase 9 — Soumission & lancement (pas de PR, ops)

**Effort** : 1 j dev + 5-10 j calendaires review

### iOS checklist
- [ ] Archive via Xcode → upload App Store Connect
- [ ] TestFlight internal test (toi + 2-3 users de confiance, 3-5 j)
- [ ] Feedback intégré → nouvelle build si besoin
- [ ] Soumission App Review avec demo account
- [ ] Review : 1-7 j (moyenne 24-48 h)
- [ ] Si rejet : fix rapide, re-soumission (~24 h nouvelle review)
- [ ] Approbation → release manuelle au moment voulu (pas d'auto-release)

### Android checklist
- [ ] Upload AAB sur Play Console
- [ ] Internal testing track (identique users TestFlight)
- [ ] Promotion Closed → Open testing → Production
- [ ] Review Play Store : quelques heures
- [ ] Rollout progressif 10% → 50% → 100% sur 48 h

### Rejets Apple probables pour Wan2Fit (préparer les réponses)
1. **Guideline 3.1.1 (IAP manquant)** : répondre que l'app fonctionne en Spotify-style (3.1.3b Multiplatform Service), l'abonnement est acquis sur le web, pas proposé dans l'app. Citer Spotify/Netflix comme précédents.
2. **Guideline 5.1.1 (données santé sans justification)** : justifier l'usage HealthKit (sync workouts pour ring Apple Watch).
3. **Guideline 4.2 (minimal functionality)** : montrer richesse du free tier (programmes, exercices, formats, suivi). Peu de risque.

### Marketing lancement (parallèle)
- Email users wan2fit.fr existants : "L'app est là"
- Deep link email → ouvre la page App Store/Play Store selon device
- Post réseaux sociaux
- Mention sur wan2fit.fr (sticky banner "Télécharger l'app")

---

## Parallélisation possible

```
Semaine 1
├─ Jour 1-2 : PR #1 Foundation
├─ Jour 3-4 : PR #2 Auth + deep links
└─ Jour 5-7 : PR #3 Paywall SSO (gros morceau)

Semaine 2
├─ Jour 8-10 : PR #4 Push notifications
└─ Jour 11-13 : PR #5 Health integration

Semaine 3
├─ Jour 14-15 : PR #6 Onboarding + i18n
├─ Jour 16-17 : PR #7 Analytics + OTA
└─ Jour 18-20 : PR #8 Polish + assets stores (+ prépa soumission)

Semaine 4 (calendaire)
└─ TestFlight + Play Internal QA + soumission + review
```

**Parallélisable** (peut se faire pendant le dev) :
- Provisionnement comptes externes (Phase 0) → **semaine 1**
- Screenshots + description App Store → **semaine 2-3**
- Catalogue précis des push notifications (à définir avec toi) → **semaine 2**
- Privacy policy update → **semaine 3**

---

## Risques globaux & plans B

| Risque | Impact | Mitigation |
|---|---|---|
| Rejet App Review Spotify-style | 2-5 j de délai | Préparer rebuttal référencé. Plan B : activer IAP fallback via RC en 1 j si Apple insiste |
| APNs key perdue / mal configurée | Push off sur iOS | Re-génération immédiate via Apple Dev Console (~15 min) |
| Stripe → RC sync delay | Premium pas actif immédiatement | Polling `syncPurchases` sur 60 s après retour |
| Capgo down au moment d'un hotfix | Obligé de passer par App Review | Plan B : release classique forcée |
| Health Connect indispo Android 8-10 | Features health off sur ~15% users | Feature-flag gracieux, pas bloquant |
| Bundle ID `fr.wansoft.wan2fit` déjà pris | Renomer | Check `reverse-dns.dev` avant setup |

---

## Questions encore ouvertes (réponses nécessaires avant de démarrer)

1. **Bundle ID** : `fr.wansoft.wan2fit` OK ? Alternatives : `fr.wan2fit.app`, `com.wansoft.wan2fit`
2. **Minimum Android** : maintient-on **minSdk 26** avec feature-flag Health Connect pour 28+, ou passe-t-on à **minSdk 28** d'emblée (simplification au prix de ~9% users Android) ?
3. **Apple Developer entity** : compte au nom de Wan Soft (raison sociale) ou perso ? (Wan Soft recommandé pour la séparation légale, nécessite D-U-N-S number gratuit ~5 j de délai)
4. **TestFlight users** : qui sont les 2-3 users de confiance pour QA interne ?
5. **Demo account App Review** : créer un compte Supabase dédié `review@wan2fit.fr` avec premium activé ? (recommandé, évite les soucis de review sur features premium)

---

## Go/no-go final avant soumission stores

Checklist Phase 8 complète :
- [ ] Les 8 PRs mergées sur `develop`, puis `develop` → `main` en fin de parcours
- [ ] Tous les acceptance criteria validés sur device réel (pas juste simulateur)
- [ ] TestFlight + Play Internal Test : 3-5 j de vrai usage par 2-3 users
- [ ] Zéro crash remonté par Sentry sur les 48 dernières heures
- [ ] Funnels PostHog mesurables, pas de trou dans les events
- [ ] Privacy policy, demo account, screenshots, description : prêts
- [ ] OTA Capgo fonctionnel (test de rollback validé)
- [ ] Ton accord explicite de soumettre 🚀
