# Privacy Labels — Wan2Fit mobile

Référence interne pour remplir les **Apple App Privacy** (App Store Connect → App Privacy) et la **Google Play Data Safety** (Play Console → App content → Data safety) lors de la première soumission. Couvre la version mobile native v1 (Capacitor + Supabase + PostHog + Sentry + FCM, Premium achat web).

**Dernière mise à jour** : 2026-05-06.
**Source de vérité** : `src/components/Legal.tsx` section "Politique de confidentialité". Si un écart apparaît entre ce fichier et la politique publiée, la politique fait foi.

---

## Apple — App Store Connect

### Verdict global
- **No "Tracking"** déclaré : aucun usage d'IDFA, aucune corrélation cross-app, aucun cross-site tracking. → **pas de prompt ATT requis**.
- Toutes les données collectées sont **Linked to the user** : on sait qu'elles appartiennent à un compte.

### Tableau de déclaration

| Apple data type | Collected | Linked | Used for tracking | Purposes | Source / sous-traitant |
|---|---|---|---|---|---|
| **Contact Info → Email Address** | Yes | Yes | No | App Functionality, Account | Supabase (auth + DB) |
| **User Content → Other User Content** | Yes | Yes | No | App Functionality, Personalization | Supabase (séances complétées, programmes générés, journal nutritionnel, favoris recettes) |
| **User Content → Photos** (avatar profil) | Yes | Yes | No | App Functionality | Supabase Storage |
| **Identifiers → User ID** | Yes | Yes | No | App Functionality, Analytics | Supabase user_id ; identifié dans Sentry et PostHog |
| **Identifiers → Device ID** | Yes | Yes | No | App Functionality (push) | Token Firebase Cloud Messaging — uniquement si l'utilisateur active les notifications |
| **Usage Data → Product Interaction** | Yes | Yes | No | Analytics, Product Personalization | PostHog (instance UE, masquage strict, pas de session replay) |
| **Diagnostics → Crash Data** | Yes | Yes | No | App Functionality | Sentry (crashs natifs + erreurs JS) |
| **Diagnostics → Performance Data** | Yes | Yes | No | App Functionality | Sentry |
| **Diagnostics → Other Diagnostic Data** | Yes | Yes | No | App Functionality | Sentry Session Replay déclenché **sur erreur uniquement** ; aucune capture continue |
| **Purchases → Purchase History** | Yes | Yes | No | App Functionality | Statut d'abonnement Premium reçu via Stripe webhook → Supabase. Aucune donnée bancaire dans l'app. |
| **Health & Fitness** | **No** | — | — | — | Pas activé en v1 — bloqué par Apple Developer enrollment + plugin HealthKit. À déclarer à l'activation de la Phase 5. |
| **Location** | No | — | — | — | Aucune utilisation de la géolocalisation. |
| **Sensitive Info** | No | — | — | — | Les déclarations de blessures ou objectifs santé sont enregistrées comme contenu utilisateur dans Supabase (UE) ; jamais envoyées à PostHog ni Sentry (filtrage explicite côté code). |
| **Financial Info** | No | — | — | — | Tous les paiements sont effectués sur wan2fit.fr (web) via Stripe ; aucune carte bancaire n'est jamais saisie dans l'app. |
| **Contacts / Browsing History / Search History / Audio Data / Other Data** | No | — | — | — | Non collecté. |

### Notes de remplissage Apple
- Pour **Crash Data** : préciser dans la « Justification » que Sentry est utilisé pour la stabilité de l'application uniquement.
- Pour **Other Diagnostic Data** : insister sur "triggered by error only" — Apple est attentif aux replays passifs.
- Pour **Product Interaction** : sélectionner "Analytics" et "Product Personalization", pas "Third-Party Advertising".
- Pour **Device ID** : à déclarer **uniquement si la version soumise inclut FCM compilé**. Si on soumet sans push (rare), retirer la ligne.

---

## Google Play — Data Safety

Google distingue **collected** (envoyé hors device) et **shared** (partagé avec un tiers en plus du collecté). Tout chez nous est "collected", certains items sont aussi "shared" avec des sous-traitants — Google considère cependant que les sous-traitants RGPD ne comptent pas comme "shared" tant qu'ils agissent uniquement sur instruction. Donc **shared = No** partout.

### Tableau de déclaration

| Catégorie Google | Type | Collected | Shared | Optional | Purpose | Notes |
|---|---|---|---|---|---|---|
| **Personal info** | Email address | Yes | No | No | Account management | Supabase auth |
| **Personal info** | Name | Yes | No | Yes | Personalization | Prénom / pseudo facultatif |
| **Personal info** | User IDs | Yes | No | No | Account management, Analytics | Supabase user_id |
| **Photos and videos** | Photos | Yes | No | Yes | Personalization | Avatar profil |
| **Health and fitness** | Health info | No | — | — | — | Pas en v1 ; à activer avec Phase 5 |
| **Health and fitness** | Fitness info | Yes | No | Yes | App functionality | Séances complétées, programmes IA, blessures auto-déclarées (texte libre stocké en DB) |
| **App activity** | App interactions | Yes | No | No | Analytics | PostHog événements produit |
| **App activity** | In-app search history | No | — | — | — | Pas de recherche tracée |
| **App info and performance** | Crash logs | Yes | No | No | App functionality | Sentry |
| **App info and performance** | Diagnostics | Yes | No | No | App functionality | Sentry performance |
| **App info and performance** | Other app performance data | Yes | No | No | App functionality | Sentry Session Replay sur erreur uniquement |
| **Device or other IDs** | Device or other IDs | Yes | No | Yes | App functionality | Token FCM, uniquement si notifications activées |
| **Financial info** | Purchase history | Yes | No | No | App functionality | Statut abonnement Premium reçu de Stripe |
| **Location** | — | No | — | — | — | Non collecté |
| **Contacts** | — | No | — | — | — | Non collecté |
| **Audio files / Files and docs / Calendar / Messages / Web browsing** | — | No | — | — | — | Non collecté |

### Réponses aux questions « Security practices » de Google Play
- **Data is encrypted in transit** : Yes (HTTPS/TLS 1.3 partout — Vercel, Supabase, Sentry, PostHog, Stripe, FCM).
- **Users can request data deletion** : Yes — bouton « Supprimer mon compte » dans l'app + lien `mailto:contact@wan2fit.fr`. Cf. PR #183.
- **Independent security review** : No (pas d'audit tiers en v1, à reconsidérer après PMF).
- **Committed to follow Play Families Policy** : N/A — l'app cible 13+ et n'est pas conçue pour les enfants (mention dans la description).

---

## Cohérence inter-store

- Les deux déclarations doivent être **identiques sur le fond** : ce qu'on dit collecter ici doit aussi figurer dans `Legal.tsx` et inversement.
- En cas de bump de `CURRENT_CGU_VERSION` côté code, mettre à jour ce fichier le même jour pour ne pas dériver.
- Quand HealthKit / Health Connect seront activés (Phase 5), passer `Health & Fitness` à **Yes** dans Apple ET **Health info** à **Yes** dans Google ET ajouter le sous-traitant dans `Legal.tsx`.

## Checklist avant soumission

- [ ] Vérifier que les screenshots ne révèlent aucune donnée d'utilisateur réel (App Reviewer regarde).
- [ ] Le compte démo App Reviewer (`review@wan2fit.fr`) ne contient pas de blessures réelles ni d'identifiant nominatif.
- [ ] Politique de confidentialité publiée à `https://wan2fit.fr/legal/privacy` et accessible sans login.
- [ ] L'URL exacte `https://wan2fit.fr/legal/privacy` est saisie comme **Privacy Policy URL** dans App Store Connect ET Play Console.
- [ ] Cette page liste bien tous les sous-traitants déclarés ici (Sentry, PostHog, FCM, Stripe, Supabase, Anthropic, Resend, Vercel, Open Food Facts).
