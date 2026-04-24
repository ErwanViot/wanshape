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

export const EQUIPMENT_VALUES: readonly Equipment[] = [
  'poids_du_corps',
  'halteres',
  'barre_disques',
  'kettlebell',
  'elastiques',
  'banc',
  'barre_traction',
  'trx',
  'corde_a_sauter',
  'medecine_ball',
  'swiss_ball',
  'step',
  'tapis',
  'foam_roller',
  'anneaux',
];
