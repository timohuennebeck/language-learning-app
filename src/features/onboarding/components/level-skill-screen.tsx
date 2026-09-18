import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { LEVELS, type Level } from '@/features/auth/data/schemas';
import { useSession } from '@/features/auth/hooks/use-session';
import {
  ONBOARDING_STEPS,
  PLACEMENT_STEPS,
} from '@/features/onboarding/components/onboarding-frame';
import { colors } from '@/shared/theme/tokens';
import { Button } from '@/shared/ui/button';
import { CardGradient } from '@/shared/ui/gradient';
import { Illustration, type IllustrationName } from '@/shared/ui/illustration';
import { CheckCircle } from '@/shared/ui/marks';
import { Kicker } from '@/shared/ui/kicker';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';
import { ProgressTopBar } from '@/shared/ui/top-bar';

type Skill = 'reading' | 'speaking';

const ART: Record<Skill, IllustrationName> = {
  reading: 'pip-magnifier',
  speaking: 'pip-glasses-book',
};

/** Marker position on the A1–B2 scale (centre of the level's segment). */
function scalePosition(level: Level) {
  return (LEVELS.indexOf(level) + 0.5) / LEVELS.length;
}

/**
 * 62i · Einstufung result for one skill: level card with the A1–B2 scale, what already works,
 * what comes next. Reading first ("Weiter zum Sprechen"), then speaking ("Weiter").
 */
export function LevelSkillScreen({ skill }: { skill: Skill }) {
  const { t } = useTranslation();
  const router = useRouter();
  const { session } = useSession();
  const level: Level = skill === 'reading' ? (session.readingLevel ?? 'B1') : session.level;
  const step = skill === 'reading' ? PLACEMENT_STEPS.readingResult : PLACEMENT_STEPS.speakingResult;
  const can = t(`onboarding.levelSkill.${skill}.${level}.can`, { returnObjects: true }) as string[];
  const work = t(`onboarding.levelSkill.${skill}.${level}.work`, {
    returnObjects: true,
  }) as string[];
  const pos = scalePosition(level);

  return (
    <Screen
      bottom={0}
      className="px-[22px]"
      footer={
        <Button
          height={60}
          size={17.5}
          label={t(`onboarding.levelSkill.${skill}.cta`)}
          onPress={() =>
            router.push(
              skill === 'reading' ? '/(onboarding)/level-speaking' : '/(onboarding)/target-level',
            )
          }
        />
      }
    >
      <ProgressTopBar
        progress={step / ONBOARDING_STEPS}
        label={t('common.stepOf', { step, total: ONBOARDING_STEPS })}
      />
      <Kicker tracking={0.1} className="mt-[26px] text-accent-700">
        {t('onboarding.levelSkill.skillOf', { n: skill === 'reading' ? 1 : 2 })}
      </Kicker>
      <Text
        className="mt-[8px] font-semibold text-ink"
        style={{ fontSize: 31, lineHeight: 35, letterSpacing: -1.085 }}
      >
        {t(`onboarding.levelSkill.${skill}.headline`, { level })}
      </Text>

      <CardGradient className="relative mt-[18px] px-[18px] py-[18px]" style={{ height: 196 }}>
        <View className="flex-row items-center" style={{ columnGap: 10 }}>
          <View className="rounded-pill bg-white px-[12px] py-[6px]">
            <Kicker tracking={0.08} className="font-semibold">
              {t(`onboarding.levelSkill.${skill}.pill`)}
            </Kicker>
          </View>
          <Kicker tracking={0.1} className="text-muted">
            {t(`onboarding.levelSkill.${skill}.pillSub`)}
          </Kicker>
        </View>
        <View className="mt-[10px] flex-row items-end" style={{ columnGap: 10 }}>
          <Text
            className="font-semibold text-accent-900"
            style={{ fontSize: 52, lineHeight: 52, letterSpacing: -2.08, marginTop: -5 }}
          >
            {level}
          </Text>
          <Text className="pb-[6px] text-sub" style={{ fontSize: 22 }}>
            {t(`common.levelName.${level}`)}
          </Text>
        </View>
        <View className="mt-[16px]" style={{ width: 200 }}>
          <View className="relative h-[8px] rounded-pill bg-white">
            <View
              className="absolute bottom-0 left-0 top-0 rounded-pill bg-accent-700"
              style={{ width: `${pos * 100}%` }}
            />
            <View
              className="absolute h-[16px] w-[16px] rounded-full bg-white"
              style={{
                top: -4,
                left: `${pos * 100}%`,
                marginLeft: -8,
                borderWidth: 3,
                borderColor: colors.accent[800],
              }}
            />
          </View>
          <View className="mt-[7px] flex-row justify-between">
            {LEVELS.map((l) => (
              <Text
                key={l}
                className={l === level ? 'font-semibold text-accent-900' : 'text-muted'}
                style={{ fontSize: 11.5 }}
              >
                {l}
              </Text>
            ))}
          </View>
        </View>
        <Illustration
          name={ART[skill]}
          size={110}
          style={{ position: 'absolute', right: 12, top: 52 }}
        />
      </CardGradient>

      <Kicker tracking={0.1} className="mt-[24px] text-muted">
        {t('onboarding.levelSkill.canLabel')}
      </Kicker>
      <View className="mt-[12px]" style={{ rowGap: 12 }}>
        {can.map((item) => (
          <View key={item} className="flex-row items-start" style={{ columnGap: 12 }}>
            <CheckCircle size={22} bg={colors.accent[800]} stroke={2.4} iconSize={11} />
            <Text className="flex-1 text-ink" style={{ fontSize: 15.5, lineHeight: 22 }}>
              {item}
            </Text>
          </View>
        ))}
      </View>
      <Kicker tracking={0.1} className="mt-[22px] text-muted">
        {t('onboarding.levelSkill.workLabel')}
      </Kicker>
      <View className="mt-[12px]" style={{ rowGap: 12 }}>
        {work.map((item) => (
          <View key={item} className="flex-row items-start" style={{ columnGap: 12 }}>
            <View className="h-[22px] w-[22px] items-center justify-center rounded-full bg-surface">
              <Text className="text-accent-800" style={{ fontSize: 15, lineHeight: 18 }}>
                +
              </Text>
            </View>
            <Text className="flex-1 text-ink" style={{ fontSize: 15.5, lineHeight: 22 }}>
              {item}
            </Text>
          </View>
        ))}
      </View>
      <View style={{ height: 16 }} />
    </Screen>
  );
}
