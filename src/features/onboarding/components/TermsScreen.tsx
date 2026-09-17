import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useBack } from '@/shared/hooks/useBack';
import { colors } from '@/shared/theme/tokens';
import { Button } from '@/shared/ui/Button';
import { Gradient } from '@/shared/ui/Gradient';
import { NavCircle } from '@/shared/ui/NavCircle';
import { ChevronDown, ChevronUp, CheckIcon } from '@/shared/ui/icons';
import { Tap } from '@/shared/ui/Tap';
import { Text } from '@/shared/ui/Text';

/** 02c · Nutzungsbedingungen (+ 02c-ii with the document picker open). */
export function TermsScreen() {
  const { t } = useTranslation();
  const back = useBack();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ open?: string; doc?: string }>();
  const [open, setOpen] = useState(params.open === '1');
  const [doc, setDoc] = useState<'terms' | 'privacy'>(
    params.doc === 'privacy' ? 'privacy' : 'terms',
  );
  const sections = t('terms.sections', { returnObjects: true }) as { h: string; p: string }[];
  const docLabel = doc === 'terms' ? t('common.terms') : t('common.privacy');

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
      <View className="flex-1 overflow-hidden px-[22px] pt-[20px]" style={{ rowGap: 18 }}>
        <View style={{ rowGap: 6 }}>
          <Text
            className="font-semibold text-ink"
            style={{ fontSize: 28, lineHeight: 30.2, letterSpacing: -0.84 }}
          >
            {docLabel}
          </Text>
          <Text className="text-faint" style={{ fontSize: 13.5 }}>
            {t('terms.meta')}
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
      </View>
      <Gradient
        colors={['rgba(243,245,254,0)', '#f3f5fe']}
        locations={[0, 0.44]}
        className="px-[22px] pt-[14px]"
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
