# Mobile dev — Setup Capacitor

Workflow pour développer Wan2Fit sur iOS et Android via Capacitor.

## Prérequis machine

### iOS (Mac uniquement)
- **Xcode** 15+ depuis le Mac App Store
- **CocoaPods** : `sudo gem install cocoapods` (gestionnaire deps natives iOS)
- iOS Simulator inclus avec Xcode
- Compte Apple Developer Program (pour build sur device physique et soumission)

### Android (cross-platform)
- **Android Studio** dernière stable : https://developer.android.com/studio
- **JDK 17** : `brew install openjdk@17` si pas déjà présent
- Android Emulator + image système (suggestion : Pixel 7 API 34)
- Acceptation des SDK licenses : `yes | sdkmanager --licenses`

## Première installation des projets natifs

À faire **une seule fois** après checkout de la branche, quand Xcode/Android Studio sont prêts :

```bash
# Build le bundle web sans SW pour la première fois
npm run build:native

# Génère les dossiers ios/ et android/ (commitables)
npx cap add ios
npx cap add android

# Sync les assets web vers les projets natifs
npx cap sync
```

Les dossiers `ios/` et `android/` sont commitables : ils contiennent la config native (Info.plist, AndroidManifest.xml, etc.) qu'on éditera au fil des PRs.

### À faire après le premier `cap add` (PR #2 deep links)

**iOS — `ios/App/App/Info.plist`** : ajouter le custom URL scheme et le domaine associé.

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLName</key>
    <string>fr.wansoft.wan2fit</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>wan2fit</string>
    </array>
  </dict>
</array>
```

Puis dans Xcode : **Signing & Capabilities** → **+ Capability** → **Associated Domains** → ajouter `applinks:wan2fit.fr` (et `applinks:www.wan2fit.fr` si besoin).

**Android — `android/app/src/main/AndroidManifest.xml`** : ajouter dans `<activity android:name="com.getcapacitor.bridge.MainActivity">` :

```xml
<intent-filter android:autoVerify="true">
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="https" android:host="wan2fit.fr" />
</intent-filter>
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="wan2fit" />
</intent-filter>
```

**iOS — désactiver le rubber-band bounce du WKWebView** : Capacitor 8 n'expose pas d'option typée pour ça. Éditer `ios/App/App/AppDelegate.swift` (ou créer un `ViewController` custom) pour ajouter, après le chargement initial du WebView :

```swift
// In AppDelegate.swift, after WebView creation, or via a custom ViewController:
webView.scrollView.bounces = false
webView.scrollView.alwaysBounceVertical = false
```

Le but : empêcher le surface sombre du fond de l'app d'apparaître quand l'utilisateur tire trop bas/haut. Pas de modif côté Android (WebView Android n'a pas de bounce par défaut).

**AASA + assetlinks.json** : déjà commités sous `public/.well-known/`. Servis par Vercel sur `https://wan2fit.fr/.well-known/{apple-app-site-association,assetlinks.json}` via `vercel.json` (Content-Type `application/json` forcé). Deux placeholders à remplacer **avant la première soumission** :
- `TODO_APPLE_TEAM_ID` dans `apple-app-site-association` → Team ID Apple Developer (ex. `ABCDEFGHIJ`), visible sur https://developer.apple.com/account/#/membership
- `TODO_ANDROID_RELEASE_SHA256` dans `assetlinks.json` → fingerprint du keystore Android release : `keytool -list -v -keystore release.keystore -alias upload | grep SHA256`

## Cycle de dev quotidien

```bash
# 1. Build le bundle web pour natif (sans PWA SW, sans prerender)
npm run build:native

# 2. Sync vers iOS/Android
npx cap sync

# 3. Ouvrir dans l'IDE natif
npx cap open ios       # ouvre Xcode
npx cap open android   # ouvre Android Studio

# 4. Run depuis l'IDE (bouton ▶) → simulateur ou device
```

Pour itérer plus vite, on peut lancer Vite dev server et pointer Capacitor dessus via `capacitor.config.ts > server.url`. À documenter quand on en aura besoin (probablement PR #2).

## Commandes utiles

```bash
npx cap doctor          # diagnostique l'état des projets natifs
npx cap ls              # liste les plugins installés
npx cap update ios      # met à jour les pods CocoaPods
npx cap update android  # met à jour les deps Gradle
```

## Edge functions à déployer

Les edge functions Supabase ne sont pas auto-déployées par CI. À chaque PR qui en touche une, déployer manuellement sur **dev** d'abord :

```bash
supabase functions deploy <name> --project-ref rgwwpkyuavhqdautpciu --no-verify-jwt
```

Fonctions à déployer dans le cadre de la migration mobile :
- `create-web-upgrade-link` (PR #4) — génère un magic link Supabase pointant sur `/upgrade?priceId=…`. Env requis (Supabase dashboard → Edge Functions secrets) : `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_YEARLY` (déjà présents puisque `create-checkout-session` les utilise déjà).
- `delete-account` (PR #5) — annule la subscription Stripe active puis appelle `auth.admin.deleteUser`. Env requis : `STRIPE_SECRET_KEY` (déjà présent). Apple guideline 5.1.1(v) : la suppression in-app est **obligatoire** pour les apps qui permettent la création de compte — sans cette feature, soumission App Store auto-rejetée.
- `register-push-device` (PR #6) — upsert (user, token, platform) dans `user_devices`. Aucun secret nouveau. Appelé par `usePushNotifications` à chaque launch après acceptation de la permission.
- `send-push` (PR #6) — envoie une notification FCM HTTP v1 à toutes les devices d'un user. Server-to-server uniquement (header `x-internal-secret` requis). Env nouveaux à provisionner :
  - `INTERNAL_PUSH_SECRET` — chaîne aléatoire 32+ char (ex : `openssl rand -hex 32`)
  - `FCM_SERVICE_ACCOUNT_JSON` — JSON brut du Firebase Admin SDK service account (Console Firebase → Project settings → Service accounts → Generate new private key). Doit contenir `client_email`, `private_key`, `project_id`.

## Push notifications philosophy

Wan2Fit interdit les notifications coercitives. Catégories acceptées :
- `info` — Information transactionnelle (default ON, attendu par les users)
- `progression` — Célébration d'un palier atteint (default OFF, opt-in)
- `new_content` — Nouvelle recette / nouveau programme (default OFF, opt-in)

**Catégories proscrites** (à ne JAMAIS introduire) : daily reminder, streak, missed-day prompt, "tu n'as pas fait de séance depuis X jours". Ces patterns poussent au surentraînement et créent du shame, ce qui contredit la philosophie produit (cf. `MEMORY.md`).

Côté natif (post `cap add ios` + `cap add android`) :
- iOS : capability **Push Notifications** + APNs key (.p8) liée au Bundle ID dans le Firebase project (Cloud Messaging → Apple app configuration). Capability dans Xcode : Signing & Capabilities → +Capability → Push Notifications + Background Modes → Remote notifications.
- Android : pas de modif manifest (le plugin Capacitor s'en charge), mais le `google-services.json` doit être placé dans `android/app/`.

Validation post-deploy :

```bash
curl -X POST 'https://<project-ref>.supabase.co/functions/v1/create-web-upgrade-link' \
  -H 'Authorization: Bearer <user JWT>' \
  -H 'Content-Type: application/json' \
  -d '{"priceId":"price_xxx"}'
```

## Apple guideline 3.1.3(b) — Multiplatform Service

Wan2Fit **ne peut pas** afficher de prix ni de bouton d'achat dans l'app native (iOS Apple ou Android Google Play). Le flow respecté est :

1. Dans l'app, l'utilisateur tape sur un CTA "Voir les options premium" (sans prix).
2. L'app appelle `useSubscription.checkout(priceId)` qui détecte natif et invoque `create-web-upgrade-link`.
3. Le magic link est ouvert via `@capacitor/browser` (SafariViewController iOS / Chrome Custom Tab Android).
4. La page `/upgrade?priceId=…` auto-déclenche `create-checkout-session` puis Stripe redirige sur sa page de paiement.
5. Après succès, le user revient sur `https://wan2fit.fr/parametres?session=…` (le success_url Stripe sera transformé en Universal Link plus tard pour rebasculer dans l'app).

**Règle interne stricte** : aucune chaîne `€/mois`, `9.99`, ou `Acheter` dans les composants montés en natif. Les pages `/tarifs` et `/premium` doivent rester accessibles uniquement via lien externe en natif (jamais via la nav primaire iOS/Android).

## Différences build web vs build natif

| | `npm run build` (web) | `npm run build:native` |
|---|---|---|
| Service Worker (PWA) | ✅ généré (Workbox) | ❌ skip |
| Prerender SEO | ✅ généré | ❌ skip |
| Output | `dist/` | `dist/` (utilisé par `cap sync`) |
| Sentry source maps | ✅ uploadées en prod | ✅ idem |

## Points d'attention

- **localStorage en WebView** : volatile sur iOS (purge système possible). Le storage Supabase auth utilise `@capacitor/preferences` à partir de la PR #2 — ne pas re-introduire de localStorage pour des données critiques.
- **Wake Lock pendant les séances** : le hook `useWakeLock` actuel utilise l'API Web (cassée en iOS WebView). Remplacé par un plugin natif en PR #3.
- **Vercel Analytics** : guard `isNative()` dans `main.tsx` empêche le tracking depuis le natif. Ne pas annuler ce guard.
- **Deep links** : scheme `wan2fit://` configuré en PR #2 ; toute fonction qui utilise `window.location.origin` doit être conditionnée pour le natif.
