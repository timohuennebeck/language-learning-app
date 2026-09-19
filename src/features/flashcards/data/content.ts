import type { DeckResult } from '@/features/flashcards/data/types';

/** Design sample for 41b (64-card free practice) shown when the results screen is opened directly. */
export const demoResult: DeckResult = {
  total: 64,
  known: 41,
  againCount: 23,
  again: [
    { id: 'd1', word: "s'inquiéter", misses: 4 },
    { id: 'd2', word: 'le rendez-vous', misses: 3 },
    { id: 'd3', word: 'le quartier', misses: 3 },
    { id: 'd4', word: 'déjà', misses: 2 },
    { id: 'd5', word: 'la plupart', misses: 2 },
    { id: 'd6', word: 'se débrouiller', misses: 2 },
    { id: 'd7', word: 'le témoin', misses: 2 },
    { id: 'd8', word: 'pourtant', misses: 1 },
    { id: 'd9', word: "l'échéance", misses: 1 },
    { id: 'd10', word: 'ranger', misses: 1 },
    { id: 'd11', word: 'le carrefour', misses: 1 },
    { id: 'd12', word: 'au fait', misses: 1 },
    { id: 'd13', word: 'emménager', misses: 1 },
    { id: 'd14', word: 'la facture', misses: 1 },
    { id: 'd15', word: 'le trajet', misses: 1 },
    { id: 'd16', word: 'soudain', misses: 1 },
    { id: 'd17', word: 'le quartier libre', misses: 1 },
  ],
};
