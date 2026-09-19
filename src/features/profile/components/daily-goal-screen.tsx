import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/features/auth/hooks/use-session';
import { DailyGoalOptions, EtaCard } from '@/shared/components/daily-goal';
import { TitledFrame } from '@/shared/components/titled-frame';
import { Button } from '@/shared/ui/button';

/** 09g · Profil · Tägliche Lernzeit ändern. `update()` saves optimistically. */
export function DailyGoalScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session, update } = useSession();
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
            update({ dailyGoalMinutes: minutes });
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
