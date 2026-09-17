import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChipsPreview, DotMatrix, ReadingCardPreview } from '@/shared/components/Previews';
import { cn } from '@/shared/lib/cn';
import { NavCircle } from '@/shared/ui/NavCircle';
import { Screen } from '@/shared/ui/Screen';
import { Tap } from '@/shared/ui/Tap';
import { Kicker } from '@/shared/ui/Kicker';
import { Text } from '@/shared/ui/Text';

type CardProps = {
  dark?: boolean;
  preview: React.ReactNode;
  kicker: string;
  badge?: string;
  title: string;
  sub: string;
  cta: string;
  onPress: () => void;
};

function LessonCard({ dark, preview, kicker, badge, title, sub, cta, onPress }: CardProps) {
  return (
    <Tap
      haptic="medium"
      onPress={onPress}
      className={cn('rounded-[26px] p-[16px]', dark ? 'bg-accent-800' : 'bg-surface')}
    >
      {preview}
      <View
        className="mt-[14px] flex-row items-center"
        style={{ columnGap: 8, marginTop: dark ? 12 : 14 }}
      >
        <Kicker tracking={0.14} className={cn(dark ? 'text-lilac' : 'text-accent-800')}>
          {kicker}
        </Kicker>
        {badge ? (
          <View className="rounded-pill bg-accent-100 px-[11px] py-[4px]">
            <Text className="font-medium text-accent-800" style={{ fontSize: 12 }}>
              {badge}
            </Text>
          </View>
        ) : null}
      </View>
      <Text
        className={cn('mt-[4px] font-medium', dark ? 'text-accent-100' : 'text-accent-900')}
        style={{ fontSize: 23, lineHeight: 24.2, letterSpacing: -0.575 }}
      >
        {title}
      </Text>
      <Text
        className={cn('mt-[6px]', dark ? 'text-lilac2' : 'text-sub')}
        style={{ fontSize: 14.5, lineHeight: 19.6 }}
      >
        {sub}
      </Text>
      <View
        className={cn(
          'mt-[14px] items-center rounded-pill p-[12px]',
          dark ? 'bg-accent-100' : 'bg-accent-800',
        )}
      >
        <Text
          className={cn('font-medium', dark ? 'text-accent-800' : 'text-accent-100')}
          style={{ fontSize: 16 }}
        >
          {cta}
        </Text>
      </View>
    </Tap>
  );
}

/** 01b · Lektion · Titelbild + Kacheln. */
export function LessonStartScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <Screen edgeToEdgeTop bottom={6} scroll>
      <View className="relative overflow-hidden" style={{ height: 212 }}>
        <NavCircle icon="close" style={{ position: 'absolute', left: 20, top: insets.top - 2 }} />
        <View className="absolute" style={{ left: 24, right: 24, bottom: 18 }}>
          <Kicker tracking={0.14}>{t('lesson.kicker')}</Kicker>
          <Text
            className="mt-[6px] font-medium text-accent-900"
            style={{ fontSize: 42, lineHeight: 41.2, letterSpacing: -1.26 }}
          >
            {t('lesson.title')}
          </Text>
        </View>
      </View>
      <View className="flex-1 px-[22px] pt-[16px]" style={{ rowGap: 12, minHeight: 0 }}>
        <LessonCard
          dark
          preview={<DotMatrix />}
          kicker={t('lesson.live.kicker')}
          badge={t('common.recommended')}
          title={t('lesson.live.title')}
          sub={t('lesson.live.sub')}
          cta={t('lesson.live.cta')}
          onPress={() => router.push('/(app)/live')}
        />
        <LessonCard
          preview={<ReadingCardPreview />}
          kicker={t('lesson.read.kicker')}
          title={t('lesson.read.title')}
          sub={t('lesson.read.sub')}
          cta={t('lesson.read.cta')}
          onPress={() => router.push('/(app)/reading')}
        />
        <LessonCard
          preview={<ChipsPreview />}
          kicker={t('lesson.practice.kicker')}
          title={t('lesson.practice.title')}
          sub={t('lesson.practice.sub')}
          cta={t('lesson.practice.cta')}
          onPress={() =>
            router.push({ pathname: '/(app)/exercise/preparing', params: { lesson: id } })
          }
        />
      </View>
    </Screen>
  );
}
