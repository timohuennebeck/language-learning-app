import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Circle } from 'react-native-svg';

import { GradientHeader } from '@/shared/components/gradient-header';
import { Hint } from '@/shared/components/hint';
import { OptionRow } from '@/shared/components/option-row';
import { useLayout } from '@/shared/hooks/use-layout';
import { colors } from '@/shared/theme/tokens';
import { Button, TextButton } from '@/shared/ui/button';
import { Illustration } from '@/shared/ui/illustration';
import { RadioMark } from '@/shared/ui/marks';
import { RecommendedBadge } from '@/shared/ui/recommended-badge';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';

const PACKS = [
  { n: 10, each: '0,80 €', price: '7,99 €', recommended: true },
  { n: 25, each: '0,72 €', price: '17,99 €' },
  { n: 50, each: '0,66 €', price: '32,99 €' },
];

/** 30a · Gespräche aufgebraucht (conversation credit packs; RevenueCat later). */
export function TalkLimitScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [pack, setPack] = useState(10);
  const [recommendedRow, onRecommendedLayout] = useLayout();
  const chosen = PACKS.find((p) => p.n === pack) ?? PACKS[0];
  return (
    <Screen
      edgeToEdgeTop
      bottom={6}
      className="px-[22px]"
      footer={
        <View className="pt-[14px]">
          <Button height={60} size={17.5} haptic="success" onPress={() => router.back()}>
            <View className="flex-row items-center" style={{ columnGap: 10 }}>
              <Text className="font-semibold text-accent-100" style={{ fontSize: 17.5 }}>
                {t('talkLimit.cta', { n: chosen.n })}
              </Text>
              <Text
                className="font-semibold text-accent-100"
                style={{ fontSize: 17.5, opacity: 0.55 }}
              >
                ·
              </Text>
              <Text
                className="font-semibold text-accent-100"
                style={{ fontSize: 17.5, fontVariant: ['tabular-nums'] }}
              >
                {chosen.price}
              </Text>
            </View>
          </Button>
          <TextButton
            className="mt-[16px]"
            label={t('talkLimit.practice')}
            color="text-accent-800"
            size={15}
            onPress={() => router.back()}
          />
        </View>
      }
    >
      <GradientHeader
        left="close"
        title={t('talkLimit.title')}
        circle="translucent"
        className="-mx-[22px]"
      >
        <View className="mt-[4px] items-center justify-center" style={{ width: 230, height: 230 }}>
          <Svg width={230} height={230} viewBox="0 0 230 230" style={{ position: 'absolute' }}>
            <Circle
              cx="115"
              cy="115"
              r="107"
              fill="none"
              stroke="rgba(255,255,255,.8)"
              strokeWidth={10}
            />
          </Svg>
          <Illustration name="pip-boxing" size={146} />
          <View
            className="absolute rounded-pill bg-accent-800 px-[14px] py-[6px]"
            style={{ bottom: -2 }}
          >
            <Text
              className="font-semibold text-accent-100"
              style={{ fontSize: 14, fontVariant: ['tabular-nums'] }}
            >
              {t('talkLimit.count')}
            </Text>
          </View>
        </View>
      </GradientHeader>
      <Text
        className="mt-[20px] text-center font-semibold text-ink"
        style={{ fontSize: 29, lineHeight: 31.9, letterSpacing: -1.015 }}
      >
        {t('talkLimit.headline')}
      </Text>
      <Text className="mt-[10px] text-center text-muted" style={{ fontSize: 15 }}>
        {t('talkLimit.sub')}
      </Text>
      <View className="relative mt-[22px]" style={{ rowGap: 10 }}>
        {PACKS.map((p) => {
          const on = p.n === pack;
          return (
            <OptionRow
              key={p.n}
              n={p.n}
              label={t('talkLimit.talks')}
              sub={t('talkLimit.perTalk', { price: p.each })}
              tabularSub
              selected={on}
              onLayout={p.recommended ? onRecommendedLayout : undefined}
              onPress={() => setPack(p.n)}
            >
              <Text
                className="font-semibold text-ink"
                style={{ fontSize: 17, fontVariant: ['tabular-nums'] }}
              >
                {p.price}
              </Text>
              <RadioMark
                selected={on}
                size={26}
                ringColor={colors.ring2}
                ringWidth={1.6}
                bg={colors.accent[800]}
                checkStroke={2.1}
              />
            </OptionRow>
          );
        })}
        <Hint glyph="i" align="start" className="mt-[6px] px-[4px]" text={t('talkLimit.info')} />
        {recommendedRow ? (
          <RecommendedBadge style={{ right: 18, top: recommendedRow.y - 11 }} />
        ) : null}
      </View>
    </Screen>
  );
}
