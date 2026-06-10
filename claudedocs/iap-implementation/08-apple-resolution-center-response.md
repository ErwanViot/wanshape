# Réponse Apple Resolution Center — 2026-06-07

À coller dans App Store Connect > Wan2Fit > version en review > Resolution Center > Reply.

---

```
Hi Apple Review Team,

Thank you for the additional clarification on Guideline 3.1.1. We
acknowledge the point: hiding the pricing UI on iOS is not sufficient
as long as the app grants access to digital content acquired
elsewhere. We accept the requirement and are implementing Apple
In-App Purchase via StoreKit.

WHAT WE ARE BUILDING

- Two auto-renewable subscriptions in the same subscription group:
    wan2fit.premium.monthly  — 9.99 EUR / month
    wan2fit.premium.yearly   — 99.99 EUR / year
- Subscription products will be submitted to App Review alongside a
  new binary that includes the StoreKit purchase flow.
- A "Restore Purchases" button is added in Settings as required.
- Existing customers who subscribed on our website
  (https://wan2fit.fr) will continue to access their content under
  guideline 3.1.3(b) Multiplatform Service, since In-App Purchase is
  now also available inside the iOS app for new users.

TIMELINE

We expect the IAP-enabled build to be ready for submission within
two weeks. We will notify you in this thread when the new build
(1.2.0 or higher) is uploaded to TestFlight and attached to this
submission, along with sandbox test credentials so you can validate
the purchase flow without a real charge.

In the meantime, please keep this submission open. We did not
intend any guideline violation — the previous iteration was our
attempt to comply with 3.1.3(b) Multiplatform Service, and we now
understand that path requires IAP to also exist as a parallel
option.

Thank you for your patience and for the clear feedback.

Best regards,
Erwan Viot
Wan Soft
```

---

## Pourquoi cette formulation

- **Acknowledge explicit** (« We acknowledge the point ») : Apple reviewers répondent mieux quand on reconnaît leur position au lieu de la discuter.
- **Listes nominatives des Product IDs** : preuve qu'on a déjà commencé, pas juste du "on va voir".
- **Timeline conservative (2 semaines)** : laisse de la marge réelle (le dev est 3-5j mais l'examen Apple ajoute 1-3j de plus). Mieux que promettre "few days" et glisser.
- **Mention de 3.1.3(b)** : montre qu'on a compris la nuance (3.1.3(b) reste valide *en plus* de l'IAP, pas à la place).
- **Sandbox credentials promised** : Apple aime quand on facilite leur job pour le re-review.
- **Pas d'excuses ni de longues explications historiques** : rester court et opérationnel.

## Quand envoyer

**Maintenant**. Avant même de commencer le dev. Raisons :
- La submission reste "active" plus longtemps si l'Apple voit qu'on travaille.
- Si on attend que le nouveau build soit prêt, Apple peut auto-clore la submission après ~30j d'inactivité.
- Le reviewer qui re-jugera plus tard verra le thread complet et notera notre bonne foi.
