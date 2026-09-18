import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors } from '@/shared/theme/tokens';
import { Illustration } from '@/shared/ui/illustration';
import { Kicker } from '@/shared/ui/kicker';
import { Text } from '@/shared/ui/text';

type Props = {
  streakDays: number;
  minutesToday: number;
  goalMinutes: number;
  /** Mon..Sun: 0 = missed, 1 = done, 2 = today (pending). */
  week: number[];
  className?: string;
};

/** "Serie" card with the weekly day circles and waving Pip. */
export function StreakCard({ streakDays, minutesToday, goalMinutes, week, className }: Props) {
  const { t } = useTranslation();
  const days = t('common.weekdayLetters', { returnObjects: true }) as string[];
  return (
    <View
      className={`relative overflow-hidden rounded-[28px] bg-surface px-[22px] py-[20px] ${className ?? ''}`}
    >
      <Kicker>{t('profile.streak')}</Kicker>
      <Text
        className="mt-[8px] font-medium text-accent-900"
        style={{ fontSize: 34, lineHeight: 34, letterSpacing: -1.02 }}
      >
        {t('profile.streakDays', { n: streakDays })}
      </Text>
      <Text className="mt-[6px] text-sub" style={{ fontSize: 15, maxWidth: 190 }}>
        {t('profile.todayProgress', { done: minutesToday, goal: goalMinutes })}
      </Text>
      <Illustration
        name="pip-wave"
        size={96}
        style={{ position: 'absolute', right: 10, top: 14 }}
      />
      <View className="mt-[18px] flex-row" style={{ columnGap: 8 }}>
        {week.map((st, i) => (
          <View key={i} className="items-center" style={{ rowGap: 6 }}>
            <View
              className="h-[30px] w-[30px] items-center justify-center rounded-full"
              style={{
                backgroundColor:
                  st === 1 ? colors.accent[800] : st === 2 ? colors.surface2 : 'transparent',
                borderWidth: 1.5,
                borderColor: st === 2 ? colors.accent[600] : '#d2cef5',
              }}
            >
              <Text style={{ fontSize: 13, color: st === 1 ? colors.accent[100] : colors.muted }}>
                {st === 1 ? '✓' : st === 2 ? '·' : ''}
              </Text>
            </View>
            <Text className="text-muted" style={{ fontSize: 11.5 }}>
              {days[i]}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
