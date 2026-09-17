import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/features/auth/hooks/useSession';
import { OnboardingFrame } from '@/features/onboarding/components/OnboardingFrame';
import { RepeatSegments, TimePicker } from '@/shared/components/TimePicker';
import { Button } from '@/shared/ui/Button';
import { Gradient } from '@/shared/ui/Gradient';
import { Illustration } from '@/shared/ui/Illustration';
import { Text } from '@/shared/ui/Text';

const pad = (n: number) => String(n).padStart(2, '0');

/** 05a · Erinnerungszeit (6 von 13). */
export function ReminderTimeStep() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session, update } = useSession();
  const [time, setTime] = useState({
    hour: session.reminder?.hour ?? 20,
    minute: session.reminder?.minute ?? 30,
  });
  const [repeat, setRepeat] = useState(session.reminder?.repeat ?? 0);
  const label = `${pad(time.hour)}:${pad(time.minute)}`;
  return (
    <OnboardingFrame
      step={6}
      title={t('onboarding.reminder.title', { name: session.name })}
      sub={t('onboarding.reminder.sub')}
      footer={
        <Button
          height={60}
          size={17.5}
          label={t('onboarding.reminder.cta', { time: label })}
          onPress={() => {
            update({ reminder: { ...time, repeat } });
            router.push('/(onboarding)/assessment-intro');
          }}
        />
      }
    >
      <Gradient
        colors={['#eeedfe', '#e7e5fe']}
        start={{ x: 0.12, y: 0 }}
        end={{ x: 0.88, y: 1 }}
        className="mt-[18px] items-center justify-center overflow-hidden rounded-[26px]"
        style={{ height: 186 }}
      >
        <Illustration name="pip-clock-2" size={158} />
      </Gradient>
      <TimePicker
        className="mt-[18px]"
        hour={time.hour}
        minute={time.minute}
        minuteStep={15}
        onChange={setTime}
      />
      <Text className="mt-[2px] uppercase text-muted" style={{ fontSize: 11, letterSpacing: 1.32 }}>
        {t('onboarding.reminder.repeat')}
      </Text>
      <RepeatSegments className="mt-[8px]" value={repeat} onChange={setRepeat} />
    </OnboardingFrame>
  );
}
