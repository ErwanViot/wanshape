# Génération asynchrone des programmes IA — Design

## Problème

`generate-program` fait un appel Anthropic **bloquant** puis répond. La génération
d'un programme phasé réaliste dépasse le plafond de la plateforme :

- Plafond dur : **150s** (request idle timeout Supabase → 504 si pas de réponse).
- Mesures : 4 séances uniques ≈ 103s, 6 séances ≈ 146s (≈ 17s base + ~21s/séance).
- Le cas phare **8 sem / 3 séances** (6 séances distinctes) = ~146s = **504 permanent**.

Le single-call plafonne à ~4-5 séances fiables. Insuffisant pour la périodisation.

## Solution : génération en tâche de fond

`EdgeRuntime.waitUntil()` garde l'isolate vivant **jusqu'à 400s de wall-clock**
(plan payant) *après* avoir déjà répondu au client — on échappe au plafond 150s.

### Flux

1. Client POST onboarding → validation, checks premium / cap / rate-limit (rapide).
2. Insert d'une ligne `programs` **placeholder** `status='generating'`, réponse
   immédiate `{ programId, status: 'generating' }` (< 2s).
3. La génération Anthropic + validation + insert `program_sessions` tournent dans
   `EdgeRuntime.waitUntil(...)`.
4. Succès → update de la ligne (titre, note_coach, progression…, `status='ready'`)
   + insert des `program_sessions`.
5. Échec → `status='failed'` + `error_reason`.
6. Client **poll** la ligne par id jusqu'à `status != 'generating'` : écran de
   chargement animé (LOADING_PHASES existe déjà) → navigation vers le programme
   quand `ready`, message d'erreur si `failed`.

## Forks de conception

### Fork 1 — Schéma d'état → **colonne `status` sur `programs`** (recommandé)
`status program_status not null default 'ready'` avec enum `('generating','ready','failed')`
+ `error_reason text`. La ligne existe dès le départ comme placeholder.
- Les listes (`useProgram`, ProgramList) filtrent `status = 'ready'` (ou affichent
  un badge « génération en cours »).
- Alternative rejetée : table `generation_jobs` séparée → 2 tables à coordonner,
  plus de complexité pour un gain faible.

### Fork 2 — Attente client → **polling** (recommandé)
Poll GET program par id toutes les ~3s jusqu'à `status != 'generating'`.
- Simple, robuste, aligné sur les patterns existants, aucune infra nouvelle.
- Alternative rejetée : Supabase Realtime → plus slick mais ajoute une dépendance
  Realtime que l'app n'utilise pas ailleurs.

### Fork 3 — UX « quitter et revenir » → **DÉCIDÉ : fire-and-forget**
L'utilisateur peut quitter l'écran d'attente ; la génération continue côté serveur.
Le programme apparaît dans « Mes programmes » avec un état `generating` → `ready`
(badge + spinner). Navigation auto s'il est resté sur l'écran d'attente.
Notification prête : **badge + toast en v1**, push en v2 (infra FCM existe).
Pas de gate bloquant « ce programme te convient ? ».

### Fork 3bis — Boucle de révision (DÉCIDÉ, remplace tout « gate »)
Pas de confirmation bloquante. À la place, tant que le programme **n'est pas
commencé** (aucune complétion de séance rattachée), l'utilisateur peut demander un
ajustement :
- Un champ **commentaire libre** (« mets plus de cardio », « enlève les squats »,
  « raccourcis les séances »…).
- Le prompt est **relancé** en incluant : le programme précédent (contexte) + le
  commentaire, pour produire une version corrigée qui remplace l'ancienne.

Points à trancher côté implémentation :
- **Gate « non commencé »** : vérifier l'absence de `session_completions` liées au
  programme avant d'autoriser la révision.
- **Quota** : une révision est un appel Anthropic → compte-t-elle dans les 3/24h ?
  Reco : oui (même coût), mais message dédié « révision » pour la clarté.
- **Mécanisme** : révision = régénération async (même flux placeholder→waitUntil)
  qui écrase le contenu du même `programId`, en repassant `status='generating'`.
- **Prompt** : ajouter un mode « révision » (programme précédent + consigne de
  changement) dans `prompt.ts` / une variante de `buildUserPrompt`.

### Fork 4 — MAX_TOKENS
L'async retire la pression temporelle ; seule reste la limite de sortie du modèle
(Sonnet supporte bien plus). On peut **remonter MAX_TOKENS** (>20480) pour les gros
programmes sans risque de timeout. Truncation déjà détectée via `stop_reason`.

### Fork 5 — Cap & cleanup
- Le cap « 3 programmes actifs » compte-t-il les `generating` ? → Oui (anti-spam).
- Une génération `failed` ne doit pas bloquer le cap → soit auto-purge, soit
  exclue du compte, soit l'utilisateur la supprime.
- Le rate-limit (3/24h) reste inchangé (row insérée avant la génération).

## Impacts fichiers (estimation)

- **Migration** : `status` + `error_reason` sur `programs`, enum, index partiel
  `where status='ready'`, RLS inchangée. Adapter la RPC `create_program_with_sessions`
  (ou split : create placeholder → finalize).
- **Edge `generate-program`** : réécriture du flux (placeholder → waitUntil →
  finalize/fail). Le timeout 145s devient caduc (waitUntil jusqu'à 400s).
- **Client** : `useGenerateProgram` (retourne un id + poll), `CreateProgramPage`
  (écran d'attente pollé), `useProgram`/`ProgramList` (filtrer/afficher `status`).
- **Tests** : validate.ts inchangé ; ajouter tests d'état/flux si extractibles.

## Ce qui reste de la PR #239 (périodisation)

La logique de périodisation (prompt phasé, validate, classifyStructure, 6 sem,
bornage) est correcte et déjà validée end-to-end sur les petits programmes. L'async
la rend shippable pour **tous** les configs. → l'async se construit **sur la même
branche** `feature/programme-periodise` pour que la PR finale soit cohérente.
