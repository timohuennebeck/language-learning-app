import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/features/auth/hooks/use-session';
import { Headline } from '@/shared/components/headline';
import { PipTip, Strong } from '@/shared/components/pip-tip';
import { RepeatSegments, TimePicker } from '@/shared/components/time-picker';
import { Button, TextButton } from '@/shared/ui/button';
import { Screen } from '@/shared/ui/screen';
import { formatTime } from '@/shared/lib/time';
import { Kicker } from '@/shared/ui/kicker';
import { TopBar } from '@/shared/ui/top-bar';

/** 09f · Profil · Erinnerung ändern. */
export function ReminderScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session, update } = useSession();
  const [time, setTime] = useState({
    hour: session.reminder?.hour ?? 20,
    minute: session.reminder?.minute ?? 30,
  });
  const [repeat, setRepeat] = useState(session.reminder?.repeat ?? 0);
  const label = formatTime(time.hour, time.minute);
  const freq = t('profile.reminderScreen.freq', { returnObjects: true }) as string[];
  const tail = t('profile.reminderScreen.tail', { returnObjects: true }) as string[];
  return (
    <Screen top={0} bottom={6} className="px-[22px]">
      <TopBar left="back" title={t('profile.reminderScreen.title')} />
      <Headline
        size={30}
        titleMarginTop={20}
        title={t('profile.reminderScreen.headline')}
        sub={t('profile.reminderScreen.sub')}
      />
      <TimePicker
        className="mt-[16px]"
        hour={time.hour}
        minute={time.minute}
        minuteStep={5}
        onChange={setTime}
      />
      <Kicker className="mt-[6px] text-muted">{t('onboarding.reminder.repeat')}</Kicker>
      <RepeatSegments className="mt-[8px]" value={repeat} onChange={setRepeat} />
      <PipTip className="mt-[14px]">
        {t('profile.reminderScreen.preview1')}
        <Strong>{freq[repeat]}</Strong>
        {t('profile.reminderScreen.previewAt')}
        <Strong>{label}</Strong>
        {tail[repeat]}
      </PipTip>
      <View className="flex-1" />
      <View style={{ rowGap: 10 }}>
        <Button
          height={60}
          size={17.5}
          label={t('profile.reminderScreen.save', { time: label })}
          onPress={() => {
            update({ reminder: { ...time, repeat } });
            router.back();
          }}
        />
        <TextButton
          className="h-[52px]"
          label={t('profile.reminderScreen.off')}
          color="text-muted"
          labelClassName="font-regular"
          onPress={() => {
            update({ reminder: null });
            router.back();
          }}
        />
      </View>
    </Screen>
  );
}
