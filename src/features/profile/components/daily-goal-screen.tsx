import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/features/auth/hooks/use-session';
import { useUpdateProfile } from '@/features/profile/hooks/use-profile';
import { DailyGoalOptions, EtaCard } from '@/shared/components/daily-goal';
import { Headline } from '@/shared/components/headline';
import { Button } from '@/shared/ui/button';
import { Screen } from '@/shared/ui/screen';
import { TopBar } from '@/shared/ui/top-bar';

/** 09g · Profil · Tägliche Lernzeit ändern. Saves optimistically. */
export function DailyGoalScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session, update } = useSession();
  const updateProfile = useUpdateProfile();
  const [minutes, setMinutes] = useState(session.dailyGoalMinutes);
  return (
    <Screen top={0} bottom={6} scroll>
      <View className="flex-1 px-[22px]">
        <TopBar left="back" title={t('profile.goalScreen.title')} />
        <Headline
          size={30}
          titleMarginTop={20}
          title={t('profile.goalScreen.headline')}
          sub={t('profile.goalScreen.sub')}
        />
        <DailyGoalOptions className="mt-[24px]" value={minutes} onChange={setMinutes} />
        <EtaCard className="mt-[20px]" minutes={minutes} />
        <View className="flex-1" style={{ minHeight: 20 }} />
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
      </View>
    </Screen>
  );
}
