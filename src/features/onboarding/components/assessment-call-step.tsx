import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { CallControls } from '@/shared/components/call-controls';
import { MiniWaveform, Waveform } from '@/shared/components/waveform';
import { colors } from '@/shared/theme/tokens';
import { Caret } from '@/shared/ui/caret';
import { Illustration } from '@/shared/ui/illustration';
import { NavCircle } from '@/shared/ui/nav-circle';
import { Screen } from '@/shared/ui/screen';
import { Kicker } from '@/shared/ui/kicker';
import { Text } from '@/shared/ui/text';

/** 07 · Einstufung · Konversation läuft. */
export function AssessmentCallStep() {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <Screen top={0} bottom={6} className="px-[22px]">
      <View className="h-[40px] flex-row items-center justify-between">
        <NavCircle icon="close" />
        <Text className="font-medium" style={{ fontSize: 15 }}>
          {t('onboarding.assessmentCall.title')}
        </Text>
        <View className="rounded-pill bg-surface px-[14px] py-[8px]">
          <Text className="text-accent-900" style={{ fontSize: 14, fontVariant: ['tabular-nums'] }}>
            2:00
          </Text>
        </View>
      </View>
      <Text
        className="mb-[2px] mt-[22px] text-accent-900"
        style={{ fontSize: 40, lineHeight: 40, letterSpacing: -1.2 }}
      >
        {t('onboarding.assessmentCall.question')}
      </Text>
      <Text className="text-sub" style={{ fontSize: 18 }}>
        {t('onboarding.assessmentCall.sub')}
      </Text>
      <View
        className="relative mt-[22px] overflow-hidden rounded-[26px] bg-surface px-[22px] py-[20px]"
        style={{ height: 320 }}
      >
        <View className="flex-row items-center" style={{ columnGap: 10 }}>
          <MiniWaveform />
          <Kicker tracking={0.14}>{t('onboarding.assessmentCall.partner')}</Kicker>
          <View
            className="flex-row items-center rounded-pill bg-bg px-[8px] py-[3px]"
            style={{ columnGap: 5 }}
          >
            <View className="h-[6px] w-[6px] rounded-full bg-accent-700" />
            <Kicker tracking={0.06}>{t('onboarding.assessmentCall.live')}</Kicker>
          </View>
        </View>
        <Text
          className="mt-[26px] font-medium text-accent-900"
          style={{ fontSize: 36, lineHeight: 41.4, letterSpacing: -0.72, maxWidth: 210 }}
        >
          {t('onboarding.assessmentCall.prompt')}
        </Text>
        <Text className="mt-[10px] text-muted" style={{ fontSize: 14, maxWidth: 170 }}>
          {t('onboarding.assessmentCall.captions')}
        </Text>
        <Illustration
          name="pip-mic"
          size={150}
          style={{ position: 'absolute', right: 6, bottom: 10 }}
        />
        <View className="absolute bottom-[22px] left-[22px] h-[40px] justify-center">
          <Waveform />
        </View>
      </View>
      <Kicker tracking={0.14} className="mt-[26px] text-muted">
        {t('onboarding.assessmentCall.you')}
      </Kicker>
      <View className="mt-[6px] flex-row items-center">
        <Text className="text-text" style={{ fontSize: 22, lineHeight: 27.5 }}>
          {t('onboarding.assessmentCall.answer')}
        </Text>
        <Caret height={20} color={colors.accent[600]} style={{ marginLeft: 3 }} />
      </View>
      <View className="flex-1" />
      <View className="flex-row items-center justify-center" style={{ columnGap: 8 }}>
        <View className="h-[8px] w-[8px] rounded-full bg-accent-600" />
        <Text className="text-sub" style={{ fontSize: 14 }}>
          {t('onboarding.assessmentCall.liveLabel')}
        </Text>
      </View>
      <CallControls
        className="px-[20px] pt-[18px]"
        onEnd={() => router.push('/(onboarding)/assessment-evaluating')}
      />
    </Screen>
  );
}
