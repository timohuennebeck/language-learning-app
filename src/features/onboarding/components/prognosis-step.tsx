import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { LEVELS, type Level } from '@/features/auth/data/schemas';
import { useSession } from '@/features/auth/hooks/use-session';
import {
  ONBOARDING_STEPS,
  PLACEMENT_STEPS,
} from '@/features/onboarding/components/onboarding-frame';
import { Button, TextButton } from '@/shared/ui/button';
import { Illustration, type IllustrationName } from '@/shared/ui/illustration';
import { ArrowRight } from '@/shared/ui/icons';
import { Kicker } from '@/shared/ui/kicker';
import { ProgressBar } from '@/shared/ui/progress-bar';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';
import { ProgressTopBar } from '@/shared/ui/top-bar';
import { colors } from '@/shared/theme/tokens';

/** Rough minutes of practice per level step; speaking moves faster than reading. */
const EFFORT = { speaking: 120, reading: 165 } as const;
const HORIZON_MONTHS = 6;

function nextLevel(level: Level): Level {
  return LEVELS[Math.min(LEVELS.indexOf(level) + 1, LEVELS.length - 1)];
}

function monthsFor(skill: keyof typeof EFFORT, minutesPerDay: number) {
  return Math.max(1, Math.round(EFFORT[skill] / minutesPerDay));
}

/** 62k · Prognose (step after the daily goal): months to the next level per skill. */
export function PrognosisStep() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { session } = useSession();
  const minutes = session.dailyGoalMinutes;
  const target = new Date();
  target.setMonth(target.getMonth() + HORIZON_MONTHS);
  const targetLabel = target.toLocaleDateString(i18n.language, { month: 'short', year: 'numeric' });

  const rows: {
    skill: keyof typeof EFFORT;
    from: Level;
    art: IllustrationName;
  }[] = [
    { skill: 'speaking', from: session.level, art: 'pip-clock' },
    { skill: 'reading', from: session.readingLevel ?? 'B1', art: 'pip-magnifier' },
  ];

  return (
    <Screen
      bottom={0}
      className="px-[22px]"
      footer={
        <>
          <Button
            height={60}
            size={17.5}
            label={t('onboarding.prognosis.cta')}
            onPress={() => router.push('/(onboarding)/paywall')}
          />
          <TextButton
            className="mt-[16px]"
            label={t('onboarding.prognosis.change')}
            onPress={() => router.back()}
          />
        </>
      }
    >
      <ProgressTopBar
        progress={PLACEMENT_STEPS.prognosis / ONBOARDING_STEPS}
        label={t('common.stepOf', { step: PLACEMENT_STEPS.prognosis, total: ONBOARDING_STEPS })}
      />
      <Kicker tracking={0.1} className="mt-[26px] text-accent-700">
        {t('onboarding.prognosis.kicker', { n: HORIZON_MONTHS })}
      </Kicker>
      <Text
        className="mt-[8px] font-semibold text-ink"
        style={{ fontSize: 31, lineHeight: 35, letterSpacing: -1.085 }}
      >
        {t('onboarding.prognosis.title', { min: minutes })}
      </Text>
      <View className="mt-[18px]" style={{ rowGap: 12 }}>
        {rows.map((r) => {
          const months = monthsFor(r.skill, minutes);
          return (
            <View
              key={r.skill}
              className="relative overflow-hidden rounded-[26px] bg-surface px-[20px] py-[20px]"
              style={{ paddingRight: 120 }}
            >
              <Kicker tracking={0.1} className="text-muted">
                {t(`onboarding.prognosis.${r.skill}`)}
              </Kicker>
              <View className="mt-[12px] flex-row items-center" style={{ columnGap: 8 }}>
                <Text className="text-muted line-through" style={{ fontSize: 15 }}>
                  {r.from}
                </Text>
                <ArrowRight size={14} color={colors.muted} />
                <View className="rounded-pill bg-accent-800 px-[12px] py-[5px]">
                  <Text className="font-semibold text-accent-100" style={{ fontSize: 13 }}>
                    {nextLevel(r.from)}
                  </Text>
                </View>
              </View>
              <Text
                className="mt-[10px] font-semibold text-ink"
                style={{ fontSize: 24, lineHeight: 28, letterSpacing: -0.6 }}
              >
                {t('onboarding.prognosis.inMonths', { n: months })}
              </Text>
              <ProgressBar
                className="mt-[12px]"
                height={8}
                progress={HORIZON_MONTHS / (months + HORIZON_MONTHS)}
                trackColor="#fff"
                fillColor={colors.accent[700]}
              />
              <View className="mt-[8px] flex-row justify-between">
                <Text className="text-muted" style={{ fontSize: 13.5 }}>
                  {t('onboarding.prognosis.today')}
                </Text>
                <Text className="text-muted" style={{ fontSize: 13.5 }}>
                  {targetLabel}
                </Text>
              </View>
              <Illustration
                name={r.art}
                size={104}
                style={{ position: 'absolute', right: 14, top: 28 }}
              />
            </View>
          );
        })}
      </View>
      <Text className="mt-[18px] text-muted" style={{ fontSize: 14.5, lineHeight: 20.5 }}>
        {t('onboarding.prognosis.note')}
      </Text>
    </Screen>
  );
}
