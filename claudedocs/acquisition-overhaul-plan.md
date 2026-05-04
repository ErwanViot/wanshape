# POC — Refonte funnel d'acquisition

**Branche umbrella** : `feature/acquisition-overhaul`
**Cible finale** : `develop` (uniquement après validation POC complète par le PM)

## Contexte & hypothèse

La nav visiteur actuelle (Explorer / Programmes / Recettes / Tarifs) cache les sections auth-only (Mes séances, Mes programmes, Nutrition tracking, Suivi). Le visiteur sous-estime la valeur du produit → conversion sous-optimale.

**Solution** : exposer la même nav que les utilisateurs connectés, mais chaque entrée auth-only renvoie vers une **feature landing page publique** dédiée (pattern Stripe / Linear / Notion).

## Décisions architecturales

- **Routes publiques séparées** (`/decouvrir/seances`, `/decouvrir/programmes`, `/decouvrir/nutrition`, `/decouvrir/suivi`) — préserve `RequireAuth` intact, SEO propre, OG tags dédiés
- **Pattern réutilisable** `FeatureLandingTemplate` (Hero + Bénéfices + Démo + CTA final), un namespace i18n par landing
- **Nav unifiée visiteur/connecté** — mêmes labels, destinations différentes
- **Prerender SSG** sur toutes les landings (ajout dans `seoRoutes.ts`)

## Workflow d'intégration

```
develop                            ← intouché jusqu'à validation finale
└── feature/acquisition-overhaul   ← PR umbrella (DRAFT vers develop)
    ├── feature/acquisition-pr1-seances-landing
    ├── feature/acquisition-pr2-programs-nutrition
    ├── feature/acquisition-pr3-suivi-bottomnav
    ├── feature/acquisition-pr4-home-redesign
    └── feature/acquisition-pr5-en-variants
```

Chaque sub-PR cible `feature/acquisition-overhaul`. Quand le PM valide le POC, on bascule l'umbrella en ready-for-review vers `develop`.

## Découpage des sub-PRs

| PR | Scope | Cible merge |
|---|---|---|
| **PR 1** (MVP pilote) | `FeatureLandingTemplate` + landing **Séances** + nav visiteur basculée + route `/decouvrir/seances` + i18n FR/EN | `feature/acquisition-overhaul` |
| **PR 2** | Landings **Programmes** + **Nutrition** + leurs i18n | `feature/acquisition-overhaul` |
| **PR 3** | Landing **Suivi** + refonte **BottomNav** visiteur | `feature/acquisition-overhaul` |
| **PR 4** | Refonte **Home** (Journey-oriented, intégration nutrition) | `feature/acquisition-overhaul` |
| **PR 5** | Variantes EN des landings + hreflang | `feature/acquisition-overhaul` |
| PR 6 (opt) | Slots Témoignages + FAQ | `feature/acquisition-overhaul` |

## JTBD validés (panel business)

- **Mes séances** : *"Ta séance de ce matin t'attend déjà."* — séance prête en 0 clic vs Freeletics/Nike
- **Mes programmes** : *"Un plan sur-mesure qui sait quand te faire souffler."* — IA + déload auto vs programmes fixes
- **Nutrition** : *"Mange en fonction de ce que tu fais, pas de ce que tu pèses."* — nutrition liée au sport effectué vs MyFitnessPal générique
- **Suivi** : *"Vois enfin si ça marche — au-delà de la balance."* — corrélation séances × nutrition × corps vs Strava GPS

## Pièges identifiés (à appliquer sur toutes les PRs)

1. CTA "Créer un compte" pas en haut — montrer la valeur d'abord
2. Test "Freeletics pourrait écrire la même phrase ?" → si oui, réécrire
3. Landing IA = exemple réel d'output obligatoire (sinon scepticisme)
4. Cohérence cognitive nav visiteur ↔ connecté = identique (mêmes labels)

## Risque #1 (à valider en PR 1)

Le wording + le pattern visuel. Si la PR 1 sort tiède en review, on pivote le template avant de scaler à 4 landings.
