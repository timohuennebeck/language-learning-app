/** Reading text "Mardi matin" with tappable segments; tier drives highlight strength (0 = strong). */
interface Segment {
  word: string;
  trans: string;
  tier: 0 | 1 | 2;
  stats: { right: number; total: number };
  /** `deMarks`: the phrase(s) inside `de` that translate the word, highlighted on the word screen. */
  sentence: { pre: string; post: string; de: string; deMarks: string[] };
}

export const segments: Record<string, Segment> = {
  allee: {
    word: 'je suis allée',
    trans: 'ich bin gegangen',
    tier: 1,
    stats: { right: 5, total: 11 },
    sentence: {
      pre: 'Hier, ',
      post: ' dans un petit café près du canal.',
      de: 'Gestern bin ich in ein kleines Café am Kanal gegangen.',
      deMarks: ['bin ich', 'gegangen'],
    },
  },
  pres: {
    word: 'près du canal',
    trans: 'in der Nähe des Kanals',
    tier: 2,
    stats: { right: 7, total: 10 },
    sentence: {
      pre: 'Hier, je suis allée dans un petit café ',
      post: '.',
      de: 'Gestern bin ich in ein kleines Café am Kanal gegangen.',
      deMarks: ['am Kanal'],
    },
  },
  demande: {
    word: 'm’a demandé',
    trans: 'hat mich gefragt',
    tier: 1,
    stats: { right: 6, total: 11 },
    sentence: {
      pre: 'Le serveur ',
      post: ' si je voulais un crème ou un allongé.',
      de: 'Der Kellner hat mich gefragt, ob ich einen Milchkaffee oder einen verlängerten Espresso möchte.',
      deMarks: ['hat mich gefragt'],
    },
  },
  voulais: {
    word: 'si je voulais',
    trans: 'ob ich wollte',
    tier: 0,
    stats: { right: 2, total: 9 },
    sentence: {
      pre: 'Le serveur m’a demandé ',
      post: ' un crème ou un allongé.',
      de: 'Der Kellner hat mich gefragt, ob ich einen Milchkaffee oder einen verlängerten Espresso möchte.',
      deMarks: ['ob ich', 'möchte'],
    },
  },
  creme: {
    word: 'un crème',
    trans: 'ein Milchkaffee',
    tier: 0,
    stats: { right: 8, total: 13 },
    sentence: {
      pre: 'Le serveur m’a demandé si je voulais ',
      post: '.',
      de: 'Der Kellner hat mich gefragt, ob ich einen Milchkaffee möchte.',
      deMarks: ['einen Milchkaffee'],
    },
  },
  suite: {
    word: 'tout de suite',
    trans: 'sofort',
    tier: 2,
    stats: { right: 12, total: 15 },
    sentence: {
      pre: 'Je n’ai pas compris ',
      post: ', alors il a souri.',
      de: 'Ich habe es nicht sofort verstanden, da hat er gelächelt.',
      deMarks: ['sofort'],
    },
  },
  pain: {
    word: 'un pain au chocolat',
    trans: 'ein Schokobrötchen',
    tier: 1,
    stats: { right: 4, total: 11 },
    sentence: {
      pre: 'J’ai commandé un allongé et ',
      post: '.',
      de: 'Ich habe einen verlängerten Espresso und ein Schokobrötchen bestellt.',
      deMarks: ['ein Schokobrötchen'],
    },
  },
};

type Piece = string | { seg: string };

/** Section 1 of the text, interleaving plain text and tappable segments. */
export const section1: Piece[] = [
  'Hier, ',
  { seg: 'allee' },
  ' dans un petit café ',
  { seg: 'pres' },
  '. Le serveur ',
  { seg: 'demande' },
  ' ',
  { seg: 'voulais' },
  ' ',
  { seg: 'creme' },
  ' ou un allongé. Je n’ai pas compris ',
  { seg: 'suite' },
  ', alors il a souri et m’a expliqué la différence. J’ai commandé un allongé et ',
  { seg: 'pain' },
  '.',
];

/** Section 2: static highlights (tier decides the tint). */
export const section2: (string | { text: string; tier: 0 | 1 | 2 })[] = [
  { text: 'je me suis assise', tier: 0 },
  ' près de la fenêtre et j’ai sorti mon carnet. ',
  { text: 'À côté de moi', tier: 1 },
  ', deux femmes parlaient ',
  { text: 'très vite', tier: 2 },
  '; je n’ai compris ',
  { text: 'qu’un mot sur trois', tier: 0 },
  '. Quand le serveur ',
  { text: 'est revenu', tier: 1 },
  ', il m’a demandé ',
  { text: 'si tout allait bien', tier: 2 },
  '. J’ai répondu que oui, et que le pain au chocolat était ',
  { text: 'encore chaud', tier: 1 },
  '.',
];

/** Section 2 in "Tauschwörter" mode: German boxes reveal the French on tap. */
export const swapPairs: Record<string, [string, string]> = {
  fenetre: ['am Fenster', 'près de la fenêtre'],
  carnet: ['mein Heft', 'mon carnet'],
  cote: ['Neben mir', 'À côté de moi'],
  vite: ['sehr schnell', 'très vite'],
  revenu: ['zurückkam', 'est revenu'],
  chaud: ['noch warm', 'encore chaud'],
};

export const swapSection: (string | { swap: string })[] = [
  'je me suis assise ',
  { swap: 'fenetre' },
  ' et j’ai sorti ',
  { swap: 'carnet' },
  '. ',
  { swap: 'cote' },
  ', deux femmes parlaient ',
  { swap: 'vite' },
  '; je n’ai compris qu’un mot sur trois. Quand le serveur ',
  { swap: 'revenu' },
  ', il m’a demandé si tout allait bien. J’ai répondu que oui, et que le pain au chocolat était ',
  { swap: 'chaud' },
  '.',
];

export const TIER_BG = ['#b5abfc', '#d2cefd', '#eae8fd'] as const;
