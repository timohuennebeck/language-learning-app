import { View } from 'react-native';

import { colors } from '@/shared/theme/tokens';
import { SpeakGlyph } from '@/shared/ui/icons';
import { Text } from '@/shared/ui/text';

const shadow = { boxShadow: '0 4px 14px rgba(41,43,49,.08)' };

/** Pill of skeleton "text" used inside the preview cards. */
function Line({
  width,
  flex,
  h = 6,
  color = colors.line,
}: {
  width?: number | `${number}%`;
  flex?: boolean;
  h?: number;
  color?: string;
}) {
  return (
    <View
      style={{
        height: h,
        borderRadius: 999,
        backgroundColor: color,
        width,
        flex: flex ? 1 : undefined,
      }}
    />
  );
}

/** Chat bubble preview: "Ça te dit ?" with two skeleton lines, on a tilted backing card. */
export function TalkPreview() {
  return (
    <View style={{ width: 200 }}>
      <View
        className="absolute rounded-[20px] bg-lavender"
        style={{ left: 12, right: 12, top: -7, height: '100%', transform: [{ rotate: '-3.5deg' }] }}
      />
      <View
        className="flex-row items-center rounded-[20px] bg-paper px-[14px] py-[12px]"
        style={{ columnGap: 11, ...shadow }}
      >
        <View className="h-[30px] w-[30px] items-center justify-center rounded-full bg-accent-800">
          <SpeakGlyph />
        </View>
        <View className="flex-1" style={{ rowGap: 6 }}>
          <Text className="font-medium text-accent-900" style={{ fontSize: 14 }}>
            Ça te dit ?
          </Text>
          <Line />
          <Line width="62%" />
        </View>
      </View>
    </View>
  );
}

/** Reading preview: skeleton paragraph with a highlighted word pill. */
export function ReadPreview({ word = 'marché' }: { word?: string }) {
  return (
    <View style={{ width: 200, height: 96 }}>
      <View
        className="absolute rounded-[20px] bg-lavender"
        style={{ left: 12, right: 12, top: 0, height: 92, transform: [{ rotate: '-3.5deg' }] }}
      />
      <View
        className="absolute left-0 right-0 rounded-[20px] bg-paper px-[14px] py-[12px]"
        style={{ top: 6, rowGap: 7, ...shadow }}
      >
        <View className="flex-row items-center" style={{ columnGap: 6 }}>
          <Line width={40} />
          <View className="rounded-pill bg-accent-800 px-[8px] py-[2px]">
            <Text className="font-medium text-accent-100" style={{ fontSize: 12 }}>
              {word}
            </Text>
          </View>
          <Line flex />
        </View>
        <Line />
        <Line width="88%" />
        <Line width="58%" />
      </View>
    </View>
  );
}

/** Exercise preview: struck sentence over the corrected one. */
export function ExercisePreview({ wrong, right }: { wrong: string; right: string }) {
  return (
    <View className="flex-row justify-center" style={{ width: 200 }}>
      <View
        className="absolute rounded-[20px] bg-lavender"
        style={{ left: 14, right: 14, top: -6, height: '100%', transform: [{ rotate: '-3.5deg' }] }}
      />
      <View
        className="w-full items-center rounded-[20px] bg-paper px-[14px] py-[10px]"
        style={{ rowGap: 3, ...shadow }}
      >
        <Text
          className="text-center text-faint line-through"
          style={{ fontSize: 15.5, lineHeight: 19.4 }}
        >
          {wrong}
        </Text>
        <Text
          className="text-center font-medium text-accent-900"
          style={{ fontSize: 15.5, lineHeight: 19.4 }}
        >
          {right}
        </Text>
      </View>
    </View>
  );
}

/** Flashcards preview: three fanned cards with the front card showing a word pair. */
export function CardsPreview({
  front = 'le café',
  back = 'das Café',
}: {
  front?: string;
  back?: string;
}) {
  return (
    <View style={{ width: 200, height: 84 }}>
      <View
        className="absolute rounded-[16px] bg-lavender"
        style={{ left: 8, top: 10, width: 106, height: 66, transform: [{ rotate: '-11deg' }] }}
      />
      <View
        className="absolute rounded-[16px] bg-lavender"
        style={{ right: 8, top: 10, width: 106, height: 66, transform: [{ rotate: '11deg' }] }}
      />
      <View
        className="absolute items-center justify-center rounded-[16px] bg-paper"
        style={{
          left: 47,
          top: 4,
          width: 106,
          height: 72,
          rowGap: 2,
          boxShadow: '0 4px 14px rgba(41,43,49,.10)',
        }}
      >
        <Text className="text-accent-900" style={{ fontSize: 21 }}>
          {front}
        </Text>
        <Text className="text-muted" style={{ fontSize: 13 }}>
          {back}
        </Text>
      </View>
    </View>
  );
}

/** Reading preview variant used inside the chapter/lesson cards (96px, two pills). */
export function ReadingCardPreview({ height = 96 }: { height?: number }) {
  return (
    <View style={{ width: '100%', height }}>
      <View
        className="absolute rounded-[16px] bg-lavender2"
        style={{ left: 12, right: 12, top: 8, bottom: 0, transform: [{ rotate: '-2.5deg' }] }}
      />
      <View
        className="absolute left-0 right-0 top-0 justify-center rounded-[16px] bg-paper px-[14px] py-[18px]"
        style={{ bottom: 8, rowGap: 7, ...shadow }}
      >
        <View className="flex-row items-center" style={{ columnGap: 7 }}>
          <Line width={32} h={5} />
          <View className="rounded-pill bg-accent-800 px-[9px] py-[2px]">
            <Text className="font-medium text-accent-100" style={{ fontSize: 12 }}>
              un café
            </Text>
          </View>
          <Line flex h={5} />
        </View>
        <Line h={5} />
        <View className="flex-row items-center" style={{ columnGap: 7 }}>
          <View className="rounded-pill bg-lavender px-[9px] py-[2px]">
            <Text className="text-accent-900" style={{ fontSize: 12 }}>
              {"s'il vous plaît"}
            </Text>
          </View>
          <Line flex h={5} />
        </View>
      </View>
    </View>
  );
}

/** Flashcard fan used inside the expanded chapter card (92px). */
export function CardFanPreview() {
  return (
    <View style={{ width: '100%', height: 92 }}>
      <View
        className="absolute rounded-[16px] bg-lavender2"
        style={{ left: 14, right: 14, top: 8, bottom: 0, transform: [{ rotate: '-2.5deg' }] }}
      />
      <View
        className="absolute left-0 right-0 top-0 items-center justify-center rounded-[16px] bg-paper"
        style={{ bottom: 8, rowGap: 4, ...shadow }}
      >
        <Text className="text-faint" style={{ fontSize: 13 }}>
          le café
        </Text>
        <Text className="font-medium text-accent-900" style={{ fontSize: 20, letterSpacing: -0.3 }}>
          der Kaffee
        </Text>
      </View>
    </View>
  );
}

/** Word chips preview ("je voudrais un café au lait"). */
export function ChipsPreview({ dark = false }: { dark?: boolean }) {
  const chips = [{ t: 'je' }, { t: 'voudrais' }, { t: 'un café', hi: true }, { t: 'au lait' }];
  return (
    <View className="flex-row flex-wrap content-center" style={{ gap: 7, minHeight: 80 }}>
      {chips.map((c) => (
        <View
          key={c.t}
          className="rounded-[13px] px-[12px] py-[8px]"
          style={{
            backgroundColor: c.hi ? (dark ? colors.lilac : colors.accent[800]) : colors.paper,
          }}
        >
          <Text
            style={{
              fontSize: 14.5,
              color: c.hi && !dark ? colors.accent[100] : colors.accent[900],
            }}
          >
            {c.t}
          </Text>
        </View>
      ))}
    </View>
  );
}

const DOT_COLUMNS = [3, 5, 8, 4, 9, 6, 8, 3, 10, 5, 7, 4, 8, 5, 6, 3];

/** 16×10 dot matrix used as the live-conversation preview on accent cards. */
export function DotMatrix() {
  return (
    <View
      className="mt-[6px] flex-row items-center justify-between"
      style={{ minHeight: 80, columnGap: 4 }}
    >
      {DOT_COLUMNS.map((filled, c) => (
        <View key={c} className="justify-center" style={{ height: 64, rowGap: 4 }}>
          {Array.from({ length: 10 }, (_, r) => (
            <View
              key={r}
              style={{
                width: 5,
                height: 5,
                borderRadius: 3,
                backgroundColor: r < filled ? colors.accent[100] : 'rgba(245,244,255,.32)',
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}
