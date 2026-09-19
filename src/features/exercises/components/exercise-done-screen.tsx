import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/features/auth/hooks/use-session';
import { cafeExercise } from '@/features/exercises/data/content';
import type { ExerciseStep } from '@/features/exercises/data/types';
import { ResultHero } from '@/shared/components/result-hero';
import { useGoToCourse } from '@/shared/hooks/use-back';
import { colors } from '@/shared/theme/tokens';
import { Button, TextButton } from '@/shared/ui/button';
import { Gradient } from '@/shared/ui/gradient';
import { Kicker } from '@/shared/ui/kicker';
import { NavCircle } from '@/shared/ui/nav-circle';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';

/** Opened without a run (dev index, screenshots): the design sample. */
const DEMO = { total: 8, wrong: ['s2', 's5'] };

/** The right answer of a step, shown as the chip to look at again. */
function solution(step: ExerciseStep) {
  if (step.kind === 'build') return step.answer.join(' ');
  if (step.kind === 'conjugate') return `${step.verb} · ${step.tense}`;
  return step.answer;
}

/** 19e · Übung geschafft: ring with the score, Pip, and the tasks to look at again. */
export function ExerciseDoneScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const goToCourse = useGoToCourse();
  const { session } = useSession();
  const params = useLocalSearchParams<{ total?: string; wrong?: string }>();
  const total = params.total !== undefined ? Number(params.total) || 0 : DEMO.total;
  const wrongIds =
    params.total !== undefined ? (params.wrong ? params.wrong.split(',') : []) : DEMO.wrong;
  const wrong = cafeExercise.steps.filter((s) => wrongIds.includes(s.id));
  const right = Math.max(0, total - wrong.length);
  const finish = () => goToCourse(3);
  return (
    <Screen bottom={-10} className="px-[22px]">
      <View className="h-[40px] justify-center">
        <NavCircle icon="close" onPress={finish} />
      </View>
      <ResultHero
        progress={total ? right / total : 0}
        badge={t('exercise.result.badge', { right, total })}
        title={t('exercise.result.title', { name: session.name })}
        sub={wrong.length ? t('exercise.result.sub') : t('exercise.result.subPerfect')}
      />
      {wrong.length ? (
        <View className="mt-[30px] flex-1 overflow-hidden" style={{ minHeight: 120 }}>
          <ScrollView
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            <Kicker size={13} tracking={0.1}>
              {t('exercise.result.again')}
            </Kicker>
            <View className="mt-[10px] flex-row flex-wrap" style={{ gap: 8 }}>
              {wrong.map((step) => (
                <View
                  key={step.id}
                  className="justify-center rounded-pill bg-surface px-[14px]"
                  style={{ height: 40 }}
                >
                  <Text className="text-ink" style={{ fontSize: 17 }}>
                    {solution(step)}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
          {/* Fade the list out towards the button so it reads as scrollable. */}
          <Gradient
            pointerEvents="none"
            colors={['rgba(243,245,254,0)', colors.bg]}
            className="absolute bottom-0 left-0 right-0"
            style={{ height: 56 }}
          />
        </View>
      ) : (
        <View className="flex-1" />
      )}
      <View className="mt-[16px]" style={{ rowGap: 6 }}>
        {wrong.length ? (
          <Button
            height={58}
            size={17}
            label={t('exercise.result.retry', { n: wrong.length })}
            onPress={() =>
              router.replace({ pathname: '/(app)/exercise', params: { ids: wrongIds.join(',') } })
            }
          />
        ) : null}
        <TextButton
          className="h-[44px]"
          label={t('exercise.result.finish')}
          color="text-sub"
          size={16}
          onPress={finish}
        />
      </View>
    </Screen>
  );
}
