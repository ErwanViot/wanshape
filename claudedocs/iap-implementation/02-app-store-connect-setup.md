# IAP iOS — Setup App Store Connect

Step-by-step pour créer les Subscriptions In-App Purchase côté Apple. À faire **avant** d'intégrer RevenueCat (qui pull les produits depuis App Store Connect).

Durée totale : ~30-45 min, dont ~10 min d'attente Apple.

---

## Pré-requis

- Compte Apple Developer Program payant et actif (`erwan.viot@gmail.com`)
- App `Wan2Fit` créée dans App Store Connect (`Bundle ID fr.wansoft.wan2fit`)
- Compte bancaire + tax info renseignés dans App Store Connect → Agreements, Tax, and Banking → **Paid Apps agreement signé**

Si le Paid Apps agreement n'est pas signé, App Store Connect refuse de créer des subscriptions. Va dans **App Store Connect > Agreements, Tax, and Banking > Paid Apps > Set up** et complète :
- Master agreement
- Tax forms (W-8BEN-E pour entité non-US, ou équivalent EU)
- Banking info (IBAN + BIC)

---

## Étape 1 — Enroll au Small Business Program

**Pourquoi** : 15% de commission au lieu de 30% sur tous les abonnements iOS, dès la première vente.

1. App Store Connect → en haut à droite, ton nom → **Agreements, Tax, and Banking**
2. **Paid Apps** agreement → onglet **Small Business Program**
3. Cliquer **Apply**
4. Tu acceptes la condition : revenus < $1M USD/year. Wan2Fit a 0$ de revenu, donc trivialement éligible.
5. Apple confirme par email sous 24-48h, généralement instantané

**Important** : si tu enroll APRÈS avoir créé les subscriptions, les nouveaux clients post-enrollment auront 15%, mais tout client souscrit avant continue à 30% jusqu'au prochain renouvellement. C'est pour ça qu'on enroll AVANT de soumettre les subscriptions.

---

## Étape 2 — Créer le Subscription Group

Un "subscription group" est un dossier qui contient des subscriptions liées (ex : monthly / yearly du même plan). L'user ne peut être abonné qu'à UN seul tier dans un même groupe à la fois — passer de monthly à yearly = upgrade automatique dans le même groupe.

1. App Store Connect → ton app **Wan2Fit** → **Distribution** (gauche)
2. Sous **In-App Purchases** → **Subscriptions**
3. Sous **Subscription Groups**, cliquer **Create**
4. **Reference Name** : `Wan2Fit Premium` (interne, jamais visible des users)
5. Save

---

## Étape 3 — Créer la subscription Mensuelle

1. Dans le subscription group `Wan2Fit Premium` → **Create Subscription**
2. **Reference Name** : `Premium Monthly` (interne)
3. **Product ID** : `wan2fit.premium.monthly`
   - ⚠️ **Ce Product ID est figé à vie**. Apple refuse de le supprimer une fois créé. Ne pas se planter.
4. **Subscription Duration** : 1 Month
5. **Subscription Group** : `Wan2Fit Premium` (déjà sélectionné)

### Tarification

6. **Subscription Prices** → **Add Subscription Price**
7. **Base Country/Region** : France (EUR)
8. **Price** : 9,99 € EUR
9. Apple génère automatiquement les prix équivalents pour les 175 autres territoires (Price Matrix). Tu peux les overrider individuellement si tu veux, mais 9,99€ = $9.99 = £8.99 sont les conversions standards qu'Apple propose.
10. Valider

### Localizations (FR + EN)

11. **Localizations** → **Add Localization**

**Français (France) :**
- Subscription Display Name : `Wan2Fit Premium Mensuel`
- Description : `Accès illimité aux programmes IA, séances personnalisées, suivi nutrition complet et toutes les recettes premium. Sans engagement, résiliable à tout moment.`

**English (US) :**
- Subscription Display Name : `Wan2Fit Premium Monthly`
- Description : `Unlimited access to AI programs, custom workouts, complete nutrition tracking and all premium recipes. No commitment, cancel anytime.`

### Review Information

12. **App Review Information** → Screenshot de l'écran qui déclenche l'IAP dans l'app (l'écran `<NativePricingCards />` qu'on va construire). **À ajouter APRÈS** avoir le screenshot — pour l'instant on saute, on revient ici quand on aura le build.

### Status

13. Save. Le statut passe à **"Ready to Submit"**. On le **submittra plus tard**, après avoir le screenshot et le build TestFlight qui va avec.

---

## Étape 4 — Créer la subscription Annuelle

Identique à l'étape 3 avec :

- **Reference Name** : `Premium Yearly`
- **Product ID** : `wan2fit.premium.yearly`
- **Subscription Duration** : 1 Year
- **Subscription Group** : `Wan2Fit Premium` (le même que monthly)
- **Base Price** : 99,99 € EUR
- **Display Name FR** : `Wan2Fit Premium Annuel`
- **Description FR** : `Tous les avantages Premium pour 99,99 €/an — soit l'équivalent de 8,33 €/mois (économise 17% vs la formule mensuelle). Sans engagement, résiliable à tout moment.`
- **Display Name EN** : `Wan2Fit Premium Yearly`
- **Description EN** : `All Premium benefits for 99.99 €/year — equivalent of 8.33 €/month (save 17% vs monthly). No commitment, cancel anytime.`

---

## Étape 5 — Configurer le Subscription Group localizations

Le Group lui-même a sa propre localization (visible au user dans Settings > Subscriptions de son iPhone).

1. Dans le group `Wan2Fit Premium` → **App Name** localizations
2. **Français (France)** :
   - Display Name : `Wan2Fit Premium`
3. **English (US)** :
   - Display Name : `Wan2Fit Premium`
4. Save

---

## Étape 6 — App Store Connect API Key (pour RevenueCat)

RevenueCat a besoin d'une API Key Apple pour interroger App Store Connect côté serveur.

1. App Store Connect → ton nom (top right) → **Users and Access**
2. Onglet **Integrations** → **App Store Connect API**
3. Cliquer **Generate API Key**
4. **Name** : `RevenueCat`
5. **Access** : `App Manager` (suffisant pour les subscriptions)
6. Cliquer **Generate**
7. **Télécharger le fichier `.p8`** — ⚠️ il n'est téléchargeable qu'**une seule fois**, pas de récupération possible après. Le mettre dans `~/Downloads/` et le partager avec RevenueCat dans la prochaine étape.
8. Noter le **Key ID** (visible dans la liste, ex: `ABC123XYZ`) et l'**Issuer ID** (en haut de la page Integrations, GUID)

---

## Étape 7 — Shared Secret (pour App Store Server Notifications V2)

Aussi appelé "App-Specific Shared Secret". Utilisé pour authentifier les server-to-server notifications Apple → RevenueCat.

1. App Store Connect → ton app **Wan2Fit** → **Distribution** (gauche)
2. Sous **App Information** → **App-Specific Shared Secret** → **Manage**
3. **Generate** un nouveau secret
4. **Le copier et le stocker dans `Mots de Passe Mac`** sous l'entrée "Wan2Fit ASC Shared Secret"

---

## Étape 8 — Sandbox Tester accounts

Pour tester l'achat sans débit réel.

1. App Store Connect → **Users and Access** → onglet **Sandbox**
2. **Testers** → **+**
3. Créer un compte avec un email **qui n'a JAMAIS été utilisé pour un vrai Apple ID** (sinon Apple refuse). Format pratique : `wan2fit-sandbox-1@yopmail.com`
4. Password : à noter dans Mots de Passe Mac
5. Pour tester sur iPhone : Settings > App Store > Sandbox Account → se connecter avec ce compte
6. **Une fois connecté Sandbox sur l'iPhone**, tous les achats StoreKit se font en sandbox (gratuit, durée des abonnements accélérée — 1 mois IRL = 5 min sandbox)

Créer 2-3 comptes Sandbox pour tester différents scénarios (achat, renewal, cancel, restore).

---

## Étape 9 — App Store Server Notifications V2 URL

C'est l'endpoint où Apple POSTera les events server-to-server. **Pour RevenueCat, c'est leur URL** — on configurera ça après avoir créé le compte RevenueCat (voir `03-revenuecat-setup.md`).

---

## Récap : ce qu'on doit avoir à la fin de cette étape

- [ ] Small Business Program enrollé
- [ ] Subscription Group `Wan2Fit Premium` créé
- [ ] Product `wan2fit.premium.monthly` créé, statut "Ready to Submit"
- [ ] Product `wan2fit.premium.yearly` créé, statut "Ready to Submit"
- [ ] Group localizations FR + EN
- [ ] API Key Apple (.p8) téléchargée, Key ID + Issuer ID notés
- [ ] App-Specific Shared Secret généré et stocké dans Mots de Passe Mac
- [ ] Au moins 1 Sandbox Tester créé pour les tests

Une fois cette checklist verte, on passe à `03-revenuecat-setup.md`.

---

## Trous identifiés (à documenter une fois faits)

- Capture d'écran de l'écran IAP qui sera dans l'app (`<NativePricingCards />`) — à fournir à App Review Information de chaque subscription. À faire après avoir buildé l'app.
- Configurer Family Sharing pour les subscriptions (Apple le propose dans la création — recommandation oui par défaut sur les abonnements grand public).
- Promotional offers / introductory pricing : à voir post-launch.
