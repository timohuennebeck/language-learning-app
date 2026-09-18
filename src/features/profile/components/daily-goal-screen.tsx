import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/features/auth/hooks/use-session';
import { useUpdateProfile } from '@/features/profile/hooks/use-profile';
import { DailyGoalOptions, EtaCard } from '@/shared/components/daily-goal';
import { TitledFrame } from '@/shared/components/titled-frame';
import { Button } from '@/shared/ui/button';

/** 09g · Profil · Tägliche Lernzeit ändern. Saves optimistically. */
export function DailyGoalScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session, update } = useSession();
  const updateProfile = useUpdateProfile();
  const [minutes, setMinutes] = useState(session.dailyGoalMinutes);
  return (
    <TitledFrame
      scroll
      title={t('profile.goalScreen.title')}
      headline={t('profile.goalScreen.headline')}
      sub={t('profile.goalScreen.sub')}
      footer={
        <Button
          height={60}
          size={17.5}
          label={t('profile.goalScreen.save', { min: minutes })}
          onPress={() => {
            const previous = session.dailyGoalMinutes;
            update({ dailyGoalMinutes: minutes });
            // mutateAsync: the promise outlives this screen, mutate()'s callbacks would not.
            updateProfile
              .mutateAsync({ dailyGoalMinutes: minutes })
              .catch(() => update({ dailyGoalMinutes: previous }));
            router.back();
          }}
        />
      }
    >
      <DailyGoalOptions className="mt-[24px]" value={minutes} onChange={setMinutes} />
      <EtaCard className="mt-[20px]" minutes={minutes} />
    </TitledFrame>
  );
}
