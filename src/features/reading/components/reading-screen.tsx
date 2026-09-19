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
import { InlineFlow } from '@/shared/components/inline-flow';
import { InlineMark } from '@/shared/components/inline-mark';
import { useGoToCourse } from '@/shared/hooks/use-back';
import { insetRing } from '@/shared/lib/styles';
import { colors } from '@/shared/theme/tokens';
import { Button } from '@/shared/ui/button';
import { ArrowLeft, ArrowRight } from '@/shared/ui/icons';
import { Kicker } from '@/shared/ui/kicker';
import { ProgressBar } from '@/shared/ui/progress-bar';
import { Screen } from '@/shared/ui/screen';
import { Tap } from '@/shared/ui/tap';
import { Text } from '@/shared/ui/text';
import { TopBar } from '@/shared/ui/top-bar';

const BODY = { fontSize: 20.5, lineHeight: 35.3, color: colors.accent[900] } as const;
/** The German-to-French variant sets its lines a little looser. */
const BODY_SWAP = { ...BODY, lineHeight: 36.9 } as const;
/** Ring of a swap box that still shows the German. */
const SWAP_RING = insetRing(1.5, colors.ring5);
/** Reading sessions have three sections in the design; only the first two are built. */
const SECTIONS = 3;

/** 14a / 14b / 14e · Lesen. `?section=1|2`, `?mode=swap` for the German-to-French variant. */
export function ReadingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const goToCourse = useGoToCourse();
  const params = useLocalSearchParams<{ section?: string; mode?: string; seg?: string }>();
  const [section, setSection] = useState(params.section === '2' ? 2 : 1);
  const swap = params.mode === 'swap';
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<string | null>(params.seg ?? null);
  const revealedCount = Object.values(revealed).filter(Boolean).length;

  return (
    <Screen bottom={0} className="relative px-[22px]">
      <TopBar left="back" title={t('reading.title')} titleSize={20} />
      {section === 1 ? (
        <View className="mt-[20px]">
          <Kicker tracking={0.1} className="text-accent-700">
            {t('reading.kicker')}
          </Kicker>
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
        <InlineFlow
          className="mt-[20px]"
          textStyle={BODY}
          pieces={section1.map((p, i) =>
            typeof p === 'string'
              ? p
              : {
                  key: `${p.seg}-${i}`,
                  node: (
                    <InlineMark
                      size={BODY.fontSize}
                      color={BODY.color}
                      bg={TIER_BG[segments[p.seg].tier]}
                      ring={selected === p.seg ? insetRing(2, colors.accent[700]) : undefined}
                      sound="none"
                      px={3}
                      py={1}
                      onPress={() => {
                        setSelected(p.seg);
                        router.push({ pathname: '/(app)/reading/word', params: { seg: p.seg } });
                      }}
                    >
                      {segments[p.seg].word}
                    </InlineMark>
                  ),
                },
          )}
        />
      ) : swap ? (
        <InlineFlow
          className="mt-[16px]"
          textStyle={BODY_SWAP}
          pieces={swapSection.map((p, i) => {
            if (typeof p === 'string') return p;
            const open = !!revealed[p.swap];
            return {
              key: `${p.swap}-${i}`,
              node: (
                <InlineMark
                  size={BODY.fontSize}
                  color={open ? colors.accent[900] : colors.accent[700]}
                  bg={open ? colors.accent[300] : 'transparent'}
                  ring={open ? undefined : SWAP_RING}
                  px={6}
                  py={2}
                  onPress={() => setRevealed((r) => ({ ...r, [p.swap]: !r[p.swap] }))}
                  accessibilityState={{ expanded: open }}
                >
                  {open ? swapPairs[p.swap][1] : swapPairs[p.swap][0]}
                </InlineMark>
              ),
            };
          })}
        />
      ) : (
        <InlineFlow
          className="mt-[20px]"
          textStyle={BODY}
          pieces={section2.map((p, i) =>
            typeof p === 'string'
              ? p
              : {
                  key: `${p.text}-${i}`,
                  node: (
                    <InlineMark
                      size={BODY.fontSize}
                      color={BODY.color}
                      bg={TIER_BG[p.tier]}
                      px={3}
                      py={1}
                    >
                      {p.text}
                    </InlineMark>
                  ),
                },
          )}
        />
      )}
      {swap ? (
        <View className="mt-[16px] flex-row items-center" style={{ columnGap: 9 }}>
          <View className="rounded-[6px] px-[8px] py-[2px]" style={{ boxShadow: SWAP_RING }}>
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
          <ProgressBar className="flex-1" progress={section / SECTIONS} radius={4} />
          <Text className="text-muted" style={{ fontSize: 14 }}>
            {t('reading.section', { n: section, total: SECTIONS })}
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
          <Button
            className="flex-1"
            size={17.5}
            label={t('reading.continue')}
            onPress={() => (section < 2 ? setSection(2) : goToCourse(1))}
          />
        </View>
      </View>
    </Screen>
  );
}
