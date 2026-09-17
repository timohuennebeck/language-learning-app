import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/features/auth/hooks/useSession';
import { Headline } from '@/shared/components/Headline';
import { PipTip, Strong } from '@/shared/components/PipTip';
import { RepeatSegments, TimePicker } from '@/shared/components/TimePicker';
import { Button, TextButton } from '@/shared/ui/Button';
import { Screen } from '@/shared/ui/Screen';
import { Text } from '@/shared/ui/Text';
import { TopBar } from '@/shared/ui/TopBar';

const pad = (n: number) => String(n).padStart(2, '0');

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
  const label = `${pad(time.hour)}:${pad(time.minute)}`;
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
      <Text className="mt-[6px] uppercase text-muted" style={{ fontSize: 11, letterSpacing: 1.32 }}>
        {t('onboarding.reminder.repeat')}
      </Text>
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
