import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { GradientHeader } from '@/shared/components/gradient-header';
import { colors } from '@/shared/theme/tokens';
import { Button, TextButton } from '@/shared/ui/button';
import { Illustration } from '@/shared/ui/illustration';
import { CheckIcon } from '@/shared/ui/icons';
import { useGoHome } from '@/shared/hooks/use-back';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';

/** 08b · Serie gestartet (nach der ersten Übung). */
export function StreakScreen() {
  const { t } = useTranslation();
  const DAYS = t('common.weekdayLetters', { returnObjects: true }) as string[];
  const router = useRouter();
  const goHome = useGoHome();
  return (
    <Screen edgeToEdgeTop bottom={6} className="px-[22px]">
      <GradientHeader left="close" className="-mx-[22px]" paddingBottom={34} onLeftPress={goHome}>
        <View className="mt-[8px] items-center justify-center" style={{ width: 212, height: 186 }}>
          <Svg
            pointerEvents="none"
            style={{ position: 'absolute', top: -10, left: -10 }}
            width={232}
            height={206}
          >
            <Defs>
              <RadialGradient id="halo" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor="#b5abfc" stopOpacity={0.42} />
                <Stop offset="0.48" stopColor="#b5abfc" stopOpacity={0.16} />
                <Stop offset="0.72" stopColor="#b5abfc" stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Rect width="232" height="206" rx="103" fill="url(#halo)" />
          </Svg>
          <Illustration name="pip-trophy-2" size={188} />
        </View>
        <Text
          className="mt-[22px] font-semibold text-accent-900"
          style={{ fontSize: 104, lineHeight: 87.4, letterSpacing: -5.2 }}
        >
          2
        </Text>
        <Text
          className="mt-[14px] font-medium text-accent-800"
          style={{ fontSize: 24, lineHeight: 26.4, letterSpacing: -0.48 }}
        >
          {t('streak.days')}
        </Text>
      </GradientHeader>
      <View className="mt-[26px] rounded-[26px] bg-surface px-[18px] pb-[22px] pt-[20px]">
        <View className="flex-row justify-between" style={{ columnGap: 6 }}>
          {DAYS.map((d, i) => (
            <Text
              key={i}
              className="w-[40px] text-center text-muted"
              style={{ fontSize: 12.5, letterSpacing: 0.75 }}
            >
              {d}
            </Text>
          ))}
        </View>
        <View className="mt-[10px] flex-row justify-between" style={{ columnGap: 6 }}>
          {DAYS.map((_, i) => (
            <View
              key={i}
              className="h-[40px] w-[40px] items-center justify-center rounded-full"
              style={
                i === 0
                  ? { backgroundColor: colors.accent[800] }
                  : { boxShadow: `inset 0 0 0 1.5px ${colors.accent[300]}` }
              }
            >
              {i === 0 ? (
                <CheckIcon size={18} color={colors.accent[100]} strokeWidth={2.6} />
              ) : (
                <Text className="text-muted" style={{ fontSize: 15 }}>
                  {i + 1}
                </Text>
              )}
            </View>
          ))}
        </View>
      </View>
      <Text
        className="mt-[18px] text-center"
        style={{ fontSize: 15.5, lineHeight: 22.5, color: '#3f4250' }}
      >
        {t('streak.note')}
      </Text>
      <View className="flex-1" style={{ minHeight: 16 }} />
      <Button height={58} label={t('common.next')} labelClassName="font-medium" onPress={goHome} />
      <TextButton
        className="mt-[14px]"
        label={t('streak.share')}
        color="text-sub"
        labelClassName="font-medium"
        onPress={() => router.push('/(app)/share-code')}
      />
    </Screen>
  );
}
