import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { RowPreview } from '@/features/lessons/components/stations/StationPreviews';
import type { StationKind } from '@/features/lessons/data/schemas';
import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/theme/tokens';
import { Illustration } from '@/shared/ui/Illustration';
import { CheckIcon } from '@/shared/ui/icons';
import { Tap } from '@/shared/ui/Tap';
import { Text } from '@/shared/ui/Text';

type Props = { kind: StationKind; index: number; done: boolean; onPress: () => void };

/** A collapsed station row (done or pending). Tapping it expands the station. */
export function StationRow({ kind, index, done, onPress }: Props) {
  const { t } = useTranslation();
  const base = `chapter.${kind}`;
  return (
    <Tap
      haptic="light"
      onPress={onPress}
      className="relative flex-row items-center overflow-hidden rounded-[22px] bg-surface2 px-[16px] py-[12px]"
      style={{ columnGap: 14 }}
    >
      {kind === 'live' ? (
        <Illustration
          name="pip-mic"
          size={74}
          style={{ position: 'absolute', right: 20, bottom: -14, opacity: 0.9 }}
        />
      ) : null}
      <View
        className={cn(
          'h-[34px] w-[34px] items-center justify-center rounded-full',
          done ? 'bg-lavender3' : 'bg-surface2',
        )}
        style={done ? undefined : { boxShadow: `inset 0 0 0 1.5px ${colors.line2}` }}
      >
        {done ? (
          <CheckIcon size={14} color={colors.accent[900]} strokeWidth={2.4} />
        ) : (
          <Text className="font-semibold text-dim2" style={{ fontSize: 14 }}>
            {index + 1}
          </Text>
        )}
      </View>
      <View className="flex-1" style={{ minWidth: 0 }}>
        <Text className="font-medium text-accent-900" style={{ fontSize: 16.5 }}>
          {t(`${base}.row`)}
        </Text>
        <Text className="text-muted" style={{ fontSize: 13 }}>
          {kind === 'live'
            ? t(`${base}.rowSub`)
            : `${t(`${base}.rowSub`)} · ${done ? t('chapter.done') : t('chapter.after')}`}
        </Text>
      </View>
      <RowPreview kind={kind} />
    </Tap>
  );
}
