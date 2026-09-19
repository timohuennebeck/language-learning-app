import { useRouter } from 'expo-router';
import { useWindowDimensions, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Defs, Ellipse, RadialGradient, Rect, Stop } from 'react-native-svg';

import { CallTimer } from '@/features/live/components/call-timer';
import { CallControls } from '@/shared/components/call-controls';
import { Waveform } from '@/shared/components/waveform';
import { colors } from '@/shared/theme/tokens';
import { Illustration } from '@/shared/ui/illustration';
import { ChevronDown, InfoCircle } from '@/shared/ui/icons';
import { NavCircle } from '@/shared/ui/nav-circle';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';

/**
 * Soft radial glow behind the call (design: radial-gradient 125% 85% at 50% 8%).
 * Drawn with absolute numbers: percentage geometry resolves differently on native SVG and left
 * an unpainted strip at the right edge.
 */
function CallBackdrop() {
  const { width, height } = useWindowDimensions();
  const cx = width / 2;
  const cy = height * 0.08;
  const rx = width * 1.25;
  const ry = height * 0.85;
  return (
    <Svg
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, left: 0 }}
      width={width}
      height={height}
    >
      <Defs>
        <RadialGradient
          id="glow"
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          fx={cx}
          fy={cy}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#efedfd" />
          <Stop offset="0.55" stopColor="#f3f5fe" />
          <Stop offset="1" stopColor="#e9ebf9" />
        </RadialGradient>
      </Defs>
      <Rect x={0} y={0} width={width} height={height} fill="#e9ebf9" />
      <Ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="url(#glow)" />
    </Svg>
  );
}

type Props = {
  /** Where "Beenden" goes. Defaults to the done page; onboarding passes the evaluation step. */
  onEnd?: () => void;
  /** Placement call: no way back, but the header keeps its layout. */
  hideBack?: boolean;
};

/** 02c · Live-Gespräch · Vollbild-Call (also used as the placement call in onboarding). */
export function LiveCallScreen({ onEnd, hideBack = false }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <Screen
      top={-2}
      bottom={8}
      className="relative px-[22px]"
      style={{ backgroundColor: '#e9ebf9' }}
    >
      <CallBackdrop />
      <View className="h-[40px] flex-row items-center justify-between">
        {hideBack ? (
          <View style={{ width: 40, height: 40 }} />
        ) : (
          <NavCircle icon={<ChevronDown size={18} strokeWidth={2.2} />} size={40} />
        )}
        <CallTimer label={t('live.timer')} />
        <NavCircle
          icon={<InfoCircle size={18} />}
          size={40}
          accessibilityLabel={t('live.tasks.cta')}
          onPress={() => router.push('/(app)/live/tasks')}
        />
      </View>
      <View className="flex-1 items-center justify-center" style={{ minHeight: 0 }}>
        <View className="items-center justify-center" style={{ width: 300, height: 300 }}>
          <Illustration name="pip-mic" size={172} />
        </View>
        <Text
          className="mt-[14px] font-medium text-accent-900"
          style={{ fontSize: 30, lineHeight: 33, letterSpacing: -0.75 }}
        >
          {t('live.name')}
        </Text>
        <Text className="mt-[6px] text-muted" style={{ fontSize: 15 }}>
          {t('live.sub')}
        </Text>
        <View className="mt-[18px] h-[52px] justify-center">
          <Waveform />
        </View>
      </View>
      <View className="mb-[18px] items-center" style={{ rowGap: 12 }}>
        <Text
          className="text-center font-medium text-accent-900"
          style={{ fontSize: 26, lineHeight: 32.5, letterSpacing: -0.52 }}
        >
          {t('live.prompt')}
        </Text>
      </View>
      <CallControls
        className="mt-[22px] px-[8px]"
        sideSize={66}
        endSize={86}
        labelSize={13.5}
        endColor={colors.danger}
        endShadow="0 10px 24px rgba(201,64,63,.32)"
        subtitlesBg={colors.neutral[200]}
        onEnd={onEnd ?? (() => router.replace('/(app)/live/done'))}
      />
    </Screen>
  );
}
