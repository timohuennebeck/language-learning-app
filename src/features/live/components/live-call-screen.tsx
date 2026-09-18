import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';

import { CallControls } from '@/shared/components/call-controls';
import { Waveform } from '@/shared/components/waveform';
import { colors } from '@/shared/theme/tokens';
import { Illustration } from '@/shared/ui/illustration';
import { ChevronDown, InfoCircle } from '@/shared/ui/icons';
import { NavCircle } from '@/shared/ui/nav-circle';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';

/** Soft radial glow behind the call (design: radial-gradient 125% 85% at 50% 8%). */
function CallBackdrop() {
  return (
    <Svg
      pointerEvents="none"
      style={{ position: 'absolute', inset: 0 }}
      width="100%"
      height="100%"
      preserveAspectRatio="none"
    >
      <Defs>
        <RadialGradient
          id="glow"
          cx="50%"
          cy="8%"
          rx="125%"
          ry="85%"
          fx="50%"
          fy="8%"
          gradientUnits="objectBoundingBox"
        >
          <Stop offset="0" stopColor="#efedfd" />
          <Stop offset="0.55" stopColor="#f3f5fe" />
          <Stop offset="1" stopColor="#e9ebf9" />
        </RadialGradient>
      </Defs>
      <Ellipse cx="50%" cy="8%" rx="125%" ry="85%" fill="url(#glow)" />
    </Svg>
  );
}

type Props = {
  /** Where "Beenden" goes. Defaults to the in-app review; onboarding passes the evaluation step. */
  onEnd?: () => void;
};

/** 02c · Live-Gespräch · Vollbild-Call (also used as the placement call in onboarding). */
export function LiveCallScreen({ onEnd }: Props) {
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
        <NavCircle icon={<ChevronDown size={18} strokeWidth={2.2} />} size={40} />
        <View
          className="flex-row items-center rounded-pill bg-surface px-[14px] py-[8px]"
          style={{ columnGap: 8 }}
        >
          <View className="h-[7px] w-[7px] rounded-full bg-accent-600" />
          <Text className="text-accent-900" style={{ fontSize: 14, fontVariant: ['tabular-nums'] }}>
            {t('live.timer')}
          </Text>
        </View>
        <NavCircle icon={<InfoCircle size={18} />} size={40} autoBack={false} />
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
        onEnd={onEnd ?? (() => router.replace('/(app)/review'))}
      />
    </Screen>
  );
}
