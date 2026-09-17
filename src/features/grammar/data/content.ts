type GrammarForm = { name: string; ko: string; score: [number, number]; ok: boolean };

export const forms: GrammarForm[] = [
  { name: 'Vouvoiement', ko: 'vous · -ez', score: [9, 10], ok: true },
  { name: 'Passé composé', ko: 'avoir + Partizip', score: [2, 3], ok: false },
  { name: 'Teilungsartikel', ko: 'du · de la · des', score: [2, 3], ok: false },
  { name: 'Präpositionen', ko: 'à · au · en', score: [6, 8], ok: true },
];
