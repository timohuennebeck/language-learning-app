import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { CallTimer } from '@/features/live/components/call-timer';
import { liveScenario } from '@/features/live/data/content';
import { Headline } from '@/shared/components/headline';
import { colors } from '@/shared/theme/tokens';
import { Button } from '@/shared/ui/button';
import { RadioMark } from '@/shared/ui/marks';
import { NavCircle } from '@/shared/ui/nav-circle';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';

/** 02c-i-6 · The conversation's tasks, opened from the info circle during the live call. */
export function LiveTasksScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <Screen bottom={6} className="px-[22px]">
      <View className="h-[40px] flex-row items-center justify-between">
        <NavCircle icon="close" size={40} />
        <CallTimer label={t('live.tasks.timer')} />
      </View>
      <Headline size={30} titleMarginTop={26} title={liveScenario.title} sub={liveScenario.intro} />
      <View className="mt-[26px]" style={{ rowGap: 18 }}>
        {liveScenario.tasks.map((task) => (
          <View
            key={task.text}
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
              {task.text}
            </Text>
          </View>
        ))}
      </View>
      <View className="flex-1" />
      <Button height={60} size={17.5} label={t('live.tasks.cta')} onPress={() => router.back()} />
    </Screen>
  );
}
