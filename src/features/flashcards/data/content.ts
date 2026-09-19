import type { DeckResult } from '@/features/flashcards/data/types';

/** Design sample for 41b (64-card free practice) shown when the results screen is opened directly. */
export const demoResult: DeckResult = {
  total: 64,
  known: 41,
  againCount: 23,
  again: [
    { id: 'd1', word: "s'inquiéter" },
    { id: 'd2', word: 'le rendez-vous' },
    { id: 'd3', word: 'le quartier' },
    { id: 'd4', word: 'déjà' },
    { id: 'd5', word: 'la plupart' },
    { id: 'd6', word: 'se débrouiller' },
    { id: 'd7', word: 'le témoin' },
    { id: 'd8', word: 'pourtant' },
    { id: 'd9', word: "l'échéance" },
    { id: 'd10', word: 'ranger' },
    { id: 'd11', word: 'le carrefour' },
    { id: 'd12', word: 'au fait' },
    { id: 'd13', word: 'emménager' },
    { id: 'd14', word: 'la facture' },
    { id: 'd15', word: 'le trajet' },
    { id: 'd16', word: 'soudain' },
    { id: 'd17', word: 'le quartier libre' },
  ],
};
