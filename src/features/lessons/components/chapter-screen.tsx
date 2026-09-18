import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ChapterChips } from '@/features/lessons/components/stations/chapter-chips';
import { StationCard } from '@/features/lessons/components/stations/station-card';
import { StationRow } from '@/features/lessons/components/stations/station-row';
import { useChapter } from '@/features/lessons/hooks/use-lessons';
import type { StationKind } from '@/features/lessons/data/schemas';
import { HomeHeader } from '@/shared/components/home-header';
import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/theme/tokens';
import { CheckIcon } from '@/shared/ui/icons';
import { Screen, TAB_TOP } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';

const DEFAULT_STATIONS: StationKind[] = ['read', 'cards', 'grammar', 'practice', 'live'];

function StepDot({ state, n }: { state: 'done' | 'current' | 'pending'; n: number }) {
  if (state === 'done') {
    return (
      <View className="h-[26px] w-[26px] items-center justify-center rounded-full bg-lavender3">
        <CheckIcon size={12} color={colors.accent[900]} strokeWidth={2.4} />
      </View>
    );
  }
  return (
    <View
      className={cn(
        'h-[26px] w-[26px] items-center justify-center rounded-full',
        state === 'current' ? 'bg-accent-800' : 'bg-surface2',
      )}
      style={state === 'current' ? { boxShadow: `0 0 0 3px ${colors.line}` } : undefined}
    >
      <Text
        className={cn('font-semibold', state === 'current' ? 'text-accent-100' : 'text-dim')}
        style={{ fontSize: 13 }}
      >
        {n}
      </Text>
    </View>
  );
}

/** 3b–3f · Kapitel with one station expanded (index via `?station=`). */
export function ChapterScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; station?: string }>();
  const chapter = useChapter(params.id ?? 'cafe');
  const stations = chapter.data?.stations ?? DEFAULT_STATIONS;
  const requested = params.station !== undefined ? Number(params.station) : chapter.data?.current;
  const current = Math.max(
    0,
    Math.min(stations.length - 1, Number.isFinite(requested) ? (requested as number) : 0),
  );
  const targets: Record<StationKind, () => void> = {
    read: () => router.push('/(app)/reading'),
    cards: () => router.push('/(app)/flashcards'),
    grammar: () => router.push('/(app)/grammar'),
    practice: () => router.push('/(app)/exercise/preparing'),
    live: () => router.push('/(app)/live'),
  };

  return (
    <Screen top={TAB_TOP} bottom={6} scroll>
      <View className="flex-1 px-[22px]" style={{ minHeight: 0 }}>
        <HomeHeader />
        <ChapterChips className="mt-[14px]" />
        <View className="mt-[16px] flex-row items-end justify-between" style={{ columnGap: 14 }}>
          <View className="flex-1" style={{ minWidth: 0 }}>
            <Text
              className="font-medium text-accent-900"
              style={{ fontSize: 32, lineHeight: 32, letterSpacing: -0.96 }}
            >
              {t('chapter.title')}
            </Text>
            <Text className="mt-[5px] text-muted" style={{ fontSize: 14.5 }}>
              {t('chapter.station', { n: current + 1 })}
            </Text>
          </View>
          <View className="flex-row items-center" style={{ columnGap: 7 }}>
            {stations.map((_, i) => (
              <StepDot
                key={i}
                n={i + 1}
                state={i < current ? 'done' : i === current ? 'current' : 'pending'}
              />
            ))}
          </View>
        </View>
        <View className="mt-[18px] flex-1" style={{ rowGap: 10, minHeight: 0 }}>
          {stations.map((kind, i) =>
            i === current ? (
              <StationCard key={kind} kind={kind} onPress={targets[kind]} />
            ) : (
              <StationRow
                key={kind}
                kind={kind}
                index={i}
                done={i < current}
                onPress={() => router.setParams({ station: String(i) })}
              />
            ),
          )}
        </View>
      </View>
    </Screen>
  );
}
