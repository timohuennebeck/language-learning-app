import { Platform } from 'react-native';

import type { Enums, Tables } from '@/shared/lib/database.types';
import { supabase } from '@/shared/lib/supabase';

export type LegalDocKind = Enums<'legal_doc_kind'>;
export type LegalDocument = Tables<'legal_documents'>;

/** Newest effective document for the kind in `locale`, falling back to English. */
export async function getLegalDocument(kind: LegalDocKind, locale: string): Promise<LegalDocument> {
  const locales = locale === 'en' ? ['en'] : [locale, 'en'];
  const { data, error } = await supabase
    .from('legal_documents')
    .select('*')
    .eq('kind', kind)
    .in('locale', locales)
    .lte('effective_at', new Date().toISOString())
    .order('effective_at', { ascending: false });
  if (error) throw new Error(error.message);
  const doc = data.find((d) => d.locale === locale) ?? data[0];
  if (!doc) throw new Error(`No ${kind} document for ${locale}`);
  return doc;
}

/** `## Heading` + paragraph pairs from `content_md`, for the terms screen. */
export function sectionsOf(doc: LegalDocument): { h: string; p: string }[] {
  return doc.content_md
    .split(/\n(?=## )/)
    .map((block) => block.trim())
    .filter((block) => block.startsWith('## '))
    .map((block) => {
      const [heading, ...rest] = block.split('\n');
      return { h: heading.replace(/^##\s*/, ''), p: rest.join('\n').trim() };
    });
}

const platform = Platform.OS === 'ios' || Platform.OS === 'android' ? Platform.OS : 'web';

/**
 * Records that the user saw and accepted the current terms and privacy policy. Runs at
 * "Los geht's" and again at account creation; a repeat for the same version is ignored.
 */
export async function acceptCurrentLegalDocuments(
  userId: string,
  locale: string,
  appVersion?: string,
): Promise<void> {
  const [terms, privacy] = await Promise.all([
    getLegalDocument('terms', locale),
    getLegalDocument('privacy', locale),
  ]);
  const { error } = await supabase.from('legal_acceptances').upsert(
    [terms, privacy].map((doc) => ({
      user_id: userId,
      document_id: doc.id,
      app_version: appVersion ?? null,
      platform,
    })),
    { onConflict: 'user_id,document_id', ignoreDuplicates: true },
  );
  if (error) throw new Error(error.message);
}
