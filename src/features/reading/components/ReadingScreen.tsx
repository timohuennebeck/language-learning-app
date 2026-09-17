import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  TIER_BG,
  section1,
  section2,
  segments,
  swapPairs,
  swapSection,
} from '@/features/reading/data/content';
import { cn } from '@/shared/lib/cn';
import { haptic } from '@/shared/lib/haptics';
import { colors } from '@/shared/theme/tokens';
import { ArrowLeft, ArrowRight } from '@/shared/ui/icons';
import { ProgressBar } from '@/shared/ui/ProgressBar';
import { Screen } from '@/shared/ui/Screen';
import { Tap } from '@/shared/ui/Tap';
import { Text } from '@/shared/ui/Text';
import { TopBar } from '@/shared/ui/TopBar';

const BODY = { fontSize: 20.5, lineHeight: 35.3, color: colors.accent[900] } as const;

/** 14a / 14b / 14e · Lesen. `?section=1|2`, `?mode=swap` for the German-to-French variant. */
export function ReadingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ section?: string; mode?: string; seg?: string }>();
  const [section, setSection] = useState(params.section === '2' ? 2 : 1);
  const swap = params.mode === 'swap';
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<string | null>(params.seg ?? null);
  const revealedCount = Object.values(revealed).filter(Boolean).length;
  const total = 3;

  return (
    <Screen top={0} bottom={0} className="relative px-[22px]">
      <TopBar left="close" title={t('reading.title')} titleSize={20} />
      {section === 1 ? (
        <View className="mt-[20px]">
          <Text className="uppercase text-accent-700" style={{ fontSize: 11, letterSpacing: 1.1 }}>
            {t('reading.kicker')}
          </Text>
          <Text
            className="mt-[8px] font-semibold text-ink"
            style={{ fontSize: 27, lineHeight: 29.7, letterSpacing: -0.81 }}
          >
            {t('reading.headline')}
          </Text>
          <Text className="mt-[8px] text-muted" style={{ fontSize: 14 }}>
            {t('reading.hint')}
          </Text>
        </View>
      ) : swap ? (
        <View className="mt-[18px] flex-row items-center" style={{ columnGap: 10 }}>
          <View className="rounded-pill bg-surface px-[12px] py-[5px]">
            <Text className="font-semibold text-accent-800" style={{ fontSize: 13 }}>
              {t('reading.swapMode')}
            </Text>
          </View>
          <Text className="text-faint" style={{ fontSize: 13 }}>
            {t('reading.swapNote', { done: revealedCount, total: Object.keys(swapPairs).length })}
          </Text>
        </View>
      ) : null}

      {section === 1 ? (
        <Text className="mt-[20px]" style={BODY}>
          {section1.map((p, i) =>
            typeof p === 'string' ? (
              <Text key={i} style={BODY}>
                {p}
              </Text>
            ) : (
              <Text
                key={i}
                onPress={() => {
                  haptic('selection');
                  setSelected(p.seg);
                  router.push({ pathname: '/(app)/reading/word', params: { seg: p.seg } });
                }}
                style={{
                  ...BODY,
                  borderRadius: 6,
                  paddingHorizontal: 3,
                  paddingVertical: 1,
                  backgroundColor: TIER_BG[segments[p.seg].tier],
                  boxShadow:
                    selected === p.seg ? `inset 0 0 0 2px ${colors.accent[700]}` : undefined,
                }}
              >
                {segments[p.seg].word}
              </Text>
            ),
          )}
        </Text>
      ) : swap ? (
        <Text className="mt-[16px]" style={{ ...BODY, lineHeight: 36.9 }}>
          {swapSection.map((p, i) => {
            if (typeof p === 'string')
              return (
                <Text key={i} style={{ ...BODY, lineHeight: 36.9 }}>
                  {p}
                </Text>
              );
            const open = !!revealed[p.swap];
            return (
              <Text
                key={i}
                onPress={() => {
                  haptic('selection');
                  setRevealed((r) => ({ ...r, [p.swap]: !r[p.swap] }));
                }}
                style={{
                  ...BODY,
                  lineHeight: 36.9,
                  borderRadius: 6,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  backgroundColor: open ? colors.accent[300] : 'transparent',
                  boxShadow: open ? undefined : `inset 0 0 0 1.5px ${colors.ring5}`,
                  color: open ? colors.accent[900] : colors.accent[700],
                }}
              >
                {open ? swapPairs[p.swap][1] : swapPairs[p.swap][0]}
              </Text>
            );
          })}
        </Text>
      ) : (
        <Text className="mt-[20px]" style={BODY}>
          {section2.map((p, i) =>
            typeof p === 'string' ? (
              <Text key={i} style={BODY}>
                {p}
              </Text>
            ) : (
              <Text
                key={i}
                style={{
                  ...BODY,
                  borderRadius: 6,
                  paddingHorizontal: 3,
                  paddingVertical: 1,
                  backgroundColor: TIER_BG[p.tier],
                }}
              >
                {p.text}
              </Text>
            ),
          )}
        </Text>
      )}
      {swap ? (
        <View className="mt-[16px] flex-row items-center" style={{ columnGap: 9 }}>
          <View
            className="rounded-[6px] px-[8px] py-[2px]"
            style={{ boxShadow: `inset 0 0 0 1.5px ${colors.ring5}` }}
          >
            <Text className="text-accent-700" style={{ fontSize: 13.5 }}>
              {t('reading.german')}
            </Text>
          </View>
          <ArrowRight size={16} color={colors.dim3} />
          <View className="rounded-[6px] bg-accent-300 px-[8px] py-[2px]">
            <Text className="text-accent-900" style={{ fontSize: 13.5 }}>
              {t('reading.french')}
            </Text>
          </View>
          <Text className="text-muted" style={{ fontSize: 13.5 }}>
            {t('reading.tapToReveal')}
          </Text>
        </View>
      ) : null}
      <View className="flex-1" />
      <View style={{ rowGap: 11 }}>
        <View className="flex-row items-center" style={{ columnGap: 10 }}>
          <ProgressBar className="flex-1" progress={section / total} radius={4} />
          <Text className="text-muted" style={{ fontSize: 14 }}>
            {t('reading.section', { n: section, total })}
          </Text>
        </View>
        <View className="flex-row items-center" style={{ columnGap: 12 }}>
          <Tap
            haptic="light"
            onPress={() => (section > 1 ? setSection(1) : router.back())}
            className="h-[58px] w-[58px] items-center justify-center rounded-full bg-surface"
          >
            <ArrowLeft />
          </Tap>
          <Tap
            haptic="medium"
            onPress={() =>
              section < 2 ? setSection(2) : router.push('/(app)/chapter/cafe?station=1')
            }
            className={cn(
              'h-[58px] flex-1 items-center justify-center rounded-pill bg-accent-800 active:opacity-90',
            )}
          >
            <Text className="font-semibold text-accent-100" style={{ fontSize: 17.5 }}>
              {t('reading.continue')}
            </Text>
          </Tap>
        </View>
      </View>
    </Screen>
  );
}
