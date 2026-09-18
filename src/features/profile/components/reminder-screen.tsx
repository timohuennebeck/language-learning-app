import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useReminderDraft } from '@/features/auth/hooks/use-reminder-draft';
import { useSession } from '@/features/auth/hooks/use-session';
import { PipTip, Strong } from '@/shared/components/pip-tip';
import { RepeatSegments, TimePicker } from '@/shared/components/time-picker';
import { TitledFrame } from '@/shared/components/titled-frame';
import { Button, TextButton } from '@/shared/ui/button';
import { Kicker } from '@/shared/ui/kicker';

/** 09f · Profil · Erinnerung ändern. */
export function ReminderScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session, update } = useSession();
  const draft = useReminderDraft(session.reminder);
  const freq = t('profile.reminderScreen.freq', { returnObjects: true }) as string[];
  const tail = t('profile.reminderScreen.tail', { returnObjects: true }) as string[];
  return (
    <TitledFrame
      title={t('profile.reminderScreen.title')}
      headline={t('profile.reminderScreen.headline')}
      sub={t('profile.reminderScreen.sub')}
      footer={
        <View style={{ rowGap: 10 }}>
          <Button
            height={60}
            size={17.5}
            label={t('profile.reminderScreen.save', { time: draft.label })}
            onPress={() => {
              update({ reminder: draft.value });
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
      }
    >
      <TimePicker
        className="mt-[16px]"
        hour={draft.time.hour}
        minute={draft.time.minute}
        minuteStep={5}
        onChange={draft.setTime}
      />
      <Kicker className="mt-[6px] text-muted">{t('onboarding.reminder.repeat')}</Kicker>
      <RepeatSegments className="mt-[8px]" value={draft.repeat} onChange={draft.setRepeat} />
      <PipTip className="mt-[14px]">
        {t('profile.reminderScreen.preview1')}
        <Strong>{freq[draft.repeat]}</Strong>
        {t('profile.reminderScreen.previewAt')}
        <Strong>{draft.label}</Strong>
        {tail[draft.repeat]}
      </PipTip>
    </TitledFrame>
  );
}
