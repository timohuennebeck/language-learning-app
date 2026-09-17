import { useRef, useState, type ReactNode } from 'react';
import { ScrollView, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { Dots } from '@/shared/ui/Marks';
import { Tap } from '@/shared/ui/Tap';
import { Text } from '@/shared/ui/Text';

export type HeroCardData = {
  key: string;
  preview: ReactNode;
  kicker: string;
  title: string;
  cta: string;
  onPress?: () => void;
};

const GAP = 10;
const SIDE = 22;

type Props = {
  cards: HeroCardData[];
  className?: string;
  dotsClassName?: string;
  screenWidth: number;
};

/** Horizontally paged 248px cards (width = screen − 44) with pagination dots. */
export function HeroCarousel({
  cards,
  className,
  dotsClassName = 'mt-[12px]',
  screenWidth,
}: Props) {
  const [index, setIndex] = useState(0);
  const ref = useRef<ScrollView>(null);
  const cardWidth = screenWidth - 44;
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / (cardWidth + GAP));
    if (i !== index) setIndex(Math.max(0, Math.min(cards.length - 1, i)));
  };
  return (
    <View className={cn(className)}>
      <ScrollView
        ref={ref}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardWidth + GAP}
        decelerationRate="fast"
        onScroll={onScroll}
        scrollEventThrottle={32}
        contentContainerStyle={{ paddingHorizontal: SIDE, columnGap: GAP }}
      >
        {cards.map((c) => (
          <View
            key={c.key}
            className="items-center rounded-[26px] bg-surface px-[20px] pb-[22px] pt-[16px]"
            style={{ width: cardWidth, height: 248 }}
          >
            <View className="items-center justify-center" style={{ width: 200, height: 100 }}>
              {c.preview}
            </View>
            <Text
              className="mt-[10px] uppercase text-accent-800"
              style={{ fontSize: 11, letterSpacing: 1.54 }}
            >
              {c.kicker}
            </Text>
            <Text
              className="mb-[14px] mt-[4px] text-center font-medium text-accent-900"
              style={{ fontSize: 20, lineHeight: 24, letterSpacing: -0.4 }}
            >
              {c.title}
            </Text>
            <Tap
              haptic="medium"
              onPress={c.onPress}
              className="mt-auto items-center self-stretch rounded-pill bg-accent-800 p-[12px] active:opacity-90"
            >
              <Text className="font-medium text-accent-100" style={{ fontSize: 16 }}>
                {c.cta}
              </Text>
            </Tap>
          </View>
        ))}
      </ScrollView>
      <Dots
        count={cards.length}
        index={index}
        className={dotsClassName}
        onPress={(i) => ref.current?.scrollTo({ x: i * (cardWidth + GAP), animated: true })}
      />
    </View>
  );
}
