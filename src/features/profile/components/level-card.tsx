import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { LEVELS, type Level } from '@/features/auth/data/schemas';
import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/theme/tokens';
import { Kicker } from '@/shared/ui/kicker';
import { ProgressBar } from '@/shared/ui/progress-bar';
import { Text } from '@/shared/ui/text';

type Props = {
  level: Level;
  /** Progress inside the current level, 0..1. */
  progress: number;
  className?: string;
};

/** "Niveau" card: one bar per CEFR level, filled up to the current one. */
export function LevelCard({ level, progress, className }: Props) {
  const { t } = useTranslation();
  const idx = Math.max(0, LEVELS.indexOf(level));
  return (
    <View className={cn('rounded-[28px] bg-surface2 px-[22px] py-[20px]', className)}>
      <View className="flex-row items-baseline justify-between">
        <Kicker>{t('profile.level')}</Kicker>
        <Text className="text-muted" style={{ fontSize: 13 }}>
          {t('profile.toB1')}
        </Text>
      </View>
      <View className="mt-[12px] flex-row" style={{ columnGap: 6 }}>
        {LEVELS.map((label, i) => {
          const f = i < idx ? 1 : i === idx ? progress : 0;
          return (
            <View key={label} className="flex-1" style={{ rowGap: 6 }}>
              <ProgressBar
                progress={f}
                height={8}
                trackColor={colors.track4}
                fillColor={colors.accent[800]}
              />
              <Text
                className={cn(f > 0 && f < 1 && 'font-medium')}
                style={{ fontSize: 13, color: f > 0 ? colors.accent[900] : colors.faint }}
              >
                {label}
              </Text>
            </View>
          );
        })}
      </View>
      <Text className="mt-[14px] text-sub" style={{ fontSize: 14.5, lineHeight: 19.6 }}>
        {t('profile.nextAssessment')}
      </Text>
    </View>
  );
}
