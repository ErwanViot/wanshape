import { describe, expect, it } from 'vitest';
import { sanitizeOnboardingForPersistence } from './sanitize.ts';

const baseInput = {
  objectifs: ['perte_poids'],
  experience_duree: 'debutant',
  frequence_actuelle: 'une_deux',
  blessures: [],
  seances_par_semaine: 3,
  duree_seance_minutes: 45,
  materiel: ['poids_du_corps'],
  duree_semaines: 8,
};

describe('sanitizeOnboardingForPersistence', () => {
  it('strips age and sexe from the payload', () => {
    const sanitized = sanitizeOnboardingForPersistence({ ...baseInput, age: 32, sexe: 'femme' });
    expect(sanitized).not.toHaveProperty('age');
    expect(sanitized).not.toHaveProperty('sexe');
  });

  it('preserves the fields that are still useful at rest', () => {
    const sanitized = sanitizeOnboardingForPersistence({
      ...baseInput,
      objectif_detail: 'perdre 3kg',
      blessure_detail: 'dos parfois sensible',
      age: 40,
      sexe: 'homme',
    });

    expect(sanitized).toEqual({
      objectifs: ['perte_poids'],
      objectif_detail: 'perdre 3kg',
      experience_duree: 'debutant',
      frequence_actuelle: 'une_deux',
      blessures: [],
      blessure_detail: 'dos parfois sensible',
      seances_par_semaine: 3,
      duree_seance_minutes: 45,
      materiel: ['poids_du_corps'],
      duree_semaines: 8,
    });
  });

  it('drops any unexpected property added to the body', () => {
    const sanitized = sanitizeOnboardingForPersistence({
      ...baseInput,
      adresse_postale: '12 rue X',
      numero_telephone: '+33 6 00 00 00 00',
    } as never);
    expect(sanitized).not.toHaveProperty('adresse_postale');
    expect(sanitized).not.toHaveProperty('numero_telephone');
  });

  it('works when optional fields are absent', () => {
    const sanitized = sanitizeOnboardingForPersistence(baseInput);
    expect(sanitized.objectif_detail).toBeUndefined();
    expect(sanitized.blessure_detail).toBeUndefined();
  });
});
