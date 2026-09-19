import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/features/auth/hooks/use-session';
import { CallTimer } from '@/features/live/components/call-timer';
import { formatClock } from '@/features/live/components/live-call-screen';
import { useLiveCallState } from '@/features/live/lib/live-call-store';
import { localized } from '@/features/speak/data/schemas';
import { Headline } from '@/shared/components/headline';
import { colors } from '@/shared/theme/tokens';
import { Button } from '@/shared/ui/button';
import { RadioMark } from '@/shared/ui/marks';
import { NavCircle } from '@/shared/ui/nav-circle';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';

/** 02c-i-6 · The running call's tasks, opened from the checklist circle; Pip ticks them off as they happen. */
export function LiveTasksScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session } = useSession();
  const call = useLiveCallState();
  return (
    <Screen bottom={6} className="px-[22px]">
      <View className="h-[40px] flex-row items-center justify-between">
        <NavCircle icon="close" size={40} />
        <CallTimer label={formatClock(call.elapsed)} />
      </View>
      <Headline
        size={30}
        titleMarginTop={26}
        title={call.title ?? t('speak.free.title')}
        sub={localized(call.brief, session.appLanguage) || t('speak.free.sub')}
      />
      <View className="mt-[26px]" style={{ rowGap: 18 }}>
        {call.tasks.map((task) => (
          <View
            key={task.id}
            className="flex-row items-start"
            style={{ columnGap: 14 }}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: task.done }}
          >
            <RadioMark
              selected={task.done}
              size={26}
              ringColor={colors.ring2}
              ringWidth={1.6}
              bg={colors.accent[800]}
              checkStroke={2.1}
            />
            <Text
              className={task.done ? 'flex-1 text-faint line-through' : 'flex-1 text-ink2'}
              style={{ fontSize: 17, lineHeight: 24, paddingTop: 1 }}
            >
              {localized(task.text, session.appLanguage)}
            </Text>
          </View>
        ))}
      </View>
      <View className="flex-1" />
      <Button height={60} size={17.5} label={t('live.tasks.cta')} onPress={() => router.back()} />
    </Screen>
  );
}
