import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { GradientHeader } from '@/shared/components/gradient-header';
import { colors } from '@/shared/theme/tokens';
import { Button } from '@/shared/ui/button';
import { Illustration } from '@/shared/ui/illustration';
import { MicSmall } from '@/shared/ui/icons';
import { Kicker } from '@/shared/ui/kicker';
import { CheckCircle } from '@/shared/ui/marks';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';

/** 60c · Einstufung · Rollenspiel-Briefing "Im Café" before the placement call. */
export function AssessmentCallIntroScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const tasks = t('onboarding.placement.call.tasks', { returnObjects: true }) as string[];
  return (
    <Screen
      edgeToEdgeTop
      bottom={6}
      className="px-[22px]"
      footer={
        <Button
          height={60}
          size={17}
          label={t('onboarding.placement.call.cta')}
          left={<MicSmall size={18} />}
          onPress={() => router.push('/(onboarding)/assessment-call')}
        />
      }
    >
      <GradientHeader
        left="close"
        title={t('onboarding.placement.screenTitle')}
        className="-mx-[22px]"
        paddingBottom={18}
        onLeftPress={() => router.back()}
      >
        <Illustration name="pip-barista" size={150} style={{ marginTop: 10 }} />
      </GradientHeader>
      <Kicker tracking={0.1} className="mt-[22px] text-accent-700">
        {t('onboarding.placement.call.kicker')}
      </Kicker>
      <Text
        className="mt-[8px] font-semibold text-ink"
        style={{ fontSize: 30, lineHeight: 34, letterSpacing: -0.9 }}
      >
        {t('onboarding.placement.call.title')}
      </Text>
      <Text className="mt-[8px] text-muted" style={{ fontSize: 15, lineHeight: 22 }}>
        {t('onboarding.placement.call.sub')}
      </Text>
      <Kicker tracking={0.1} className="mt-[22px] text-muted">
        {t('onboarding.placement.call.tasksLabel')}
      </Kicker>
      <View className="mt-[12px]" style={{ rowGap: 14 }}>
        {tasks.map((task) => (
          <View key={task} className="flex-row items-start" style={{ columnGap: 12 }}>
            <CheckCircle size={26} bg={colors.accent[800]} stroke={2.4} iconSize={13} />
            <Text className="flex-1 text-ink" style={{ fontSize: 15.5, lineHeight: 22 }}>
              {task}
            </Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}
