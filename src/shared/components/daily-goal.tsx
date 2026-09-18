import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/theme/tokens';
import { CardGradient } from '@/shared/ui/gradient';
import { Illustration } from '@/shared/ui/illustration';
import { CheckIcon } from '@/shared/ui/icons';
import { Tap } from '@/shared/ui/tap';
import { Kicker } from '@/shared/ui/kicker';
import { RecommendedBadge } from '@/shared/ui/recommended-badge';
import { Text } from '@/shared/ui/text';

const DAILY_GOAL_OPTIONS = [
  { min: 5, filled: 2 },
  { min: 10, filled: 4 },
  { min: 15, filled: 5 },
  { min: 30, filled: 7 },
] as const;

type DailyGoalMinutes = (typeof DAILY_GOAL_OPTIONS)[number]['min'];

type OptionsProps = {
  value: number;
  onChange: (min: DailyGoalMinutes) => void;
  className?: string;
};

/** The four "N Min a day" rows with weekly bars and a recommended badge on 15. */
export function DailyGoalOptions({ value, onChange, className }: OptionsProps) {
  const { t } = useTranslation();
  return (
    <View className={cn(className)} style={{ rowGap: 10, zIndex: 1 }}>
      {DAILY_GOAL_OPTIONS.map(({ min, filled }) => {
        const on = min === value;
        return (
          <Tap
            key={min}
            haptic="selection"
            onPress={() => onChange(min)}
            className="relative flex-row items-center rounded-[20px] bg-white"
            style={{
              paddingVertical: 13,
              paddingHorizontal: 16,
              boxShadow: on
                ? `0 0 0 1.8px ${colors.accent[800]}`
                : `0 0 0 1px ${colors.neutral[200]}`,
              columnGap: 13,
              zIndex: min === 15 ? 2 : 1,
            }}
          >
            {min === 15 ? <RecommendedBadge style={{ right: 18, top: -11 }} /> : null}
            <View
              className="h-[46px] w-[46px] items-center justify-center rounded-full"
              style={{ backgroundColor: on ? colors.surface : colors.surface2 }}
            >
              <Text
                className="font-semibold text-accent-900"
                style={{ fontSize: 19, fontVariant: ['tabular-nums'] }}
              >
                {min}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-ink" style={{ fontSize: 16.5 }}>
                {t('common.min')}
              </Text>
              <Text className="mt-[3px] text-faint" style={{ fontSize: 13.5 }}>
                {t('profile.dailySub', { ex: t(`profile.goalScreen.ex.${min}`) })}
              </Text>
            </View>
            <View className="flex-row items-end" style={{ columnGap: 4 }}>
              {Array.from({ length: 7 }, (_, i) => (
                <View
                  key={i}
                  style={{
                    width: 7,
                    height: 14,
                    borderRadius: 3,
                    backgroundColor:
                      i < filled ? (on ? colors.accent[700] : colors.accent[600]) : '#ece9f9',
                  }}
                />
              ))}
            </View>
            <View
              className="h-[26px] w-[26px] items-center justify-center rounded-full"
              style={
                on
                  ? { backgroundColor: colors.accent[800] }
                  : { boxShadow: `inset 0 0 0 1.6px ${colors.ring2}` }
              }
            >
              {on ? <CheckIcon size={13} color="#fff" strokeWidth={2.1} /> : null}
            </View>
          </Tap>
        );
      })}
    </View>
  );
}

/** "Bei N Min am Tag → B1 in etwa X Monaten" gradient card with Pip and progress bar. */
export function EtaCard({ minutes, className }: { minutes: number; className?: string }) {
  const { t } = useTranslation();
  return (
    <CardGradient className={cn('relative px-[20px] py-[18px]', className)}>
      <View style={{ maxWidth: 196 }}>
        <Kicker>{t('profile.goalScreen.pace', { min: minutes })}</Kicker>
        <Text
          className="mt-[8px] font-semibold text-ink"
          style={{ fontSize: 23, lineHeight: 26.2, letterSpacing: -0.575 }}
        >
          {t(`profile.goalScreen.eta.${minutes}`)}
        </Text>
        <View
          className="mt-[14px] h-[8px] rounded-pill"
          style={{ backgroundColor: 'rgba(255,255,255,.7)' }}
        >
          <View className="h-full rounded-pill bg-accent-700" style={{ width: '62%' }} />
        </View>
        <View className="mt-[7px] flex-row justify-between">
          <Text className="text-muted" style={{ fontSize: 11.5 }}>
            {t('profile.goalScreen.a2today')}
          </Text>
          <Text className="text-muted" style={{ fontSize: 11.5 }}>
            {t('profile.goalScreen.b1')}
          </Text>
        </View>
      </View>
      <Illustration
        name="pip-clock-2"
        size={124}
        style={{ position: 'absolute', right: 2, bottom: 8 }}
      />
    </CardGradient>
  );
}
