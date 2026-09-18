import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/features/auth/hooks/use-session';
import {
  ONBOARDING_STEPS,
  PLACEMENT_STEPS,
} from '@/features/onboarding/components/onboarding-frame';
import { roundParam, usePlacement } from '@/features/onboarding/lib/placement-store';
import { Button } from '@/shared/ui/button';
import { Illustration } from '@/shared/ui/illustration';
import { Kicker } from '@/shared/ui/kicker';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';
import { ProgressTopBar } from '@/shared/ui/top-bar';

/** 60d · Einstufung · result of one reading round. */
export function AssessmentResultScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { update } = useSession();
  const p = usePlacement();
  const params = useLocalSearchParams<{ round?: string; demo?: string }>();
  const round = roundParam(params.round);
  const step = round === 1 ? PLACEMENT_STEPS.result1 : PLACEMENT_STEPS.result2;
  const played = p.answersFor(round).length > 0;
  // Design sample when the screen is opened directly (dev index) without a played round.
  const result = played
    ? p.statsFor(round)
    : { knownPct: 96, cards: ['a', 'b', 'c'], correct: 2, total: 3 };

  const onNext = () => {
    if (round === 1) {
      router.push({ pathname: '/(onboarding)/assessment-reading', params: { round: '2' } });
    } else {
      update({ readingLevel: p.readingLevel });
      router.push('/(onboarding)/assessment-call-intro');
    }
  };

  return (
    <Screen
      top={0}
      bottom={6}
      className="px-[22px]"
      footer={<Button height={58} size={17} label={t('common.next')} onPress={onNext} />}
    >
      <ProgressTopBar
        progress={step / ONBOARDING_STEPS}
        label={t('common.stepOf', { step, total: ONBOARDING_STEPS })}
        onBack={() => router.dismissTo('/(onboarding)/assessment-intro')}
      />
      <View
        className="relative mt-[14px] overflow-hidden rounded-[26px] bg-surface px-[20px] py-[18px]"
        style={{ minHeight: 172 }}
      >
        <Kicker size={11} tracking={0.1}>
          {t('onboarding.placement.textOf', { n: round })}
        </Kicker>
        <Text
          className="mt-[6px] font-semibold text-accent-800"
          style={{ fontSize: 52, lineHeight: 56, letterSpacing: -2.08 }}
        >
          {result.knownPct} %
        </Text>
        <Text
          className="font-semibold text-ink"
          style={{ fontSize: 16, lineHeight: 21, maxWidth: 150 }}
        >
          {t('onboarding.placement.known')}
        </Text>
        <Illustration
          name="pip-cheer-4"
          size={120}
          style={{ position: 'absolute', right: 10, top: 22 }}
        />
      </View>
      <View className="mt-[12px] flex-row" style={{ columnGap: 12 }}>
        {[
          { n: String(result.cards.length), label: t('onboarding.placement.cardsMade') },
          {
            n: `${result.correct} / ${result.total}`,
            label: t('onboarding.placement.questionsRight'),
          },
        ].map((tile) => (
          <View key={tile.label} className="flex-1 rounded-[22px] bg-surface2 px-[16px] py-[16px]">
            <Text
              className="font-semibold text-ink"
              style={{ fontSize: 26, lineHeight: 30, letterSpacing: -0.52 }}
            >
              {tile.n}
            </Text>
            <Text className="mt-[6px] text-muted" style={{ fontSize: 13.5 }}>
              {tile.label}
            </Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}
