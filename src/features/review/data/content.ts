/** Words captured from the "Café in Paris" conversation. state: 0 unchecked, 1 checked, 2 already saved. */
export const recapWords: { word: string; meaning: string; state: 0 | 1 | 2 }[] = [
  { word: 'à emporter', meaning: 'zum Mitnehmen', state: 1 },
  { word: 'l’addition', meaning: 'die Rechnung', state: 1 },
  { word: 'chaud', meaning: 'heiß', state: 1 },
  { word: 'le lait', meaning: 'die Milch', state: 0 },
  { word: 'le café', meaning: 'der Kaffee', state: 2 },
  { word: 's’il vous plaît', meaning: 'bitte', state: 0 },
];

/** Things the learner described instead of naming. */
export const nextTime: { said: string; word: string; de: string }[] = [
  { said: 'le truc pour remuer', word: 'la cuillère', de: 'der Löffel' },
  { said: 'le lait de plante', word: 'le lait d’avoine', de: 'die Hafermilch' },
  { said: 'la chose pour porter le café', word: 'le gobelet', de: 'der Pappbecher' },
  { said: 'l’argent qu’on laisse', word: 'le pourboire', de: 'das Trinkgeld' },
];
