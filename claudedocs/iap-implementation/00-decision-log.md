# IAP iOS — Decision log

Captures every architectural decision for the In-App Purchase implementation on iOS (and forward-compatible Android) so we never have to re-debate them silently in 3 months.

---

## Context

Apple App Review verdict 2026-06-07 (Submission `73dc985c-d2ef-43ce-aa00-163187001cc5`, version reviewed 1.0 / 10104):

> Guideline 3.1.1 — The app accesses digital content purchased outside the app, such as Premium subscription, but that content isn't available to purchase using In-App Purchase.

Translation: hiding the pricing UI on iOS (what PR #227 did via `NativeUpgradeWall` + `openWebPricingPage`) is **not enough**. The mere fact that the iOS app *grants access* to premium features purchased on the web triggers 3.1.1. To pass review we must either:

- **Option 1 — Add Apple IAP** so users *can* subscribe inside the app.
- **Option 2 — Make the iOS app fully free, no premium content accessible**. Web subscribers would still log in, but every premium feature would be silently locked. Catastrophic UX.

Option 2 destroys the value proposition of the iOS app and frustrates paying web users. Option 1 is the only reasonable path.

---

## Decision 1 — RevenueCat as the IAP layer

### Alternatives evaluated

| Option | Cost | Effort | Receipt validation | Cross-platform |
|---|---|---|---|---|
| **RevenueCat (`@revenuecat/purchases-capacitor`)** | Free <$2.5K MRR, then 1% MRR | ~1 day | Automatic | iOS + Android same code |
| `cordova-plugin-purchase` (community) | Free forever | 2-3 days | We code it (Apple verifyReceipt + Google Play Developer API) | iOS + Android, less polished |
| `@capacitor-community/in-app-purchases` | Free forever | 2 days | We code it | iOS + Android, less mature |
| StoreKit 2 native Swift | Free | 3-5 days, requires Capacitor → native bridge | We code it | iOS only — we'd need Google Play Billing native separately |

### Why RevenueCat wins

1. **Receipt validation is a regulated minefield**. Apple's `verifyReceipt` endpoint, refund handling, grace periods, retry logic for billing failures, family sharing, promotional offers, introductory pricing — all of this is server-side state that RevenueCat handles. Rolling it ourselves is weeks of work and a fertile source of subtle revenue bugs.
2. **Cross-platform with one code path**. When Google Play flags the same 3.1.1 equivalent (likely, given Google enforces in-app purchase for digital goods sold to Android users), the same RevenueCat code switches between StoreKit and Google Play Billing. Zero rework.
3. **Industry standard**. Strava, Headspace, Discord, Notion all use RevenueCat. Mature plugin (`@revenuecat/purchases-capacitor`), good docs, active maintenance.
4. **Pricing is benign at our scale**. Free up to $2.5K MRR ($30K ARR). Above: 1% MRR. At $100K ARR that's $1000/year — vs at least 5-10 days of engineering time saved.
5. **Reversible**. If we ever outgrow RevenueCat, all the state lives on Apple/Google's side. We can swap in a custom receipt validator without losing customer history.

### Why we didn't pick `cordova-plugin-purchase`

Free is appealing, but the hidden cost is the receipt validator we'd own. Subscriptions are not a one-shot transaction — they renew, get refunded, switch tiers, get paused, get grace-period-extended. Every one of those events needs server-side handling. We'd be reinventing RevenueCat badly and paying with engineering time forever.

### Why we didn't pick native StoreKit 2

Wan2Fit is a Capacitor app. Going native iOS for IAP means:
- Native Swift code maintained in the iOS shell project (`ios/App/App/`)
- Bridge to JS via custom Capacitor plugin
- Same work needed again natively for Android (Google Play Billing in Java/Kotlin)
- We lose the abstraction Capacitor gives us

Only justified if RevenueCat were broken or absurdly priced. It isn't.

### Decision

**Adopt RevenueCat** via `@revenuecat/purchases-capacitor`.

---

## Decision 2 — Small Business Program enrollment

Apple's default commission: **30%** on subscriptions year 1, **15%** year 2+.

The **Small Business Program**: **15% from day 1** for developers earning < $1M USD/year on the App Store.

### Eligibility

Wan2Fit has not yet shipped to the App Store, so revenue is $0. We're trivially under $1M. Enrollment is free, takes ~5 minutes in App Store Connect → Agreements, Tax and Banking → Membership.

### Downside

None. The program only ends if we cross $1M revenue in a calendar year, at which point we move back to 30% the following year. That's a great problem to have.

### Decision

**Enroll in the Small Business Program before submitting the IAP products** so our prices show the better commission rate from the first purchase.

---

## Decision 3 — Respond to Apple now or wait until the build is ready?

### Wait approach

- Pro: Honest — no promise we might miss.
- Con: Apple's clock keeps ticking. Their workflow is "no reply = abandoned". Risk that the submission expires and we restart from zero on the next round.

### Respond now approach

- Pro: Buys goodwill, signals seriousness, locks the submission in "developer responded" state which doesn't auto-expire.
- Pro: Apple reviewers tend to remember good-faith communications across rounds.
- Con: Sets an expectation timeline we must honor.

### Decision

**Respond now**, but with a deliberately conservative timeline ("within 2 weeks" rather than "within days"). The IAP implementation is 2-3 days of focused work, but with App Store Connect setup, RevenueCat configuration, sandbox testing, and a fresh review cycle, we want margin.

See `08-apple-resolution-center-response.md` for the exact text we sent.

---

## Decision 4 — Stripe stays on the web

Three payment paths could coexist for the same user:

- **Web** (`wan2fit.fr`) → Stripe Checkout, 9,99€/mois or 99,99€/an
- **iOS native** → Apple StoreKit IAP, same price points
- **Android native** → Google Play Billing IAP, same price points

### Why we keep Stripe on web

1. **Apple/Google take 15%, Stripe takes ~2%**. Every euro of subscription that goes through the web instead of native saves us ~13% net margin.
2. **Better attribution & analytics**. Stripe webhooks give us full event control, refunds, dunning, custom emails. Native stores are more opaque.
3. **Marketing on web pushes web checkout**. SEO traffic, landing pages, paid acquisition all funnel to the web checkout by default. Mobile users discovering us via the App Store get the native path.

### Source of truth

`profiles.subscription_tier` in Supabase, updated by **two webhooks**:

- `stripe-webhook` (already deployed) for web purchases
- `revenuecat-webhook` (new, in this PR) for native iOS / Android purchases

If a user somehow ends up subscribed via both paths (edge case), the most recent webhook wins. We log the duplicate and trust the user not to double-pay (they'd get two charges, would notice, and we'd refund the older one).

### Decision

**Keep Stripe on web, add RevenueCat for native. No migration of existing web subscribers to IAP** — they continue using their Stripe sub forever (guideline 3.1.3(b) Multiplatform Service still covers them: the iOS app grants them access to content they bought elsewhere, which Apple accepts *as long as* an in-app purchase option also exists for new users).

---

## Decision 5 — Where the IAP paywall lives in the app

After this PR:

- **Web** (`isNative() === false`): unchanged. `PricingCards.tsx` shows Stripe checkout.
- **iOS / Android native** (`isNative() === true`):
  - `PricingCards.tsx` and `PremiumPromoPage.tsx` no longer render `<NativeUpgradeWall />`. They render a new `<NativePricingCards />` component that lists RevenueCat packages and triggers `Purchases.purchasePackage(pkg)` on tap.
  - `<NativeUpgradeWall />` itself stays in the codebase, but is repurposed as a fallback for *unauthenticated* native users (sign-in is still required to subscribe).
  - All the deep CTAs that currently link to `/premium` (EndScreen, SeancesPage, ProgramList, ConnectedContent) now route to `/tarifs` which on native is the IAP picker.
  - **Restore Purchases** button added in `auth/SettingsPage.tsx` — calls `Purchases.restorePurchases()`. Required by Apple App Review.

---

## Decision 6 — Subscription product IDs

| Tier | iOS / Android product ID | Stripe price ID (existing) |
|---|---|---|
| Premium Monthly | `wan2fit.premium.monthly` | `price_…` (already in `.env.production` as `VITE_STRIPE_PRICE_MONTHLY`) |
| Premium Yearly | `wan2fit.premium.yearly` | `price_…` (already in `.env.production` as `VITE_STRIPE_PRICE_YEARLY`) |

Product IDs are global namespaces in App Store Connect and Google Play. We use `wan2fit.premium.{monthly,yearly}` to keep them readable. They never change once published — App Store Connect refuses to delete a product ID.

---

## Open questions to revisit later

- **Annual price introductory offer**: Apple allows promotional pricing for the first year (e.g. -50% first year). Should we add? Punt to post-launch — first ship the basics.
- **Restore via deep link**: should `restorePurchases()` also fire on every cold launch in case the user was already a customer on another device? Default RevenueCat behavior covers this via `customerInfo` polling; we'll just trust it.
- **Family Sharing**: enabled by default on auto-renewable subscriptions in App Store Connect. Probably want it on. Decide before submitting the products to App Review.
