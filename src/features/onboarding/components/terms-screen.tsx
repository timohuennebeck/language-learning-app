import { useLocalSearchParams } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSession } from '@/features/auth/hooks/use-session';
import { sectionsOf } from '@/features/legal/data/repository';
import { useLegalDocument } from '@/features/legal/hooks/use-legal-document';
import { useBack } from '@/shared/hooks/use-back';
import { Button } from '@/shared/ui/button';
import { Gradient } from '@/shared/ui/gradient';
import { PAGE_TOP } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';
import { TopBar } from '@/shared/ui/top-bar';

/**
 * 02c · Nutzungsbedingungen / Datenschutzerklärung (`?doc=privacy`), each its own page. The text
 * comes from `legal_documents` in the app language; the bundled placeholder shows while it loads.
 */
export function TermsScreen() {
  const { t, i18n } = useTranslation();
  const back = useBack();
  const insets = useSafeAreaInsets();
  const { session } = useSession();
  const params = useLocalSearchParams<{ doc?: string }>();
  const doc = params.doc === 'privacy' ? 'privacy' : 'terms';
  const document = useLegalDocument(doc, session.appLanguage);
  const fallback = t('terms.sections', { returnObjects: true }) as { h: string; p: string }[];
  const sections = document.data ? sectionsOf(document.data) : fallback;
  const docLabel = doc === 'terms' ? t('common.terms') : t('common.privacy');
  const meta = document.data
    ? t('terms.stand', {
        date: new Date(document.data.effective_at).toLocaleDateString(i18n.language, {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
      })
    : t('terms.meta');

  return (
    <View className="flex-1 bg-bg">
      <View className="px-[20px]" style={{ paddingTop: insets.top + PAGE_TOP }}>
        <TopBar left="back" />
      </View>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 22,
          paddingTop: 20,
          paddingBottom: 90,
          rowGap: 18,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ rowGap: 6 }}>
          <Text
            className="font-semibold text-ink"
            style={{ fontSize: 28, lineHeight: 30.2, letterSpacing: -0.84 }}
          >
            {docLabel}
          </Text>
          <Text className="text-faint" style={{ fontSize: 13.5 }}>
            {meta}
          </Text>
        </View>
        {sections.map((s) => (
          <View key={s.h} style={{ rowGap: 7 }}>
            <Text className="font-semibold text-ink" style={{ fontSize: 16 }}>
              {s.h}
            </Text>
            <Text className="text-ink2" style={{ fontSize: 14.5, lineHeight: 22.5 }}>
              {s.p}
            </Text>
          </View>
        ))}
      </ScrollView>
      <Gradient
        colors={['rgba(243,245,254,0)', '#f3f5fe']}
        locations={[0, 0.44]}
        className="absolute bottom-0 left-0 right-0 px-[22px] pt-[14px]"
        style={{ paddingBottom: insets.bottom - 4 }}
      >
        <Button height={56} label={t('common.understood')} onPress={back} />
      </Gradient>
    </View>
  );
}
