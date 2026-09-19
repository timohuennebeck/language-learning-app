import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/features/auth/hooks/use-session';
import { useConversation } from '@/features/live/hooks/use-conversation';
import { useGoHome } from '@/shared/hooks/use-back';
import { localized } from '@/shared/lib/i18n';
import { colors } from '@/shared/theme/tokens';
import { Button, TextButton } from '@/shared/ui/button';
import { Illustration } from '@/shared/ui/illustration';
import { Kicker } from '@/shared/ui/kicker';
import { RadioMark } from '@/shared/ui/marks';
import { NavCircle } from '@/shared/ui/nav-circle';
import { Screen } from '@/shared/ui/screen';
import { Spinner } from '@/shared/ui/spinner';
import { Text } from '@/shared/ui/text';

/** 02d-6 · Gespräch geschafft: Pip, the session line and the ticked tasks with what was said. */
export function LiveDoneScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const goHome = useGoHome();
  const { session } = useSession();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const conversation = useConversation(id);
  const c = conversation.data;
  const review = c?.review;
  const tasks = (c?.tasks ?? []).map((task) => {
    const r = review?.tasks.find((x) => x.id === task.id);
    return {
      id: task.id,
      text: localized(task.text, session.appLanguage),
      done: r?.done ?? false,
      said: r?.said ?? null,
    };
  });
  return (
    <Screen bottom={-4} className="px-[22px]">
      <View className="h-[40px] justify-center">
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
            {c
              ? t('live.done.meta', {
                  topic: c.title ?? t('speak.free.title'),
                  minutes: Math.max(1, Math.round(c.durationSeconds / 60)),
                  level: c.level ?? session.level,
                })
              : ' '}
          </Text>
        </View>
        {conversation.isPending ? (
          <View className="mt-[40px] items-center">
            <Spinner />
          </View>
        ) : null}
        {review?.summary ? (
          <Text
            className="mt-[20px] text-center text-ink2"
            style={{ fontSize: 15.5, lineHeight: 22 }}
          >
            {review.summary}
          </Text>
        ) : null}
        {tasks.length ? (
          <>
            <Kicker size={12} tracking={0.1} className="mt-[24px] text-accent-700">
              {t('live.done.tasks')}
            </Kicker>
            <View className="mt-[10px]" style={{ rowGap: 10 }}>
              {tasks.map((task) => (
                <View
                  key={task.id}
                  className="flex-row items-start rounded-[20px] bg-white px-[16px] py-[14px]"
                  style={{ columnGap: 12 }}
                >
                  <RadioMark
                    selected={task.done}
                    size={26}
                    ringColor={colors.ring2}
                    ringWidth={1.6}
                    bg={colors.accent[800]}
                    checkStroke={2.1}
                  />
                  <View className="flex-1" style={{ rowGap: 4 }}>
                    <Text className="text-ink" style={{ fontSize: 16, lineHeight: 22 }}>
                      {task.text}
                    </Text>
                    {task.said ? (
                      <Text className="text-muted" style={{ fontSize: 15, lineHeight: 21 }}>
                        „{task.said}“
                      </Text>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          </>
        ) : null}
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
