import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { nextTime, recapWords } from '@/features/review/data/content';
import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/theme/tokens';
import { Checkbox } from '@/shared/ui/marks';
import { useGoToCourse } from '@/shared/hooks/use-back';
import { Button } from '@/shared/ui/button';
import { Screen } from '@/shared/ui/screen';
import { Tap } from '@/shared/ui/tap';
import { Text } from '@/shared/ui/text';
import { TopBar } from '@/shared/ui/top-bar';

type Tab = 'words' | 'next';

/** 3h · Rückblick · Wörter / Umschrieben. */
export function ReviewScreen() {
  const { t } = useTranslation();
  const goToCourse = useGoToCourse();
  const params = useLocalSearchParams<{ tab?: string }>();
  const [tab, setTab] = useState<Tab>(params.tab === 'next' ? 'next' : 'words');
  const [words, setWords] = useState(recapWords);
  const [picked, setPicked] = useState<number[]>([0, 1, 2, 3]);
  const selectedWords = words.filter((w) => w.state === 1).length;

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'words', label: t('review.tabWords'), count: words.length },
    { id: 'next', label: t('review.tabNext'), count: nextTime.length },
  ];

  return (
    <Screen top={0} bottom={6} className="px-[22px]">
      <TopBar left="close" title={t('review.title')} titleSize={20} />
      <Text className="mt-[8px] text-center text-sub" style={{ fontSize: 17 }}>
        {t('review.meta')}
      </Text>
      <Text
        className="mt-[22px] text-sub"
        style={{ fontSize: 15, lineHeight: 20.25, minHeight: 41 }}
      >
        {tab === 'words' ? t('review.leadWords') : t('review.leadNext')}
      </Text>
      <View className="mt-[14px] flex-row">
        {tabs.map((tb) => {
          const on = tb.id === tab;
          return (
            <Tap
              key={tb.id}
              haptic="selection"
              onPress={() => setTab(tb.id)}
              className="flex-1 flex-row items-center justify-center pb-[12px] pt-[10px]"
              style={{
                columnGap: 8,
                borderBottomWidth: 2,
                borderColor: on ? colors.accent[800] : colors.neutral[200],
              }}
            >
              <Text
                className={cn('font-medium', on ? 'text-accent-900' : 'text-muted')}
                style={{ fontSize: 16 }}
              >
                {tb.label}
              </Text>
              <View
                className={cn(
                  'min-w-[22px] items-center rounded-pill px-[7px] py-[2px]',
                  on ? 'bg-accent-800' : 'bg-neutral-200',
                )}
              >
                <Text
                  className={cn('font-medium', on ? 'text-accent-100' : 'text-muted')}
                  style={{ fontSize: 13, fontVariant: ['tabular-nums'] }}
                >
                  {tb.count}
                </Text>
              </View>
            </Tap>
          );
        })}
      </View>
      {tab === 'words' ? (
        <>
          <View className="mb-[6px] mt-[22px] flex-row items-baseline justify-between">
            <Text className="text-text" style={{ fontSize: 17 }}>
              {t('review.count', { n: words.length })}
            </Text>
            <Tap
              haptic="light"
              onPress={() =>
                setWords((ws) => ws.map((w) => (w.state === 0 ? { ...w, state: 1 } : w)))
              }
            >
              <Text className="text-accent-700" style={{ fontSize: 17 }}>
                {t('review.selectAll')}
              </Text>
            </Tap>
          </View>
          <View className="flex-1 overflow-hidden">
            {words.map((w, i) => (
              <Tap
                key={w.word}
                haptic="selection"
                disabled={w.state === 2}
                onPress={() =>
                  setWords((ws) =>
                    ws.map((x, j) => (j === i ? { ...x, state: x.state === 1 ? 0 : 1 } : x)),
                  )
                }
                className="flex-row items-center py-[14px]"
                style={{ columnGap: 16 }}
              >
                <Checkbox
                  checked={w.state > 0}
                  bg={w.state === 2 ? colors.neutral[300] : colors.accent[800]}
                />
                <View className="flex-1">
                  <Text className="text-text" style={{ fontSize: 19, lineHeight: 22.8 }}>
                    {w.word}
                  </Text>
                  <Text className="text-muted" style={{ fontSize: 15 }}>
                    {w.meaning}
                  </Text>
                </View>
                {w.state === 2 ? (
                  <Text className="text-faint" style={{ fontSize: 15 }}>
                    {t('review.saved')}
                  </Text>
                ) : null}
              </Tap>
            ))}
          </View>
          <Button
            className="mt-[14px]"
            height={63.9}
            size={18}
            haptic="success"
            labelClassName="font-medium"
            label={t('review.cta', { n: selectedWords })}
            onPress={() => goToCourse(1)}
          />
        </>
      ) : (
        <>
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 4, rowGap: 4 }}
            showsVerticalScrollIndicator={false}
          >
            {nextTime.map((n, i) => {
              const on = picked.includes(i);
              return (
                <Tap
                  key={n.word}
                  haptic="selection"
                  onPress={() => setPicked((p) => (on ? p.filter((x) => x !== i) : [...p, i]))}
                  className="flex-row items-start py-[14px]"
                  style={{ columnGap: 16 }}
                >
                  <Checkbox checked={on} className="mt-[4px]" />
                  <View className="flex-1" style={{ rowGap: 5, minWidth: 0 }}>
                    <Text className="text-faint" style={{ fontSize: 15, lineHeight: 20.25 }}>
                      „{n.said}“
                    </Text>
                    <Text
                      className="font-medium text-accent-900"
                      style={{ fontSize: 20, lineHeight: 25 }}
                    >
                      {n.word}
                    </Text>
                    <Text className="text-muted" style={{ fontSize: 15, lineHeight: 20.25 }}>
                      {n.de}
                    </Text>
                  </View>
                </Tap>
              );
            })}
          </ScrollView>
          <Button
            className="mt-[14px]"
            height={63.9}
            size={18}
            haptic="success"
            labelClassName="font-medium"
            label={t('review.cta', { n: picked.length })}
            onPress={() => goToCourse(1)}
          />
        </>
      )}
    </Screen>
  );
}
