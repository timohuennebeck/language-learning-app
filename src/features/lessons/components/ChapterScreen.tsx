import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  CardFanPreview,
  ChipsPreview,
  DotMatrix,
  ReadingCardPreview,
} from '@/features/lessons/components/Previews';
import { useChapter } from '@/features/lessons/hooks/useLessons';
import type { StationKind } from '@/features/lessons/data/schemas';
import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/theme/tokens';
import { Avatar, Illustration } from '@/shared/ui/Illustration';
import { ArrowRight, CheckIcon, ChevronDown, Lock } from '@/shared/ui/icons';
import { Screen } from '@/shared/ui/Screen';
import { Tap } from '@/shared/ui/Tap';
import { Text } from '@/shared/ui/Text';

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

function Pill({ label, strike }: { label: string; strike?: boolean }) {
  return (
    <View className="rounded-pill bg-paper px-[9px] py-[4px]">
      <Text
        className={cn(strike ? 'text-faint line-through' : 'text-accent-700')}
        style={{ fontSize: 12.5 }}
      >
        {label}
      </Text>
    </View>
  );
}

function RowPreview({ kind }: { kind: StationKind }) {
  switch (kind) {
    case 'read':
      return (
        <View style={{ width: 52, rowGap: 4 }}>
          <View className="h-[5px] rounded-[4px] bg-lavender3" />
          <View className="h-[5px] rounded-[4px] bg-lavender3" />
          <View className="h-[5px] w-[60%] rounded-[4px] bg-lavender3" />
        </View>
      );
    case 'cards':
      return (
        <View className="flex-row" style={{ columnGap: 4 }}>
          <Pill label="le café" />
          <Pill label="+17" />
        </View>
      );
    case 'grammar':
      return (
        <View className="flex-row items-center" style={{ columnGap: 4 }}>
          <Pill label="tu" strike />
          <Pill label="vous" />
        </View>
      );
    case 'practice':
      return (
        <View className="flex-row" style={{ columnGap: 4 }}>
          <Pill label="voudrais" />
          <Pill label="+4" />
        </View>
      );
    case 'live':
      return null;
  }
}

function ExpandedPreview({ kind }: { kind: StationKind }) {
  switch (kind) {
    case 'read':
      return <ReadingCardPreview />;
    case 'cards':
      return <CardFanPreview />;
    case 'grammar':
      return (
        <View style={{ rowGap: 10 }}>
          <View className="flex-row items-center" style={{ columnGap: 8 }}>
            <View
              className="rounded-[13px] px-[12px] py-[7px]"
              style={{ backgroundColor: 'rgba(245,244,255,.14)' }}
            >
              <Text className="text-lilac line-through" style={{ fontSize: 14.5 }}>
                tu veux
              </Text>
            </View>
            <ArrowRight size={18} color={colors.lilac} />
            <View className="rounded-[13px] bg-accent-100 px-[12px] py-[7px]">
              <Text className="font-medium text-accent-900" style={{ fontSize: 14.5 }}>
                vous voulez
              </Text>
            </View>
          </View>
          <View className="flex-row items-center" style={{ columnGap: 7 }}>
            {['un café', '?'].map((x) => (
              <View key={x} className="rounded-[13px] bg-paper px-[12px] py-[7px]">
                <Text className="text-accent-900" style={{ fontSize: 14.5 }}>
                  {x}
                </Text>
              </View>
            ))}
          </View>
        </View>
      );
    case 'practice':
      return <ChipsPreview dark />;
    case 'live':
      return <DotMatrix />;
  }
}

/** 3b–3f · Kapitel with one station expanded (index via `?station=`). */
export function ChapterScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; station?: string }>();
  const chapter = useChapter(params.id ?? 'cafe');
  const stations: StationKind[] = chapter.data?.stations ?? [
    'read',
    'cards',
    'grammar',
    'practice',
    'live',
  ];
  const current = Math.max(0, Math.min(4, Number(params.station ?? chapter.data?.current ?? 0)));
  const chapters = t('chapter.chapters', { returnObjects: true }) as string[];
  const targets: Record<StationKind, () => void> = {
    read: () => router.push('/(app)/reading'),
    cards: () => router.push('/(app)/flashcards'),
    grammar: () => router.push('/(app)/grammar'),
    practice: () => router.push('/(app)/exercise/preparing'),
    live: () => router.push('/(app)/live'),
  };

  return (
    <Screen top={-2} bottom={0} scroll>
      <View className="flex-1 px-[18px]" style={{ minHeight: 0 }}>
        <View className="h-[38px] flex-row items-center justify-between">
          <Tap haptic="light" onPress={() => router.push('/(app)/profile')}>
            <Avatar size={34} />
          </Tap>
          <Tap
            haptic="light"
            onPress={() => router.push('/(app)/languages')}
            className="flex-row items-center rounded-pill bg-surface px-[12px] py-[6px]"
            style={{ columnGap: 6 }}
          >
            <Text className="text-accent-900" style={{ fontSize: 14 }}>
              {t('chapter.languagePill')}
            </Text>
            <ChevronDown size={13} strokeWidth={2.4} />
          </Tap>
        </View>
        <View className="mt-[14px] flex-row overflow-hidden" style={{ columnGap: 8 }}>
          <Tap
            haptic="selection"
            className="flex-row items-center rounded-pill bg-surface2 px-[13px] py-[8px]"
            style={{ columnGap: 6 }}
          >
            <CheckIcon size={12} color={colors.accent[600]} strokeWidth={2.3} />
            <Text className="text-muted" style={{ fontSize: 13.5 }}>
              {chapters[0]}
            </Text>
          </Tap>
          <Tap haptic="selection" className="rounded-pill bg-accent-800 px-[15px] py-[8px]">
            <Text className="text-accent-100" style={{ fontSize: 13.5 }}>
              {chapters[1]}
            </Text>
          </Tap>
          <Tap
            haptic="selection"
            className="flex-row items-center rounded-pill bg-surface2 px-[13px] py-[8px]"
            style={{ columnGap: 6 }}
          >
            <Lock size={12} />
            <Text className="text-dim3" style={{ fontSize: 13.5 }} numberOfLines={1}>
              {chapters[2]}
            </Text>
          </Tap>
        </View>
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
          {stations.map((kind, i) => {
            const state = i < current ? 'done' : i === current ? 'current' : 'pending';
            const base = `chapter.${kind}`;
            if (state === 'current') {
              return (
                <View
                  key={kind}
                  className="relative flex-1 overflow-hidden rounded-[26px] bg-accent-800 px-[18px] pb-[16px] pt-[18px]"
                  style={{ boxShadow: '0 14px 32px rgba(41,43,49,.2)', minHeight: 268 }}
                >
                  <View className="flex-row items-center justify-between">
                    <Text
                      className="uppercase text-lilac"
                      style={{ fontSize: 11, letterSpacing: 1.32 }}
                    >
                      {t(`${base}.num`)}
                    </Text>
                    <View className="rounded-pill bg-accent-100 px-[10px] py-[4px]">
                      <Text
                        className="uppercase text-accent-800"
                        style={{ fontSize: 11, letterSpacing: 0.66 }}
                      >
                        {kind === 'live' ? t('chapter.go') : t('chapter.next')}
                      </Text>
                    </View>
                  </View>
                  <Text
                    className="mt-[10px] text-accent-100"
                    style={{ fontSize: 23, lineHeight: 25.3, letterSpacing: -0.46 }}
                  >
                    {t(`${base}.title`)}
                  </Text>
                  <View
                    className="mt-[12px] flex-1 justify-center"
                    style={{ rowGap: 12, minHeight: 0 }}
                  >
                    <ExpandedPreview kind={kind} />
                    <Text className="text-lilac" style={{ fontSize: 13 }}>
                      {t(`${base}.sub`)}
                    </Text>
                  </View>
                  <Tap
                    haptic="medium"
                    onPress={targets[kind]}
                    className="mt-[14px] h-[56px] items-center justify-center rounded-pill bg-accent-100 active:opacity-90"
                  >
                    <Text className="font-medium text-accent-800" style={{ fontSize: 17 }}>
                      {t(`${base}.cta`)}
                    </Text>
                  </Tap>
                </View>
              );
            }
            const done = state === 'done';
            return (
              <Tap
                key={kind}
                haptic="light"
                onPress={() => router.setParams({ station: String(i) })}
                className="relative flex-row items-center overflow-hidden rounded-[22px] bg-surface2 px-[16px] py-[12px]"
                style={{ columnGap: 14 }}
              >
                {kind === 'live' ? (
                  <Illustration
                    name="pip-mic"
                    size={74}
                    style={{ position: 'absolute', right: 20, bottom: -14, opacity: 0.9 }}
                  />
                ) : null}
                <View
                  className={cn(
                    'h-[34px] w-[34px] items-center justify-center rounded-full',
                    done ? 'bg-lavender3' : 'bg-surface2',
                  )}
                  style={done ? undefined : { boxShadow: `inset 0 0 0 1.5px ${colors.line2}` }}
                >
                  {done ? (
                    <CheckIcon size={14} color={colors.accent[900]} strokeWidth={2.4} />
                  ) : (
                    <Text className="font-semibold text-dim2" style={{ fontSize: 14 }}>
                      {i + 1}
                    </Text>
                  )}
                </View>
                <View className="flex-1" style={{ minWidth: 0 }}>
                  <Text className="font-medium text-accent-900" style={{ fontSize: 16.5 }}>
                    {t(`${base}.row`)}
                  </Text>
                  <Text className="text-muted" style={{ fontSize: 13 }}>
                    {kind === 'live'
                      ? t(`${base}.rowSub`)
                      : `${t(`${base}.rowSub`)} · ${done ? t('chapter.done') : t('chapter.after')}`}
                  </Text>
                </View>
                <RowPreview kind={kind} />
              </Tap>
            );
          })}
        </View>
      </View>
    </Screen>
  );
}
