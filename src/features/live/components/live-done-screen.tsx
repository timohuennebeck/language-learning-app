import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { liveScenario } from '@/features/live/data/content';
import { useGoHome } from '@/shared/hooks/use-back';
import { colors } from '@/shared/theme/tokens';
import { Button, TextButton } from '@/shared/ui/button';
import { Illustration } from '@/shared/ui/illustration';
import { Kicker } from '@/shared/ui/kicker';
import { CheckCircle } from '@/shared/ui/marks';
import { NavCircle } from '@/shared/ui/nav-circle';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';

/** 02d-6 · Gespräch geschafft: Pip, the session line and the ticked tasks with what was said. */
export function LiveDoneScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const goHome = useGoHome();
  return (
    <Screen bottom={-4} className="px-[22px]">
      <View className="h-[40px] flex-row items-center justify-end">
        <NavCircle icon="close" size={40} onPress={goHome} />
      </View>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 8 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center">
          <Illustration name="pip-trophy" size={132} />
          <Text
            className="mt-[12px] text-center font-semibold text-ink"
            style={{ fontSize: 29, lineHeight: 33, letterSpacing: -0.87 }}
          >
            {t('live.done.title')}
          </Text>
          <Text className="mt-[8px] text-center text-muted" style={{ fontSize: 16 }}>
            {t('live.done.meta')}
          </Text>
        </View>
        <Kicker size={12} tracking={0.1} className="mt-[24px] text-accent-700">
          {t('live.done.tasks')}
        </Kicker>
        <View className="mt-[10px]" style={{ rowGap: 10 }}>
          {liveScenario.tasks.map((task) => (
            <View
              key={task.text}
              className="flex-row items-start rounded-[20px] bg-white px-[16px] py-[14px]"
              style={{ columnGap: 12 }}
            >
              <CheckCircle size={26} bg={colors.accent[800]} iconSize={12} stroke={2.8} />
              <View className="flex-1" style={{ rowGap: 4 }}>
                <Text className="text-ink" style={{ fontSize: 16, lineHeight: 22 }}>
                  {task.text}
                </Text>
                <Text className="text-muted" style={{ fontSize: 15, lineHeight: 21 }}>
                  „{task.said}“
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={{ rowGap: 6 }}>
        <Button
          height={60}
          size={17.5}
          haptic="success"
          label={t('live.done.cta')}
          onPress={() => router.replace('/(app)/review')}
        />
        <TextButton
          className="h-[52px]"
          label={t('live.done.later')}
          color="text-accent-700"
          onPress={goHome}
        />
      </View>
    </Screen>
  );
}
