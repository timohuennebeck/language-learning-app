import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/theme/tokens';
import { MicSlash, PhoneEnd, Subtitles } from '@/shared/ui/icons';
import { Tap } from '@/shared/ui/tap';
import { Text } from '@/shared/ui/text';

type Props = {
  onMute?: () => void;
  onEnd?: () => void;
  onSubtitles?: () => void;
  /** Placement call uses the accent-700 hang-up; the live call uses red (#c9403f). */
  endColor?: string;
  endShadow?: string;
  sideSize?: number;
  endSize?: number;
  labelSize?: number;
  subtitlesBg?: string;
  className?: string;
};

/** Mute / End / Subtitles control row shared by the live and placement calls. */
export function CallControls({
  onMute,
  onEnd,
  onSubtitles,
  endColor = colors.accent[700],
  endShadow = '0 10px 26px rgba(108,99,196,.3)',
  sideSize = 68,
  endSize = 88,
  labelSize = 14,
  subtitlesBg = colors.surface,
  className,
}: Props) {
  const { t } = useTranslation();
  const label = (s: string, bold?: boolean) => (
    <Text className={cn('text-sub', bold && 'font-medium')} style={{ fontSize: labelSize }}>
      {s}
    </Text>
  );
  return (
    <View className={cn('flex-row items-start justify-between', className)}>
      <View className="items-center" style={{ rowGap: 8 }}>
        <Tap
          haptic="light"
          onPress={onMute}
          accessibilityLabel={t('live.mute')}
          className="items-center justify-center rounded-full bg-surface"
          style={{ width: sideSize, height: sideSize }}
        >
          <MicSlash size={26} />
        </Tap>
        {label(t('live.mute'))}
      </View>
      <View className="items-center" style={{ rowGap: 8, marginTop: -10 }}>
        <Tap
          haptic="heavy"
          onPress={onEnd}
          accessibilityLabel={t('live.end')}
          className="items-center justify-center rounded-full"
          style={{
            width: endSize,
            height: endSize,
            backgroundColor: endColor,
            boxShadow: endShadow,
          }}
        >
          <PhoneEnd size={34} color={colors.accent[100]} />
        </Tap>
        {label(t('live.end'), true)}
      </View>
      <View className="items-center" style={{ rowGap: 8 }}>
        <Tap
          haptic="light"
          onPress={onSubtitles}
          accessibilityLabel={t('live.subtitles')}
          className="items-center justify-center rounded-full"
          style={{ width: sideSize, height: sideSize, backgroundColor: subtitlesBg }}
        >
          <Subtitles size={26} />
        </Tap>
        {label(t('live.subtitles'))}
      </View>
    </View>
  );
}
