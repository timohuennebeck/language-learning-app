import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { OptionRow } from '@/shared/components/option-row';
import { useLayout } from '@/shared/hooks/use-layout';
import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/theme/tokens';
import { CardGradient } from '@/shared/ui/gradient';
import { Illustration } from '@/shared/ui/illustration';
import { Kicker } from '@/shared/ui/kicker';
import { RadioMark } from '@/shared/ui/marks';
import { RecommendedBadge } from '@/shared/ui/recommended-badge';
import { Text } from '@/shared/ui/text';

const DAILY_GOAL_OPTIONS = [
  { min: 5, filled: 2 },
  { min: 10, filled: 4 },
  { min: 15, filled: 5 },
  { min: 30, filled: 7 },
] as const;

type DailyGoalMinutes = (typeof DAILY_GOAL_OPTIONS)[number]['min'];

interface OptionsProps {
  value: number;
  onChange: (min: DailyGoalMinutes) => void;
  className?: string;
}

/** The four "N Min a day" rows with weekly bars and a recommended badge on 15. */
export function DailyGoalOptions({ value, onChange, className }: OptionsProps) {
  const { t } = useTranslation();
  const [recommendedRow, onRecommendedLayout] = useLayout();
  return (
    <View className={cn('relative', className)} style={{ rowGap: 10 }}>
      {DAILY_GOAL_OPTIONS.map(({ min, filled }) => {
        const on = min === value;
        return (
          <OptionRow
            key={min}
            n={min}
            label={t('common.min')}
            sub={t('profile.dailySub', { ex: t(`profile.goalScreen.ex.${min}`) })}
            selected={on}
            onLayout={min === 15 ? onRecommendedLayout : undefined}
            onPress={() => onChange(min)}
          >
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
            <RadioMark
              selected={on}
              size={26}
              ringColor={colors.ring2}
              ringWidth={1.6}
              bg={colors.accent[800]}
              checkStroke={2.1}
              checkSize={13}
            />
          </OptionRow>
        );
      })}
      {recommendedRow ? (
        <RecommendedBadge style={{ right: 18, top: recommendedRow.y - 11 }} />
      ) : null}
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
