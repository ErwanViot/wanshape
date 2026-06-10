# IAP iOS — Setup RevenueCat

À faire **après** avoir terminé `02-app-store-connect-setup.md` (RevenueCat a besoin de la `.p8` Apple).

Durée totale : ~20-30 min.

---

## Étape 1 — Créer le compte RevenueCat

1. Aller sur <https://app.revenuecat.com/signup>
2. Sign up avec `erwan.viot@gmail.com`
3. Confirmer email
4. Au premier login, RevenueCat propose de créer un Project. **Project Name** : `Wan2Fit`

---

## Étape 2 — Connecter l'app iOS à App Store Connect

1. Dans le projet Wan2Fit, sidebar gauche → **Projects** → **+ New App**
2. **App Type** : `Apple App Store`
3. **App Name** : `Wan2Fit iOS`
4. **Bundle ID** : `fr.wansoft.wan2fit`
5. **App Store Connect API Configuration** :
   - **Issuer ID** : (depuis `02-app-store-connect-setup.md` étape 6)
   - **Key ID** : `ABC123XYZ` (depuis `02-app-store-connect-setup.md` étape 6)
   - **Upload `.p8` file** : drag-and-drop le fichier `AuthKey_XXX.p8`
6. **App-Specific Shared Secret** (pour validation receipt) : coller la valeur générée en `02-app-store-connect-setup.md` étape 7
7. **Save**

RevenueCat va automatiquement pull les Subscriptions qu'on a créées en App Store Connect (`wan2fit.premium.monthly` + `wan2fit.premium.yearly`). Vérifier qu'elles apparaissent dans **Products** sous l'app iOS.

---

## Étape 3 — Connecter l'app Android (à faire en parallèle ou plus tard)

Pour Android, RevenueCat a besoin d'un **Google Cloud Service Account** avec accès à l'API Google Play Developer.

Étapes (à détailler quand on attaquera Android IAP) :
1. Google Cloud Console → créer service account
2. Google Play Console → Setup > API access → lier le service account
3. RevenueCat → New App → Google Play → coller le JSON du service account

**Skippé pour cette PR** — on shippe iOS only en premier. Android suivra dès que (a) Google flaggera 3.1.1 équivalent OU (b) on aura le bandwidth.

---

## Étape 4 — Définir les Entitlements

Un "entitlement" est un label abstrait pour ce qu'un user obtient en s'abonnant. Permet de découpler "quel produit a-t-il acheté" de "quoi a-t-il droit dans l'app".

1. RevenueCat → projet Wan2Fit → **Product Catalog** → **Entitlements**
2. **+ New Entitlement**
3. **Identifier** : `premium`
4. **Description** : `Access to all premium features (AI programs, AI sessions, full nutrition tracking)`
5. **Save**

### Lier les products à l'entitlement

6. Cliquer sur l'entitlement `premium` → **Attach Products**
7. Cocher `wan2fit.premium.monthly` (iOS) et `wan2fit.premium.yearly` (iOS)
8. **Save**

Maintenant côté code, on checkera `customerInfo.entitlements.active["premium"] !== undefined` au lieu de `customerInfo.activeSubscriptions.length > 0`. C'est plus robuste si on change de structure de products plus tard.

---

## Étape 5 — Créer une Offering

Une "offering" est ce que l'user voit dans le paywall : un set de packages présentés ensemble.

1. **Product Catalog** → **Offerings**
2. **+ New Offering**
3. **Identifier** : `default` (RevenueCat utilise cet ID par défaut côté code, simplifie le boilerplate)
4. **Description** : `Default paywall — monthly + yearly`
5. **Save**

### Ajouter les packages à l'offering

6. Ouvrir l'offering `default` → **Add Package**
7. **Package 1** :
   - **Identifier** : `$rc_monthly` (RevenueCat alias standard)
   - **Description** : `Monthly subscription`
   - **Products** : Apple App Store → `wan2fit.premium.monthly`
8. **Package 2** :
   - **Identifier** : `$rc_annual`
   - **Description** : `Annual subscription (best value)`
   - **Products** : Apple App Store → `wan2fit.premium.yearly`
9. **Save**
10. **Marquer cette offering comme "Current"** (toggle en haut). Indique que c'est l'offering active par défaut.

---

## Étape 6 — Récupérer la Public API Key iOS

Cette clé sera embarquée dans le bundle iOS (côté client). C'est **public** par design — RevenueCat utilise la signature de receipt Apple pour authentifier les achats, pas la clé.

1. RevenueCat → projet Wan2Fit → **Project Settings** (icône engrenage en bas à gauche) → **API Keys**
2. Sous **iOS App Wan2Fit** → copier la clé publique (commence par `appl_`)
3. La stocker dans `.env.production` (et `.env.local` pour DEV qui peut partager la même clé) :
   ```
   VITE_REVENUECAT_PUBLIC_API_KEY_IOS=appl_xxxxxxxxxxxxxxxxxxxxxx
   ```
4. Aussi pousser dans Vercel :
   ```bash
   vercel env add VITE_REVENUECAT_PUBLIC_API_KEY_IOS production
   ```

---

## Étape 7 — Configurer le Webhook vers Supabase

C'est le pont entre les events RevenueCat et notre backend.

1. Project Settings → **Integrations** → **Webhooks**
2. **+ New Webhook**
3. **Webhook URL** : `https://pipbhkaaqsltnvprmzrl.supabase.co/functions/v1/revenuecat-webhook`
4. **Authorization Header** : `Bearer <REVENUECAT_WEBHOOK_SECRET>` (générer une chaîne aléatoire de 32+ chars)
5. **Events to receive** : tous (RevenueCat envoie de toute façon le minimum). Cocher au moins :
   - `INITIAL_PURCHASE`
   - `RENEWAL`
   - `CANCELLATION`
   - `EXPIRATION`
   - `BILLING_ISSUE`
   - `PRODUCT_CHANGE`
   - `UNCANCELLATION`
6. **Save**

### Côté Supabase, stocker le secret

```bash
npx supabase secrets set REVENUECAT_WEBHOOK_SECRET=<la chaîne aléatoire> --project-ref pipbhkaaqsltnvprmzrl
npx supabase secrets set REVENUECAT_WEBHOOK_SECRET=<la chaîne aléatoire> --project-ref rgwwpkyuavhqdautpciu
```

L'edge function `revenuecat-webhook` vérifiera ce header au début pour rejeter les requests non-authentifiés.

---

## Étape 8 — Tester le webhook avec un sandbox purchase

À faire seulement quand l'edge function `revenuecat-webhook` sera déployée et l'app TestFlight prête.

1. Sur iPhone : login Sandbox account
2. Ouvrir TestFlight Wan2Fit, taper "Passer Premium"
3. Acheter monthly (5 min de durée en sandbox)
4. Vérifier dans RevenueCat → **Customer Center** que le customer apparaît avec entitlement actif
5. Vérifier dans Supabase Studio que `profiles.subscription_tier = 'premium'` pour ce user
6. Vérifier dans **RevenueCat → Webhooks → History** que le webhook a bien été envoyé et qu'il y a un `200 OK` de notre edge function

Si erreur : RevenueCat fait du retry automatique (jusqu'à 24h). On peut aussi forcer un retry manuel depuis le dashboard.

---

## Récap : ce qu'on doit avoir à la fin

- [ ] Compte RevenueCat créé
- [ ] App iOS connectée à App Store Connect via API Key
- [ ] Entitlement `premium` créé et lié aux 2 products iOS
- [ ] Offering `default` avec packages `$rc_monthly` + `$rc_annual` marquée Current
- [ ] Public API Key iOS dans `.env.production` + Vercel + `.env.local`
- [ ] Webhook configuré vers Supabase, secret partagé (Bearer)
- [ ] `REVENUECAT_WEBHOOK_SECRET` dans Supabase secrets DEV + PROD

Une fois validé, on passe à `04-app-integration.md` pour le code.

---

## Trous identifiés

- Stratégie de migration des sandbox testers vers prod testers : doc séparée
- Customer attribution (UTM, etc.) : optionnel, RevenueCat supporte mais on n'en aura pas besoin tout de suite
- Promotional codes : à voir post-launch
