import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { PlacementTop } from '@/features/onboarding/components/placement-top';
import { roundParam, usePlacement } from '@/features/onboarding/lib/placement-store';
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
  const params = useLocalSearchParams<{ round?: string; q?: string }>();
  const round = roundParam(params.round);
  const q = Math.max(0, Number(params.q) || 0);
  const text = p.textFor(round);
  const question = text.questions[Math.min(q, text.questions.length - 1)];

  const answer = (value: boolean) => {
    p.setAnswer(round, q, value);
    if (q + 1 < text.questions.length)
      router.push({
        pathname: '/(onboarding)/assessment-question',
        params: { round: String(round), q: String(q + 1) },
      });
    else
      router.push({
        pathname: '/(onboarding)/assessment-result',
        params: { round: String(round) },
      });
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
      <PlacementTop round={round} />
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
