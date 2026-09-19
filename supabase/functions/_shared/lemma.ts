// Normalising a word to its dictionary spelling, so `lexemes` has one row per word.
//
// Server-side only: the client never normalises anything, it only ever sees lexeme ids. That is
// deliberate — a normalisation that drifted between the app and the generator would silently stop
// a text from finding the learner's flashcards, and nothing would look broken.

/** Articles stripped from the front of a lemma, longest first so `l’` never shadows `les`. */
const ARTICLES: Record<string, string[]> = {
  fr: ['les ', 'le ', 'la ', 'des ', 'une ', 'un ', 'de la ', 'du ', "l'", 'l’'],
  es: ['los ', 'las ', 'el ', 'la ', 'unos ', 'unas ', 'un ', 'una '],
  it: ['gli ', 'il ', 'lo ', 'la ', 'le ', 'un ', 'uno ', 'una ', "l'", 'l’'],
  pt: ['os ', 'as ', 'o ', 'a ', 'um ', 'uma '],
  de: ['der ', 'die ', 'das ', 'ein ', 'eine '],
  en: ['the ', 'a ', 'an '],
};

/** Punctuation trimmed from both ends. Apostrophes inside a word (`s’il`) are part of it. */
const EDGE_PUNCTUATION = /^[\s"“”„«»'‘’(\[{.,;:!?¿¡…—–-]+|[\s"“”„«»(\[{.,;:!?…—–-]+$/gu;

/**
 * The dictionary spelling of `word`: NFC, lowercased, trimmed, one leading article removed.
 *
 * Diacritics are kept on purpose — `ou` ("or") and `où` ("where") are different words, and folding
 * them would merge two lexemes into one and teach the learner the wrong meaning.
 */
export function toLemma(word: string, language: string): string {
  let out = word.normalize('NFC').toLowerCase().replace(EDGE_PUNCTUATION, '').trim();
  // Collapse the whitespace a multi-word phrase may carry ("tout  de suite").
  out = out.replace(/\s+/g, ' ');
  for (const article of ARTICLES[language] ?? []) {
    if (out.startsWith(article) && out.length > article.length) {
      out = out.slice(article.length).trim();
      break;
    }
  }
  return out;
}
