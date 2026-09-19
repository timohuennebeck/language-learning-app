import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { FeedbackCard } from '@/features/exercises/components/feedback-card';
import { Build } from '@/features/exercises/components/steps/build';
import { FillFree } from '@/features/exercises/components/steps/fill-free';
import { FillOptions } from '@/features/exercises/components/steps/fill-options';
import { TranslateFree } from '@/features/exercises/components/steps/translate-free';
import { cafeExercise } from '@/features/exercises/data/content';
import { useExerciseSession } from '@/features/exercises/hooks/use-exercise-session';
import { haptic } from '@/shared/lib/haptics';
import { playSound } from '@/shared/lib/sounds';
import { colors } from '@/shared/theme/tokens';
import { Button } from '@/shared/ui/button';
import { ResetGlyph } from '@/shared/ui/icons';
import { Screen } from '@/shared/ui/screen';
import { Tap } from '@/shared/ui/tap';
import { ProgressTopBar } from '@/shared/ui/top-bar';

/**
 * Exercise flow. `?ids=s2,s5` runs only those steps (retry from the result screen).
 * Dev/verification params: `?step=3&state=correct|wrong` (also pre-fill typed drafts).
 */
export function ExerciseScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ step?: string; state?: string; ids?: string }>();
  const exercise = useMemo(() => {
    if (!params.ids) return cafeExercise;
    const ids = params.ids.split(',');
    const steps = cafeExercise.steps.filter((step) => ids.includes(step.id));
    return steps.length ? { ...cafeExercise, steps } : cafeExercise;
  }, [params.ids]);
  const s = useExerciseSession(exercise, {
    initialIndex: params.step ? Number(params.step) - 1 : 0,
    initialPhase: params.state === 'correct' || params.state === 'wrong' ? params.state : 'task',
    designDrafts: params.step !== undefined,
  });
  const task = s.phase === 'task';
  const typed = s.step.kind === 'fill-free' || s.step.kind === 'translate-free';
  const keyboard = task && typed;
  const check = () => {
    if (!s.canCheck) return;
    const ok = s.check();
    playSound(ok ? 'correct' : 'incorrect');
    haptic(ok ? 'success' : 'error');
  };
  const onNext = () => {
    if (s.next()) return;
    router.replace({
      pathname: '/(app)/exercise/done',
      params: { total: String(s.total), wrong: s.wrongIds.join(',') },
    });
  };

  return (
    <Screen bottom={keyboard ? -34 : 0} className="px-[22px]" keyboard={typed}>
      <ProgressTopBar
        height={32}
        progress={(s.index + 1) / s.total}
        label={`${s.index + 1} / ${s.total}`}
        labelSize={13}
        trackColor={colors.track2}
      />
      {s.step.kind === 'fill-options' ? (
        <FillOptions
          step={s.step}
          phase={s.phase}
          answer={s.answer as string}
          setAnswer={s.setAnswer}
        />
      ) : s.step.kind === 'fill-free' ? (
        <FillFree
          step={s.step}
          phase={s.phase}
          answer={s.answer as string}
          setAnswer={s.setAnswer}
          onSubmit={check}
        />
      ) : s.step.kind === 'build' ? (
        <Build
          step={s.step}
          phase={s.phase}
          answer={s.answer as string[]}
          setAnswer={s.setAnswer}
        />
      ) : (
        <TranslateFree
          step={s.step}
          phase={s.phase}
          answer={s.answer as string}
          setAnswer={s.setAnswer}
          onSubmit={check}
        />
      )}
      <View className="flex-1" style={{ minHeight: task ? 0 : 20 }} />
      {task ? (
        <View
          className="flex-row items-center"
          style={{ columnGap: 10, paddingBottom: keyboard ? 14 : 0 }}
        >
          {s.step.kind === 'build' ? (
            <Tap
              haptic="light"
              onPress={s.reset}
              accessibilityLabel={t('common.reset')}
              className="h-[56px] w-[56px] items-center justify-center rounded-full bg-surface2"
            >
              <ResetGlyph />
            </Tap>
          ) : null}
          <Button
            className="flex-1"
            variant="strong"
            height={56}
            label={t('common.check')}
            disabled={!s.canCheck}
            haptic="none"
            onPress={check}
          />
        </View>
      ) : (
        <>
          <FeedbackCard
            correct={s.phase === 'correct'}
            why={s.step.correctWhy}
            wrongWhy={s.step.wrongWhy}
            youLine={s.step.youLine}
            rightLine={s.step.rightLine}
          />
          <View style={{ height: 14 }} />
          <Button height={56} label={t('common.next')} onPress={onNext} />
        </>
      )}
    </Screen>
  );
}
