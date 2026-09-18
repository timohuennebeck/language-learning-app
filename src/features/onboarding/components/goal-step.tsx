import { useRouter } from 'expo-router';
import { useWindowDimensions, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/features/auth/hooks/use-session';
import { OnboardingFrame } from '@/features/onboarding/components/onboarding-frame';
import { cn } from '@/shared/lib/cn';
import { ring } from '@/shared/lib/styles';
import { colors } from '@/shared/theme/tokens';
import { Button, TextButton } from '@/shared/ui/button';
import { Illustration, type IllustrationName } from '@/shared/ui/illustration';
import { CheckCircle } from '@/shared/ui/marks';
import { Tap } from '@/shared/ui/tap';
import { Text } from '@/shared/ui/text';

const GOALS: { id: string; pip: IllustrationName }[] = [
  { id: 'travel', pip: 'pip-baguette' },
  { id: 'media', pip: 'pip-headphones' },
  { id: 'family', pip: 'pip-heart' },
  { id: 'work', pip: 'pip-book-pencil' },
  { id: 'friends', pip: 'pip-clock' },
  { id: 'fun', pip: 'pip-cheer-4' },
];

/** 03b · Warum Französisch (3 von 13). */
export function GoalStep() {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const { session, update } = useSession();
  const next = () => router.push('/(onboarding)/name');
  return (
    <OnboardingFrame
      step={3}
      title={t('onboarding.goal.title')}
      sub={t('onboarding.goal.sub')}
      footer={
        <>
          <Button height={60} size={17.5} label={t('common.next')} onPress={next} />
          <TextButton
            className="mt-[16px]"
            label={t('onboarding.goal.notSure')}
            onPress={() => {
              update({ goal: null });
              next();
            }}
          />
        </>
      }
    >
      <View className="mt-[22px] flex-row flex-wrap" style={{ gap: 12 }}>
        {GOALS.map((g) => {
          const on = session.goal === g.id;
          return (
            <Tap
              key={g.id}
              haptic="selection"
              onPress={() => update({ goal: g.id })}
              className="relative items-center justify-center rounded-[22px] bg-white"
              style={{
                width: (width - 2 * 20 - 12) / 2,
                height: 154,
                paddingTop: 14,
                paddingBottom: 15,
                paddingHorizontal: 12,
                boxShadow: on ? ring(2, colors.accent[700]) : ring(1, colors.neutral[200]),
                rowGap: 10,
              }}
            >
              {on ? (
                <CheckCircle
                  size={22}
                  bg={colors.accent[700]}
                  stroke={2.8}
                  iconSize={12}
                  className="absolute right-[10px] top-[10px]"
                  style={{ position: 'absolute' }}
                />
              ) : null}
              <Illustration name={g.pip} size={76} />
              <Text
                className={cn('text-center text-ink', on && 'font-semibold')}
                style={{ fontSize: 15.5, lineHeight: 19.4 }}
              >
                {t(`onboarding.goal.options.${g.id}`)}
              </Text>
            </Tap>
          );
        })}
      </View>
    </OnboardingFrame>
  );
}
