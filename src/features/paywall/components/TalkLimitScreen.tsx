import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Circle } from 'react-native-svg';

import { Hint } from '@/shared/components/Hint';
import { GradientHeader } from '@/shared/components/GradientHeader';
import { colors } from '@/shared/theme/tokens';
import { Button, TextButton } from '@/shared/ui/Button';
import { Illustration } from '@/shared/ui/Illustration';
import { RadioMark } from '@/shared/ui/Marks';
import { Screen } from '@/shared/ui/Screen';
import { Tap } from '@/shared/ui/Tap';
import { RecommendedBadge } from '@/shared/ui/RecommendedBadge';
import { Text } from '@/shared/ui/Text';

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
  const chosen = PACKS.find((p) => p.n === pack) ?? PACKS[0];
  return (
    <Screen edgeToEdgeTop bottom={6} scroll>
      <View className="flex-1 px-[22px]">
        <GradientHeader
          left="close"
          title={t('talkLimit.title')}
          circle="translucent"
          className="-mx-[22px]"
        >
          <View
            className="mt-[4px] items-center justify-center"
            style={{ width: 230, height: 230 }}
          >
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
        <View className="mt-[22px]" style={{ rowGap: 10 }}>
          {PACKS.map((p) => {
            const on = p.n === pack;
            return (
              <Tap
                key={p.n}
                haptic="selection"
                onPress={() => setPack(p.n)}
                className="relative flex-row items-center rounded-[20px] bg-white px-[16px] py-[13px]"
                style={{
                  columnGap: 13,
                  boxShadow: on ? `0 0 0 1.8px ${colors.accent[800]}` : '0 0 0 1px #e4e7f5',
                }}
              >
                {p.recommended ? <RecommendedBadge style={{ right: 18, top: -11 }} /> : null}
                <View
                  className="h-[46px] w-[46px] items-center justify-center rounded-full"
                  style={{ backgroundColor: on ? colors.surface : colors.surface2 }}
                >
                  <Text
                    className="font-semibold text-accent-900"
                    style={{ fontSize: 19, fontVariant: ['tabular-nums'] }}
                  >
                    {p.n}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-ink" style={{ fontSize: 16.5 }}>
                    {t('talkLimit.talks')}
                  </Text>
                  <Text
                    className="mt-[3px] text-faint"
                    style={{ fontSize: 13.5, fontVariant: ['tabular-nums'] }}
                  >
                    {t('talkLimit.perTalk', { price: p.each })}
                  </Text>
                </View>
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
              </Tap>
            );
          })}
          <Hint glyph="i" align="start" className="mt-[6px] px-[4px]" text={t('talkLimit.info')} />
        </View>
        <View className="flex-1" style={{ minHeight: 14 }} />
        <Button
          height={60}
          size={17.5}
          className="mt-[16px]"
          haptic="success"
          onPress={() => router.back()}
        >
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
    </Screen>
  );
}
