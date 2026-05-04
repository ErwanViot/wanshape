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
