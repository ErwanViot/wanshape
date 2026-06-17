# Tech Debt — Wan2Fit

## Bug critique : données Supabase disparaissent après tab switch

**Priorité** : haute (post-MEP)
**Workaround actuel** : hard refresh (Cmd+R)

### Symptômes
- Switch d'onglet → revenir → les données Supabase disparaissent (spinner infini)
- Aucune requête HTTP ne part vers Supabase (blocage côté client JS)
- Hard refresh corrige systématiquement

### Root cause identifiée
Le `inMemoryLock` dans `src/lib/supabase.ts` crée un deadlock :
1. Au retour d'onglet, GoTrueClient (`autoRefreshToken`) lance un `refreshSession()` qui acquiert le lock
2. Les hooks data appellent `supabase.from(...).select(...)` qui appelle `getSession()` en interne
3. `getSession()` attend le même lock → deadlock (le lock est non-réentrant)
4. Les requêtes HTTP ne partent jamais, les hooks restent en `loading: true`

### Pourquoi le `inMemoryLock` existe
Il remplace Navigator Locks qui deadlockent en dev (HMR Vite : le module est disposé sans libérer le lock).

### Pistes de résolution
1. **Migrer vers TanStack Query** — gère stale-while-revalidate, dedup, cancellation nativement
2. **Lock réentrant** — permettre à `getSession()` de passer si appelé depuis le même contexte que `refreshSession()`
3. **Désactiver `autoRefreshToken`** et gérer le refresh manuellement (testé, cause d'autres problèmes)
4. **Supprimer le lock custom** et accepter le délai HMR en dev (Navigator Locks)

### Fichiers concernés
- `src/lib/supabase.ts` — `inMemoryLock`
- `src/contexts/AuthContext.tsx` — visibility handler
- `src/lib/supabaseQuery.ts` — query wrapper
- `src/components/PublicLayout.tsx` — `dataGeneration` bump
- `src/hooks/useProgram.ts`, `useUserPrograms.ts`, `useHistory.ts` — data hooks

---

## Sentry Session Replay : absence de masquage des inputs

**Priorité** : haute (données sensibles)
**Introduit par** : audit 2026-04-18 SEC-04 ; aggravé par la déclaration des replays dans la Politique de Confidentialité

### Symptôme
`Sentry.replayIntegration()` est initialisé avec les options par défaut dans `src/main.tsx:12`. Par défaut Sentry SDK ne masque que les champs `type="password"` et les éléments portant la classe `.sentry-mask`. Les autres inputs (email, prénom, journal alimentaire, description de repas pour l'estimation IA, blessures déclarées dans l'onboarding programme) sont capturés tels quels lors d'un rejeu d'erreur.

### Risque
Combinaison email + blessures + journal alimentaire = ensemble qualifiable de données de santé (RGPD art. 9). La Politique de Confidentialité documente honnêtement le comportement depuis la version `2026-04b`, mais l'absence de mitigation technique reste fragile.

### Fix proposé
```ts
Sentry.replayIntegration({
  maskAllInputs: true,
  maskAllText: false, // laisser le texte non-input lisible pour le debug
  blockAllMedia: false,
})
```

Alternative plus fine si `maskAllInputs: true` est trop strict pour le debug :
- Garder le comportement par défaut
- Ajouter `className="sentry-mask"` sur tous les inputs qui collectent de la donnée personnelle : formulaire nutrition, étapes onboarding programme, formulaire signup


## Push notifications — rate limiting + OAuth cache (PR #6)

**Priorité** : avant scale (>100 users actifs)
**Statut** : MVP acceptable

### Problème 1 — pas de rate limit sur send-push
`supabase/functions/send-push` est gardé par un `x-internal-secret` header. Si le secret leak (dev shares, log accidentel), un attaquant peut spam tous les users sans limite. À ajouter avant prod publique :
- compteur Redis ou table `push_log` (timestamp, user_id, category)
- quota dur (ex: 10 sends/user/heure)

### Problème 2 — pas de cache du token Google OAuth
`getFcmAccessToken` génère un JWT RS256 + appel `oauth2.googleapis.com/token` à chaque invocation de `send-push`. Le token est valide 1h. Cache module-level avec expiry check ferait ça en O(1) pour les 99% suivants des appels.

### Fix proposé
1. Variable module-level `let cachedAccessToken: { value: string; expiresAt: number } | null` dans send-push/index.ts
2. `if (cached && Date.now() < cached.expiresAt - 60_000) return cached.value`
3. Sinon refetch et stocker


## Recipe slug map — `twinPath` lossy on detail pages

**Priorité** : faible (UX)
**Introduit par** : PR #216 (fix locale toggle persistence)

### Symptôme
Sur `/en/nutrition/recipes/marinated-salmon-poke-bowl`, basculer en FR via le LocaleToggle redirige vers l'index `/nutrition/recettes` au lieu de la version FR de la recette (`/nutrition/recettes/poke-bowl-saumon-marine`). L'utilisateur perd son contexte de lecture. Symétrique côté EN.

### Cause
Les slugs de recette sont localisés indépendamment (FR : `poke-bowl-saumon-marine`, EN : `marinated-salmon-poke-bowl`). `utils/localePath.ts#twinPath` n'a pas accès au mapping `recipe_id → slug` côté client : il se rabat sur l'index, qui est au moins une destination stable.

### Fix proposé
1. Construire au build un objet `RECIPE_SLUG_MAP: Record<recipe_id, { fr: string; en: string }>` à partir des seeds JSON (`scripts/data/recipes_*_seed.json`) et l'inclure dans le bundle.
2. Dans `twinPath`, parser le slug courant, retrouver le `recipe_id`, projeter vers le slug de l'autre locale.
3. Garder le fallback à l'index si l'id n'est pas trouvé (recette ajoutée à un seul locale, etc.).

### Coût/bénéfice
Map de ~50 entrées soit ~3 KB gzipped. Effort : ~1 h. Bénéfice : pas de saut de contexte sur les détails recettes — important si on push les recettes en SEO.


## Migration storage Capacitor : Preferences → Secure Storage (CRITIQUE iOS/Android)

**Priorité** : critique (avant soumission stores)
**Introduit par** : audit sécurité 2026-05-06

### Symptôme
`@capacitor/preferences` stocke dans `NSUserDefaults` côté iOS et `SharedPreferences` côté Android, **sans chiffrement**. Les tokens Supabase (access_token, refresh_token) écrits via `src/lib/supabase-storage.ts` sont donc lisibles :
- iOS : via un backup iTunes non chiffré, ou via une extension d'app, ou via un MDM compromis.
- Android : via un backup ADB sur device USB-debug enabled, ou via Google Cloud Backup auto-enabled.

Mitigation Android temporaire en place : `allowBackup="false"` + `data_extraction_rules.xml` dans manifest. Couvre les backups, pas le storage en clair sur device rooté.

### Fix proposé
Migrer vers `@capacitor-community/secure-storage` (Keychain Services iOS / EncryptedSharedPreferences Android) ou écrire un plugin custom `SecureStoragePlugin` qui wrappe les mêmes APIs côté natif.

Côté code :
1. Remplacer `import { Preferences } from '@capacitor/preferences'` par le plugin secure dans `src/lib/supabase-storage.ts`.
2. Migration des tokens existants : au cold-start, lire l'éventuel token dans Preferences, ré-écrire dans le secure storage, supprimer l'ancien.
3. Tester un cycle complet sign-in / app kill / cold-start / session restored sur iPhone réel + Android réel avec un nouvel storage.

### Coût/bénéfice
Effort : 4-6 h (plugin + migration code + tests + smoke real device). Bénéfice : fermeture du finding sécurité bloquant pour soumission App Store. À traiter en PR dédiée.


## a11y backlog — items audit 2026-05-06 non corrigés dans la PR audit

**Priorité** : haute (avant soumission)
**Introduit par** : audit frontend HIG/a11y 2026-05-06

Items non corrigés dans la PR `fix/post-audit-comprehensive` faute de temps, à traiter en PR dédiée a11y :

- **`MealEntryForm.tsx`** : input fields sans `<label>` explicite, message d'erreur sans `aria-describedby` reliant input ↔ erreur. Wrapper inputs avec label visible ou `aria-label` + lier `aria-describedby` au message d'erreur.
- **`CguRevalidationModal.tsx`** : message d'erreur de save (`<p text-red-400>`) sans `role="alert"` ou `aria-live="assertive"`. Ajouter `role="alert"` pour annonce VoiceOver/TalkBack.
- **`PricingPage.tsx`** : conteneur racine sans `pb-[calc(4rem+env(safe-area-inset-bottom))]`. Risque de masquer le bouton d'achat sous le BottomNav + home indicator iPhone.
- **`RecipeFilters.tsx`** :
  - Chips de catégorie + tag-chips à `~24-30 px` de hauteur, sous le seuil 44pt iOS / 48dp Android. Élargir hit-zone (wrapper `min-h-[44px]` + visuel inchangé).
  - `<details>/<summary>` pour les tags : état ouvert/fermé pas annoncé fiablement par TalkBack mobile. Préférer `<button aria-expanded>` + région cachée conditionnelle.
  - Bouton Reset : icône X seule + `text-xs text-muted` → contraste borderline AA en light mode (~4.1:1). Élargir la hit-zone et utiliser un token sémantique mieux contrasté.
- **`OnboardingCarousel.tsx`** : ajouter `aria-roledescription="slide"` + `aria-setsize` + `aria-posinset` sur chaque `<section>` slide (déjà présent au niveau du conteneur).
- **`BrandHeader` BottomNav `text-[10px]`** : labels potentiellement tronqués sur iPhone SE (375 px de large × 5 onglets). Tester sur device et passer à `text-xs` ou réduire le nombre d'onglets si nécessaire.

### Coût/bénéfice
Effort : 2-3 h cumulés. Bénéfice : conformité WCAG 2.1 AA + Apple guideline 4.0 (accessibility) avant soumission.


## Tests gaps — couverture mobile

**Priorité** : moyenne
**Introduit par** : audit quality 2026-05-06

Hooks/utilitaires mobiles sans test unitaire propre :
- `registerDeepLinkListener` (`src/lib/deepLinks.ts`) : seul le parser est testé, le lifecycle (cancelled flag, StrictMode double-mount, removeListener) est testé indirectement via `App.tsx`. Ajouter un test propre avec mock `@capacitor/app`.
- `openWebUpgrade` (`src/lib/native-upgrade.ts`) : flux paywall mobile (invocation edge fn + `Browser.open`) non couvert. Mocker `supabase.functions.invoke` + `@capacitor/browser`.
- `initAnalyticsAsync` / `initSentryAsync` : pas de test sur la queue/flush des events émis avant init.
- `supabase/functions/send-push/index.ts` : aucune couverture Deno (FCM JWT signing RS256, FCM HTTP v1 envoi, gestion d'erreurs invalid_token avec cleanup `user_devices`).

### Coût/bénéfice
Effort : 3-4 h cumulés. Bénéfice : régression-protection sur les chemins critiques mobile.


## Sécurité backlog — finding audit 2026-05-06 non bloquants

**Priorité** : moyenne
**Introduit par** : audit sécurité 2026-05-06

- **`register-push-device` token re-assignment** : `onConflict: 'token'` permet à un user B de réassigner un token FCM existant vers son propre `user_id`. Comportement par-design FCM (un token = un device, ownership courant), mais théoriquement exploitable si un attaquant obtient un token tier. Mitigation propre = device attestation (Play Integrity API + DeviceCheck), gros chantier.
- **Custom scheme `wan2fit://` hijacking Android** : sans `android:autoVerify` (custom schemes ne le supportent pas), une app malveillante peut déclarer le même intent-filter et intercepter les liens. Mitigation : ne **JAMAIS** transporter de credentials via le custom scheme, utiliser uniquement les App Links HTTPS pour les routes sensibles (reset password déjà via `https://wan2fit.fr/auth/callback`).
- **Android `minifyEnabled false` en release** : bytecode DEX non obfusqué. Activer R8 + règles ProGuard pour Capacitor (modifs `android/app/build.gradle` + `proguard-rules.pro`).
- **`send-push` rate-limiting** : pas de quota par user/heure. Si `INTERNAL_PUSH_SECRET` fuit, attaque spam-notifications possible. Cf. note existante "rate limiting + OAuth cache" plus haut dans ce fichier.
- **iOS Info.plist usage descriptions à anticiper** : `NSFaceIDUsageDescription`, `NSPhotoLibraryUsageDescription` non présents — à ajouter si features futures touchent biométrie ou photos.
- **WKAppBoundDomains à valider** : `limitsNavigationsToAppBoundDomains: true` dans `capacitor.config.ts`. S'assurer que les navigations programmatiques vers `wan2fit.fr`, `*.supabase.co`, `*.stripe.com` sont déclarées dans `WKAppBoundDomains` dans `Info.plist`.
- **`deep-link-parse.ts` host validation** : valider que l'host d'un Universal Link est bien `wan2fit.fr` ou `www.wan2fit.fr` avant de router. Risk faible (routage interne, pas d'open externe).

### Coût/bénéfice
Effort cumulé : 2-3 h. Bénéfice : profondeur défensive avant soumission stores.


## UX backlog — convention modales unifiée

**Priorité** : faible (cohérence)
**Introduit par** : audit frontend 2026-05-06

WelcomeModal, HealthDisclaimer, CguRevalidationModal sont centrées (`items-center`). MealEntryForm est désormais centrée aussi (PR #219). Aucune modale mobile-first en bottom-sheet n'existe vraiment. À trancher : soit on adopte le bottom-sheet Apple HIG/Material (modales mobile depuis le bas) pour TOUTES, soit on garde le centré partout. Décision design + audit complet (rappels, formulaires, scanner barcode) à faire.

### Coût/bénéfice
Effort : 1 h après décision design. Bénéfice : cohérence de marque.


