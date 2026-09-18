import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/features/auth/hooks/use-session';
import { OnboardingFrame } from '@/features/onboarding/components/onboarding-frame';
import { RepeatSegments, TimePicker } from '@/shared/components/time-picker';
import { Button } from '@/shared/ui/button';
import { CardGradient } from '@/shared/ui/gradient';
import { Illustration } from '@/shared/ui/illustration';
import { formatTime } from '@/shared/lib/time';
import { Kicker } from '@/shared/ui/kicker';

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
  const label = formatTime(time.hour, time.minute);
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
      <CardGradient className="mt-[18px] items-center justify-center" style={{ height: 186 }}>
        <Illustration name="pip-clock-2" size={158} />
      </CardGradient>
      <TimePicker
        className="mt-[18px]"
        hour={time.hour}
        minute={time.minute}
        minuteStep={15}
        onChange={setTime}
      />
      <Kicker className="mt-[2px] text-muted">{t('onboarding.reminder.repeat')}</Kicker>
      <RepeatSegments className="mt-[8px]" value={repeat} onChange={setRepeat} />
    </OnboardingFrame>
  );
}
