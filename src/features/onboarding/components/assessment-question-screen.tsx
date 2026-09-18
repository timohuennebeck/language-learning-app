import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { PlacementTop } from '@/features/onboarding/components/placement-top';
import { usePlacement } from '@/features/onboarding/lib/placement-store';
import { colors } from '@/shared/theme/tokens';
import { Button } from '@/shared/ui/button';
import { CheckIcon, CloseIcon } from '@/shared/ui/icons';
import { Kicker } from '@/shared/ui/kicker';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';

/** 60b · Einstufung · one yes/no question per screen; the next question is pushed on top. */
export function AssessmentQuestionScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const p = usePlacement();
  const question = p.text.questions[p.qIndex];

  const answer = (value: boolean) => {
    if (p.answer(value) === 'question') router.push('/(onboarding)/assessment-question');
    else router.push('/(onboarding)/assessment-result');
  };

  return (
    <Screen
      top={0}
      bottom={6}
      className="px-[22px]"
      footer={
        <View className="flex-row" style={{ columnGap: 12 }}>
          <Button
            className="flex-1"
            variant="surface"
            height={58}
            size={16.5}
            haptic="light"
            left={<CheckIcon size={15} color={colors.accent[800]} strokeWidth={2.6} />}
            label={t('common.yes')}
            labelClassName="font-semibold text-accent-800"
            onPress={() => answer(true)}
          />
          <Button
            className="flex-1"
            height={58}
            size={16.5}
            left={<CloseIcon size={15} color={colors.accent[100]} strokeWidth={2.6} />}
            label={t('common.no')}
            onPress={() => answer(false)}
          />
        </View>
      }
    >
      <PlacementTop round={p.round} />
      <View className="flex-1 justify-center" style={{ paddingBottom: 40 }}>
        <Kicker tracking={0.1} className="text-accent-700">
          {t('onboarding.placement.questionKicker')}
        </Kicker>
        <Text
          className="mt-[10px] font-semibold text-ink"
          style={{ fontSize: 26, lineHeight: 31, letterSpacing: -0.52 }}
        >
          {question.prompt}
        </Text>
      </View>
    </Screen>
  );
}
