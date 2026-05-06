/**
 * Current CGU/Politique de Confidentialité version.
 *
 * Bump this value every time the documents change in a way that affects the
 * user's consent (new finality, new data processor, new data category).
 * Users whose `profiles.cgu_version_accepted` does not match will see the
 * CguRevalidationModal at login until they accept the new version.
 *
 * Format: `YYYY-MM` for the first revision of a given month, with a trailing
 * letter suffix (`YYYY-MMb`, `YYYY-MMc`, …) for subsequent revisions in the
 * same month. The comparison in `useCguStatus` is a strict equality, so
 * lexicographic order does not matter — only uniqueness does.
 */
export const CURRENT_CGU_VERSION = '2026-05a';

/**
 * Short human-readable summary of what changed in the current version.
 * Rendered inside the re-validation modal so users know why they are prompted.
 *
 * IMPORTANT: this list MUST be rewritten from scratch at every bump of
 * CURRENT_CGU_VERSION. Stale items from previous versions would mislead users
 * and undermine the informed-consent requirement (art. 7 RGPD).
 */
export const CGU_VERSION_CHANGES: string[] = [
  "Ajout de PostHog comme outil d'analyse produit : hébergement sur l'instance européenne, masquage strict des saisies à la source, aucun rejeu de session ni heatmap, aucune donnée de santé transmise.",
  "Ajout de Google Firebase Cloud Messaging pour acheminer les notifications push des applications mobiles iOS et Android : seul un identifiant technique de l'appareil est transmis, jamais le contenu personnel.",
];
