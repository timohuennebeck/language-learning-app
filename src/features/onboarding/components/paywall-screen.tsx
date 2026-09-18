import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/theme/tokens';
import { Button } from '@/shared/ui/button';
import { Gradient, HEADER_GRADIENT } from '@/shared/ui/gradient';
import { Illustration } from '@/shared/ui/illustration';
import { CheckCircle, RadioMark } from '@/shared/ui/marks';
import { NavCircle } from '@/shared/ui/nav-circle';
import { Screen } from '@/shared/ui/screen';
import { Tap } from '@/shared/ui/tap';
import { Kicker } from '@/shared/ui/kicker';
import { RecommendedBadge } from '@/shared/ui/recommended-badge';
import { Text } from '@/shared/ui/text';

const PLANS = [
  { id: 'p10', talks: 10, approx: 'approx10', price: '9,99 €' },
  { id: 'p30', talks: 30, approx: 'approx30', price: '19,99 €', recommended: true },
] as const;

const TITLE = { fontSize: 29, lineHeight: 36, letterSpacing: -1.015 } as const;

/** 11f · Monatskontingent · zwei Tarife (RevenueCat offerings will feed the plans later). */
export function PaywallScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [plan, setPlan] = useState<string>('p30');
  const perks = t('onboarding.paywall.perks', { returnObjects: true }) as string[];
  const selected = PLANS.find((p) => p.id === plan) ?? PLANS[1];
  return (
    <Screen
      edgeToEdgeTop
      bottom={-8}
      footer={
        <View className="px-[20px] pt-[10px]">
          <Button
            height={58}
            size={18}
            label={t('onboarding.paywall.cta')}
            onPress={() => router.push('/(onboarding)/account')}
          />
          <Text
            className="mt-[10px] self-center text-center text-muted"
            style={{ fontSize: 13.5, lineHeight: 18.2, maxWidth: 250 }}
          >
            {t('onboarding.paywall.legal', { price: selected.price })}
          </Text>
          <View
            className="mt-[10px] flex-row items-center justify-center"
            style={{ columnGap: 10 }}
          >
            <Tap haptic="light" onPress={() => router.push('/(onboarding)/redeem-code')}>
              <Text className="font-semibold text-accent-800" style={{ fontSize: 15 }}>
                {t('onboarding.paywall.inviteCode')}
              </Text>
            </Tap>
            <View className="h-[4px] w-[4px] rounded-full bg-ring4" />
            <Tap haptic="light">
              <Text className="font-semibold text-accent-800" style={{ fontSize: 15 }}>
                {t('onboarding.paywall.restore')}
              </Text>
            </Tap>
          </View>
        </View>
      }
    >
      <Gradient
        {...HEADER_GRADIENT}
        className="relative items-center justify-end overflow-hidden"
        style={{ height: 194 }}
      >
        <NavCircle
          icon="close"
          color={colors.glyph}
          style={{
            position: 'absolute',
            top: insets.top,
            left: 20,
            backgroundColor: 'rgba(255,255,255,.7)',
          }}
          onPress={() => router.push('/(onboarding)/account')}
        />
        <Illustration name="pip-baguette" size={118} />
      </Gradient>
      <View className="px-[20px] pb-[8px] pt-[18px]">
        <View className="flex-row items-center" style={{ columnGap: 6 }}>
          <Text className="font-semibold text-accent-800" style={{ fontSize: 14 }}>
            {t('onboarding.paywall.brand')}
          </Text>
          <View className="rounded-pill bg-accent-800 px-[8px] py-[2px]">
            <Text
              className="font-semibold text-accent-100"
              style={{ fontSize: 12.5, letterSpacing: 0.125 }}
            >
              {t('onboarding.paywall.plus')}
            </Text>
          </View>
        </View>
        {/* Word-wrapping row so the highlighted word is a View with a real rounded background. */}
        <View className="mt-[6px] flex-row flex-wrap items-center">
          {t('onboarding.paywall.title1')
            .split(' ')
            .filter(Boolean)
            .map((w, i) => (
              <Text key={`a${i}`} className="font-semibold text-ink" style={TITLE}>
                {w}{' '}
              </Text>
            ))}
          <View className="rounded-[8px] bg-lilac3 px-[6px]" style={{ flexShrink: 0 }}>
            <Text className="font-semibold text-ink" style={TITLE}>
              {t('onboarding.paywall.titleMark')}
            </Text>
          </View>
          {t('onboarding.paywall.title2')
            .split(' ')
            .filter(Boolean)
            .map((w, i) => (
              <Text key={`b${i}`} className="font-semibold text-ink" style={TITLE}>
                {i === 0 ? ' ' : ''}
                {w}{' '}
              </Text>
            ))}
        </View>
        <Text className="mt-[8px] text-muted" style={{ fontSize: 15.5, lineHeight: 22 }}>
          {t('onboarding.paywall.sub')}
        </Text>
        <View className="mt-[22px] flex-row" style={{ columnGap: 10, zIndex: 1 }}>
          {PLANS.map((p) => {
            const on = p.id === plan;
            return (
              <Tap
                key={p.id}
                haptic="selection"
                onPress={() => setPlan(p.id)}
                className="relative flex-1 rounded-[22px] bg-white"
                style={{
                  paddingTop: 16,
                  paddingBottom: 15,
                  paddingHorizontal: 14,
                  boxShadow: on ? `0 0 0 2px ${colors.accent[700]}` : `0 0 0 1.5px ${colors.line2}`,
                  zIndex: 'recommended' in p && p.recommended ? 2 : 1,
                }}
              >
                {'recommended' in p && p.recommended ? (
                  <RecommendedBadge
                    style={{ left: 14, top: -18 }}
                    size={12.5}
                    paddingVertical={5}
                  />
                ) : null}
                <View className="flex-row items-center justify-between">
                  <Text
                    className={cn('font-semibold', on ? 'text-accent-900' : 'text-ink')}
                    style={{ fontSize: 32, lineHeight: 32, letterSpacing: -0.96 }}
                  >
                    {p.talks}
                  </Text>
                  <RadioMark
                    selected={on}
                    size={22}
                    ringColor={colors.ring3}
                    bg={colors.accent[700]}
                    checkStroke={2.6}
                  />
                </View>
                <Text className="mt-[6px] font-semibold text-ink" style={{ fontSize: 14.5 }}>
                  {t('onboarding.paywall.talks')}
                </Text>
                <Text className="mt-[4px] text-muted" style={{ fontSize: 13.5, lineHeight: 17.5 }}>
                  {t(`onboarding.paywall.${p.approx}`)}
                </Text>
                <Text
                  className="mt-[12px] font-semibold text-ink"
                  style={{ fontSize: 21, letterSpacing: -0.42 }}
                >
                  {p.price}
                </Text>
                <Text className="text-muted" style={{ fontSize: 13 }}>
                  {t('onboarding.paywall.perMonth')}
                </Text>
              </Tap>
            );
          })}
        </View>
        <View className="mt-[18px] pb-[15px] pt-[16px]" style={{ rowGap: 9 }}>
          <Kicker tracking={0.1}>{t('onboarding.paywall.alwaysUnlimited')}</Kicker>
          {perks.map((p) => (
            <View key={p} className="flex-row items-center" style={{ columnGap: 11 }}>
              <CheckCircle size={22} bg={colors.accent[700]} stroke={2.6} iconSize={12} />
              <Text className="text-ink" style={{ fontSize: 15.5, lineHeight: 20 }}>
                {p}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Screen>
  );
}
