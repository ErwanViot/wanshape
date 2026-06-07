# IAP iOS — Architecture cible

## Vue d'ensemble

Trois canaux de paiement coexistent, un seul état centralisé :

```
                          ┌───────────────────────────┐
                          │  profiles.subscription_   │
                          │  tier (free|premium)      │
                          │  +                        │
                          │  profiles.subscription_   │
                          │  provider (stripe|        │
                          │  revenuecat) [NEW]        │
                          └─────────────▲─────────────┘
                                        │ RLS: only service_role can update
                                        │ (via webhooks)
                ┌───────────────────────┼───────────────────────┐
                │                       │                       │
        ┌───────┴────────┐    ┌─────────┴─────────┐    ┌───────┴────────┐
        │ stripe-        │    │ revenuecat-       │    │ revenuecat-    │
        │ webhook        │    │ webhook [NEW]     │    │ webhook [NEW]  │
        │ (Stripe events)│    │ (Apple IAP events)│    │ (Google IAP    │
        │                │    │                   │    │  events)       │
        └───────▲────────┘    └─────────▲─────────┘    └───────▲────────┘
                │                       │                       │
                │ HTTP POST             │ HTTP POST             │ HTTP POST
                │                       │                       │
        ┌───────┴────────┐    ┌─────────┴─────────────────────────────┐
        │ Stripe         │    │ RevenueCat (proxy + receipt validator)│
        │ (Checkout +    │    │                                       │
        │  Customer      │    └─────────▲─────────────────▲───────────┘
        │  Portal)       │              │                 │
        └───────▲────────┘              │ Apple           │ Google
                │                       │ App Store       │ Play
                │                       │ Server-to-      │ Real-time
                │                       │ Server          │ Developer
                │                       │ notifications   │ Notifications
                │                       │                 │
        ┌───────┴────────┐    ┌─────────┴─────┐ ┌─────────┴─────────┐
        │ wan2fit.fr     │    │ iOS app       │ │ Android app       │
        │ (web)          │    │ (StoreKit)    │ │ (Google Play      │
        │                │    │               │ │  Billing)         │
        └────────────────┘    └───────────────┘ └───────────────────┘
```

## Composants existants (conservés tels quels)

### `useSubscription.ts`

Le hook actuel expose :

```ts
{
  isPremium: boolean,
  subscription: {...},
  checkout: (priceId: string) => Promise<string | null>,
  manageSubscription: () => Promise<string | null>,
}
```

`checkout()` actuellement dispatch entre :
- Web : `create-checkout-session` edge function → URL Stripe Checkout
- Native : `openWebUpgrade(priceId)` → ouvre Safari sur `wan2fit.fr/upgrade?priceId=…`

**Changement requis** : sur native, `checkout()` doit appeler RevenueCat à la place. Le hook devient :

```ts
async function checkout(priceId: string) {
  if (isNative()) {
    return purchaseViaRevenueCat(productIdFromPriceId(priceId));
  }
  return purchaseViaStripe(priceId);
}
```

### `PricingCards.tsx`

- Web : continue d'afficher les 2 plans + bouton checkout Stripe (inchangé)
- Native : actuellement affiche `<NativeUpgradeWall />`. Désormais affichera `<NativePricingCards />` (nouveau composant) qui :
  - Liste les packages RevenueCat (récupérés via `Purchases.getOfferings()`)
  - Affiche les prix locaux (RevenueCat fournit `localizedPrice`)
  - Bouton "S'abonner" → `Purchases.purchasePackage(pkg)`

### Edge function `stripe-webhook`

Continue de gérer les events Stripe pour les abonnements web. Aucun changement.

### Migration 011 RLS

`011_restrict_profiles_update.sql` empêche actuellement les users de modifier `subscription_tier` directement — seul le service_role (utilisé par `stripe-webhook`) peut. **Le futur `revenuecat-webhook` utilisera aussi le service_role**, donc compatible sans nouvelle migration RLS.

## Composants nouveaux

### Plugin Capacitor `@revenuecat/purchases-capacitor`

- Installé via `npm install @revenuecat/purchases-capacitor`
- Initialisé au cold-start dans `App.tsx` :
  ```ts
  await Purchases.configure({
    apiKey: import.meta.env.VITE_REVENUECAT_PUBLIC_API_KEY_IOS, // côté iOS
    // ou _ANDROID côté Android
    appUserID: user?.id, // bind à notre user ID Supabase
  });
  ```
- Une seule clé publique par plateforme, mise dans `.env.production` :
  - `VITE_REVENUECAT_PUBLIC_API_KEY_IOS=appl_xxxxxxx`
  - `VITE_REVENUECAT_PUBLIC_API_KEY_ANDROID=goog_xxxxxxx`

### Hook `usePurchases.ts`

Wrapper TypeScript autour du plugin. Expose :

```ts
{
  packages: Package[] | null,       // monthly + yearly
  loading: boolean,
  error: string | null,
  purchase: (pkg: Package) => Promise<void>,
  restore: () => Promise<void>,
}
```

Encapsule la logique RevenueCat pour qu'aucun composant React ne touche directement le plugin.

### Composant `<NativePricingCards />`

Remplace `<NativeUpgradeWall />` sur les écrans authentifiés. Visuellement très proche de l'actuel `<PricingCards />` web (mêmes cards, mêmes features lists, mais boutons RevenueCat au lieu de Stripe).

### Composant `<RestorePurchasesButton />`

Dans `auth/SettingsPage.tsx`. Bouton simple qui appelle `Purchases.restorePurchases()`. **Obligatoire pour passer Apple App Review** (3.1.1 requirement).

### Migration 012 — `profiles.subscription_provider`

Nouvelle colonne pour tracer la source de l'abonnement (utile pour le support, l'analytics, et le routage des actions "manage subscription" — un user iOS doit aller dans Réglages iOS pour annuler, un user web va dans Stripe Customer Portal).

```sql
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS subscription_provider TEXT
  CHECK (subscription_provider IN ('stripe', 'revenuecat'));
```

Le webhook qui met à jour `subscription_tier` met aussi à jour `subscription_provider`.

### Edge function `revenuecat-webhook`

Nouvelle. Reçoit les events RevenueCat (`INITIAL_PURCHASE`, `RENEWAL`, `CANCELLATION`, `EXPIRATION`, `BILLING_ISSUE`, etc.) et met à jour `profiles.subscription_tier`.

Structure :

```ts
// supabase/functions/revenuecat-webhook/index.ts
serve(async (req) => {
  // 1. Validate secret header (RevenueCat sends X-Webhook-Secret)
  const secret = req.headers.get("authorization");
  if (secret !== `Bearer ${Deno.env.get("REVENUECAT_WEBHOOK_SECRET")}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  // 2. Parse RevenueCat event
  const { event } = await req.json();
  const userId = event.app_user_id; // = our Supabase user.id

  // 3. Compute the desired subscription_tier from the event type
  const tier = isActiveEventType(event.type) ? "premium" : "free";

  // 4. Upsert profiles row
  await supabaseAdmin
    .from("profiles")
    .update({
      subscription_tier: tier,
      subscription_provider: "revenuecat",
    })
    .eq("id", userId);

  return new Response("OK");
});
```

Secret stocké côté Supabase Edge Functions Secrets via :
```bash
npx supabase secrets set REVENUECAT_WEBHOOK_SECRET=<value> --project-ref pipbhkaaqsltnvprmzrl
```

## Coexistence Stripe + RevenueCat sur le même `subscription_tier`

Scénario : un user s'abonne d'abord via le web (Stripe), puis souhaite s'abonner depuis l'iOS (StoreKit). Que se passe-t-il ?

1. Apple n'a aucune visibilité sur Stripe. Il acceptera la souscription StoreKit sans broncher.
2. L'user sera donc facturé deux fois (Stripe + Apple). Mauvaise UX.

**Mitigation** :
- Quand on initialise RevenueCat dans l'app native, on appelle `Purchases.getCustomerInfo()` au cold-start. Si l'user a déjà un abonnement actif (peu importe d'où), on ne lui propose pas l'écran IAP — on lui montre `<NativeUpgradeWall />` modifié en mode "Tu es déjà premium via [stripe/revenuecat]" + bouton "Gérer" qui ouvre le bon canal.
- Côté `<NativePricingCards />`, avant d'afficher les packages on check `isPremium` côté Supabase. Si premium déjà → on cache l'écran de purchase.

C'est imparfait mais réaliste : il y aura toujours un edge case où un user achète des 2 côtés (carte mémorisée différente, oubli, etc.). Le support manuel restera nécessaire pour ces cas.

## Source de vérité finale

`profiles.subscription_tier` (Supabase) **est la seule source de vérité** pour le frontend. Tous les composants qui veulent savoir si l'user est premium passent par `useAuth()` ou `useSubscription()` qui lisent cette valeur.

Les états locaux de RevenueCat / Stripe sont des **caches** qui doivent toujours converger vers cette source via les webhooks.

## Flow d'achat iOS détaillé

1. L'user est connecté, navigue dans l'app, clique "Passer Premium" (sur `/tarifs`)
2. `<NativePricingCards />` rendu (parce que `isNative()` et `!isPremium`)
3. `usePurchases.packages` retourne `[monthlyPackage, yearlyPackage]` depuis `Purchases.getOfferings()`
4. L'user sélectionne un plan, clique "S'abonner"
5. `Purchases.purchasePackage(pkg)` est appelé
6. **StoreKit prend le contrôle** : Face ID, prompt confirmation, achat
7. RevenueCat valide le receipt auprès d'Apple en arrière-plan
8. RevenueCat envoie un webhook `INITIAL_PURCHASE` à notre edge function
9. Notre edge function met à jour `profiles.subscription_tier = 'premium'`
10. Le React Query qui watch `profiles` détecte la mise à jour (via Supabase Realtime ou polling) → toute l'UI bascule en mode premium

Étape 9 → 10 peut prendre quelques secondes (latence webhook). Pour une UX immédiate, juste après que `Purchases.purchasePackage()` resolve avec succès on peut **optimistiquement** mettre l'UI en mode premium localement, puis attendre que le webhook confirme.

## Restore Purchases — flow

1. L'user installe l'app sur un nouvel iPhone (ou réinstalle après désinstallation)
2. Il se connecte avec son compte Wan2Fit
3. Sur Settings, il tape "Restaurer mes achats"
4. `Purchases.restorePurchases()` appelé
5. RevenueCat interroge Apple pour les receipts associés à l'Apple ID actuel
6. Si un abonnement actif est trouvé, RevenueCat envoie le webhook approprié à notre backend
7. `subscription_tier` mis à jour → UI bascule en mode premium

L'user n'est jamais re-facturé. Le bouton "Restaurer" est requis par Apple pour tous les apps qui vendent du contenu non-consommable ou des abonnements.
