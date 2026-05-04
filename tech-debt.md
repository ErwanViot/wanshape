# Tech Debt — Wan2Fit

## Bug critique : données Supabase disparaissent après tab switch

**Priorité** : haute (post-MEP)
**Workaround actuel** : hard refresh (Cmd+R)

### Symptômes
- Switch d'onglet → revenir → les données Supabase disparaissent (spinner infini)
- Aucune requête HTTP ne part vers Supabase (blocage côté client JS)
- Hard refresh corrige systématiquement

### Root cause identifiée
Le `inMemoryLock` dans `src/lib/supabase.ts` crée un deadlock :
1. Au retour d'onglet, GoTrueClient (`autoRefreshToken`) lance un `refreshSession()` qui acquiert le lock
2. Les hooks data appellent `supabase.from(...).select(...)` qui appelle `getSession()` en interne
3. `getSession()` attend le même lock → deadlock (le lock est non-réentrant)
4. Les requêtes HTTP ne partent jamais, les hooks restent en `loading: true`

### Pourquoi le `inMemoryLock` existe
Il remplace Navigator Locks qui deadlockent en dev (HMR Vite : le module est disposé sans libérer le lock).

### Pistes de résolution
1. **Migrer vers TanStack Query** — gère stale-while-revalidate, dedup, cancellation nativement
2. **Lock réentrant** — permettre à `getSession()` de passer si appelé depuis le même contexte que `refreshSession()`
3. **Désactiver `autoRefreshToken`** et gérer le refresh manuellement (testé, cause d'autres problèmes)
4. **Supprimer le lock custom** et accepter le délai HMR en dev (Navigator Locks)

### Fichiers concernés
- `src/lib/supabase.ts` — `inMemoryLock`
- `src/contexts/AuthContext.tsx` — visibility handler
- `src/lib/supabaseQuery.ts` — query wrapper
- `src/components/PublicLayout.tsx` — `dataGeneration` bump
- `src/hooks/useProgram.ts`, `useUserPrograms.ts`, `useHistory.ts` — data hooks

---

## Sentry Session Replay : absence de masquage des inputs

**Priorité** : haute (données sensibles)
**Introduit par** : audit 2026-04-18 SEC-04 ; aggravé par la déclaration des replays dans la Politique de Confidentialité

### Symptôme
`Sentry.replayIntegration()` est initialisé avec les options par défaut dans `src/main.tsx:12`. Par défaut Sentry SDK ne masque que les champs `type="password"` et les éléments portant la classe `.sentry-mask`. Les autres inputs (email, prénom, journal alimentaire, description de repas pour l'estimation IA, blessures déclarées dans l'onboarding programme) sont capturés tels quels lors d'un rejeu d'erreur.

### Risque
Combinaison email + blessures + journal alimentaire = ensemble qualifiable de données de santé (RGPD art. 9). La Politique de Confidentialité documente honnêtement le comportement depuis la version `2026-04b`, mais l'absence de mitigation technique reste fragile.

### Fix proposé
```ts
Sentry.replayIntegration({
  maskAllInputs: true,
  maskAllText: false, // laisser le texte non-input lisible pour le debug
  blockAllMedia: false,
})
```

Alternative plus fine si `maskAllInputs: true` est trop strict pour le debug :
- Garder le comportement par défaut
- Ajouter `className="sentry-mask"` sur tous les inputs qui collectent de la donnée personnelle : formulaire nutrition, étapes onboarding programme, formulaire signup


## Push notifications — rate limiting + OAuth cache (PR #6)

**Priorité** : avant scale (>100 users actifs)
**Statut** : MVP acceptable

### Problème 1 — pas de rate limit sur send-push
`supabase/functions/send-push` est gardé par un `x-internal-secret` header. Si le secret leak (dev shares, log accidentel), un attaquant peut spam tous les users sans limite. À ajouter avant prod publique :
- compteur Redis ou table `push_log` (timestamp, user_id, category)
- quota dur (ex: 10 sends/user/heure)

### Problème 2 — pas de cache du token Google OAuth
`getFcmAccessToken` génère un JWT RS256 + appel `oauth2.googleapis.com/token` à chaque invocation de `send-push`. Le token est valide 1h. Cache module-level avec expiry check ferait ça en O(1) pour les 99% suivants des appels.

### Fix proposé
1. Variable module-level `let cachedAccessToken: { value: string; expiresAt: number } | null` dans send-push/index.ts
2. `if (cached && Date.now() < cached.expiresAt - 60_000) return cached.value`
3. Sinon refetch et stocker


