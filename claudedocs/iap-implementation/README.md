# IAP iOS — Implémentation Apple StoreKit (via RevenueCat)

Chantier ouvert le 2026-06-07 après le rejet Apple App Review 3.1.1.

## Pourquoi ce chantier

- Apple Guideline 3.1.1 : impossible que l'app iOS donne accès à du contenu premium acheté hors-app sans **aussi** offrir la souscription via In-App Purchase.
- Conséquence : on doit implémenter Apple StoreKit (et tant qu'à faire, Google Play Billing par symétrie, anticipant le même flag côté Google).
- Le pattern PR #227 (`<NativeUpgradeWall />` qui redirige vers `wan2fit.fr/tarifs` dans Safari) **n'est pas suffisant**.

## Stratégie technique

- **RevenueCat** comme couche d'abstraction StoreKit + Google Play Billing → un seul plugin Capacitor, un seul webhook backend.
- **Stripe reste sur le web** (commission ~2% vs ~15% Apple/Google) — meilleure marge, garder la maîtrise de l'acquisition.
- **`profiles.subscription_tier`** dans Supabase reste la seule source de vérité, mis à jour par 2 webhooks (`stripe-webhook` + nouveau `revenuecat-webhook`).
- **Small Business Program** Apple → 15% au lieu de 30% dès la première vente, gratuit.

## Documents

Lire dans l'ordre :

1. [**00-decision-log.md**](./00-decision-log.md) — pourquoi RevenueCat, pourquoi Small Business, pourquoi répondre à Apple maintenant, etc.
2. [**01-architecture.md**](./01-architecture.md) — schéma data flow + composants nouveaux / modifiés.
3. [**02-app-store-connect-setup.md**](./02-app-store-connect-setup.md) — créer les subscriptions IAP côté Apple, API key, sandbox testers.
4. [**03-revenuecat-setup.md**](./03-revenuecat-setup.md) — créer le compte RevenueCat, lier ASC, entitlements, offerings, webhook.
5. **04-app-integration.md** *(à écrire au moment du dev)* — code Capacitor : hook `usePurchases`, composant `<NativePricingCards />`, bouton restore.
6. **05-supabase-webhook.md** *(à écrire)* — edge function `revenuecat-webhook` complète + migration 012.
7. **06-testing-sandbox.md** *(à écrire)* — scénarios de test sandbox (achat, renewal, cancel, restore, edge cases).
8. **07-launch-checklist.md** *(à écrire)* — checklist pré-submit Apple (screenshots IAP, App Review notes, etc.).
9. **08-apple-resolution-center-response.md** *(à écrire)* — texte exact envoyé à Apple.

## Statut

- [x] Decision log
- [x] Architecture
- [x] Setup ASC documenté
- [x] Setup RevenueCat documenté
- [ ] Enrollment Small Business Program (action humaine — toi)
- [ ] Création des Subscriptions IAP dans ASC (action humaine — toi)
- [ ] Création du compte RevenueCat (action humaine — toi)
- [ ] Réponse Apple Resolution Center (action humaine — toi)
- [ ] Code app + edge function (Claude)
- [ ] Tests sandbox (toi)
- [ ] Resubmit Apple (toi)

## Timeline estimé

| Étape | Durée |
|---|---|
| Setup ASC + RevenueCat + Small Business (humain) | 1-2h |
| Réponse Apple Resolution Center | 5 min |
| Code app + edge function + migration | 1 jour |
| Tests sandbox + corrections | 4-8h |
| Resubmit Apple + cycle review | 1-3j |
| **Total réaliste** | **3-5 jours calendaires** |

## Risques

- **App Store Connect bloque la création d'IAP si le Paid Apps agreement n'est pas signé**. Vérifier en premier dans Agreements, Tax, and Banking.
- **RevenueCat plugin Capacitor sur Capacitor 8** : à vérifier la compat. Documentation officielle <https://www.revenuecat.com/docs/getting-started/installation/capacitor>. Si pas de version compatible Capacitor 8, on a un plan B (`cordova-plugin-purchase`).
- **Apple peut re-rejeter** si le screenshot fourni dans App Review Information ne montre pas clairement l'écran IAP. Préparer un bon screenshot.
- **Coexistence Stripe + IAP** : edge case si user paie 2x. Mitigation côté UX (check `isPremium` avant d'afficher l'écran IAP), mais pas 0% de risque.
