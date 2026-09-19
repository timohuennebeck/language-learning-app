import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSession } from '@/features/auth/hooks/use-session';
import { sectionsOf } from '@/features/legal/data/repository';
import { useLegalDocument } from '@/features/legal/hooks/use-legal-document';
import { useBack } from '@/shared/hooks/use-back';
import { colors } from '@/shared/theme/tokens';
import { Button } from '@/shared/ui/button';
import { Gradient } from '@/shared/ui/gradient';
import { NavCircle } from '@/shared/ui/nav-circle';
import { ChevronDown, ChevronUp, CheckIcon } from '@/shared/ui/icons';
import { Tap } from '@/shared/ui/tap';
import { Text } from '@/shared/ui/text';

/**
 * 02c · Nutzungsbedingungen (+ 02c-ii with the document picker open). The text comes from
 * `legal_documents` in the app language; the bundled placeholder shows while it loads.
 */
export function TermsScreen() {
  const { t, i18n } = useTranslation();
  const back = useBack();
  const insets = useSafeAreaInsets();
  const { session } = useSession();
  const params = useLocalSearchParams<{ open?: string; doc?: string }>();
  const [open, setOpen] = useState(params.open === '1');
  const [doc, setDoc] = useState<'terms' | 'privacy'>(
    params.doc === 'privacy' ? 'privacy' : 'terms',
  );
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
    <View className="relative flex-1 overflow-hidden bg-bg">
      <View className="bg-bg px-[20px] pb-[14px]" style={{ paddingTop: insets.top - 4 }}>
        <View className="h-[40px] flex-row items-center justify-between">
          <NavCircle icon="back" />
          <Tap
            haptic="light"
            onPress={() => setOpen((o) => !o)}
            className="flex-row items-center rounded-pill bg-surface px-[12px] py-[6px]"
            style={{ columnGap: 6 }}
          >
            <Text className="text-accent-900" style={{ fontSize: 15 }}>
              {docLabel}
            </Text>
            {open ? (
              <ChevronUp size={14} strokeWidth={2.4} />
            ) : (
              <ChevronDown size={14} strokeWidth={2.4} />
            )}
          </Tap>
        </View>
      </View>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 22,
          paddingTop: 20,
          paddingBottom: 120,
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
      {open ? (
        <>
          <Tap
            haptic="none"
            onPress={() => setOpen(false)}
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(22,24,34,.34)' }}
          />
          <View
            className="absolute right-[20px] w-[246px] rounded-[20px] bg-white p-[6px]"
            style={{ top: 100, rowGap: 2, boxShadow: '0 18px 40px rgba(22,24,34,.22)' }}
          >
            {(['terms', 'privacy'] as const).map((d) => {
              const on = d === doc;
              return (
                <Tap
                  key={d}
                  haptic="selection"
                  onPress={() => {
                    setDoc(d);
                    setOpen(false);
                  }}
                  className="flex-row items-center rounded-[15px] p-[12px]"
                  style={{ columnGap: 10, backgroundColor: on ? colors.surface2 : 'transparent' }}
                >
                  <Text
                    className={on ? 'flex-1 font-semibold text-ink' : 'flex-1 text-ink2'}
                    style={{ fontSize: 15.5 }}
                  >
                    {d === 'terms' ? t('common.terms') : t('common.privacy')}
                  </Text>
                  {on ? <CheckIcon size={15} color={colors.accent[800]} strokeWidth={2.4} /> : null}
                </Tap>
              );
            })}
          </View>
        </>
      ) : null}
    </View>
  );
}
