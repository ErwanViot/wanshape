/** Unified equipment type used by both custom sessions and programs. */
export type Equipment =
  | 'poids_du_corps'
  | 'halteres'
  | 'barre_disques'
  | 'kettlebell'
  | 'elastiques'
  | 'banc'
  | 'barre_traction'
  | 'trx'
  | 'corde_a_sauter'
  | 'medecine_ball'
  | 'swiss_ball'
  | 'tapis'
  | 'step'
  | 'foam_roller'
  | 'anneaux';

export const EQUIPMENT_OPTIONS: { value: Equipment; label: string }[] = [
  { value: 'poids_du_corps', label: 'Poids du corps' },
  { value: 'halteres', label: 'Haltères' },
  { value: 'barre_disques', label: 'Barre & disques' },
  { value: 'kettlebell', label: 'Kettlebell' },
  { value: 'elastiques', label: 'Élastiques' },
  { value: 'banc', label: 'Banc' },
  { value: 'barre_traction', label: 'Barre de traction' },
  { value: 'trx', label: 'TRX / Sangles' },
  { value: 'corde_a_sauter', label: 'Corde à sauter' },
  { value: 'medecine_ball', label: 'Medicine ball' },
  { value: 'swiss_ball', label: 'Swiss ball' },
  { value: 'step', label: 'Step' },
  { value: 'tapis', label: 'Tapis' },
  { value: 'foam_roller', label: 'Foam roller' },
  { value: 'anneaux', label: 'Anneaux' },
];
