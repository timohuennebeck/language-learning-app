import {
  ClosedCaptioningIcon,
  MicrophoneIcon,
  MicrophoneSlashIcon,
  PhoneSlashIcon,
} from 'phosphor-react-native';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/theme/tokens';
import { Tap } from '@/shared/ui/tap';
import { Text } from '@/shared/ui/text';

interface Props {
  onMute?: () => void;
  onEnd?: () => void;
  onSubtitles?: () => void;
  /** Placement call uses the accent-700 hang-up; the live call uses red (#c9403f). */
  endColor?: string;
  endShadow?: string;
  sideSize?: number;
  endSize?: number;
  labelSize?: number;
  /** Microphone off: the button fills in and the glyph becomes the crossed-out mic. */
  muted?: boolean;
  /** Captions on: the button fills in. */
  subtitles?: boolean;
  className?: string;
}

/**
 * On state for the two side buttons. The filled accent circle is the same "selected" treatment
 * the chips use; the two lavenders this row had before (#e7e5fe vs #e4e7f5) are a point apart
 * and read as no change at all.
 */
const ON_BG = colors.accent[800];
const OFF_BG = colors.surface;
const ON_GLYPH = colors.accent[100];
const OFF_GLYPH = colors.accent[900];

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
  muted = false,
  subtitles = false,
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
          accessibilityRole="switch"
          accessibilityState={{ checked: muted }}
          accessibilityLabel={t('live.mute')}
          className="items-center justify-center rounded-full"
          style={{ width: sideSize, height: sideSize, backgroundColor: muted ? ON_BG : OFF_BG }}
        >
          {muted ? (
            <MicrophoneSlashIcon size={26} color={ON_GLYPH} weight="fill" />
          ) : (
            <MicrophoneIcon size={26} color={OFF_GLYPH} weight="fill" />
          )}
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
          <PhoneSlashIcon size={34} color={colors.accent[100]} weight="fill" />
        </Tap>
        {label(t('live.end'), true)}
      </View>
      <View className="items-center" style={{ rowGap: 8 }}>
        <Tap
          haptic="light"
          onPress={onSubtitles}
          accessibilityRole="switch"
          accessibilityState={{ checked: subtitles }}
          accessibilityLabel={t('live.subtitles')}
          className="items-center justify-center rounded-full"
          style={{ width: sideSize, height: sideSize, backgroundColor: subtitles ? ON_BG : OFF_BG }}
        >
          <ClosedCaptioningIcon size={26} color={subtitles ? ON_GLYPH : OFF_GLYPH} weight="fill" />
        </Tap>
        {label(t('live.subtitles'))}
      </View>
    </View>
  );
}
