/**
 * Current CGU/Politique de Confidentialité version.
 *
 * Bump this value every time the documents change in a way that affects the
 * user's consent (new finality, new data processor, new data category).
 * Users whose `profiles.cgu_version_accepted` does not match will see the
 * CguRevalidationModal at login until they accept the new version.
 *
 * Format: ISO date `YYYY-MM` to make re-validation cycles explicit.
 */
export const CURRENT_CGU_VERSION = '2026-04';

/**
 * Short human-readable summary of what changed in the current version.
 * Rendered inside the re-validation modal so users know why they are prompted.
 */
export const CGU_VERSION_CHANGES: string[] = [
  "Ajout d'un suivi nutritionnel (journal des repas, cible calorique optionnelle).",
  "Élargissement du sous-traitant Anthropic pour l'estimation IA des calories (abonnés premium).",
  'Nouveau sous-traitant applicatif : Open Food Facts (scan code-barres, appel direct côté client).',
  'Nouvelles finalités et bases légales détaillées dans la Politique de Confidentialité.',
];
