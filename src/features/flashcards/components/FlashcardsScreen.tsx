import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useDeck } from '@/features/flashcards/hooks/useDeck';
import { haptic } from '@/shared/lib/haptics';
import { colors } from '@/shared/theme/tokens';
import { Illustration } from '@/shared/ui/Illustration';
import { CheckIcon, CloseIcon } from '@/shared/ui/icons';
import { Screen } from '@/shared/ui/Screen';
import { Tap } from '@/shared/ui/Tap';
import { Text } from '@/shared/ui/Text';
import { TopBar } from '@/shared/ui/TopBar';

const THRESHOLD = 110;

/** 04 · Karteikarten · Karte ziehen (swipe right = known, left = again, tap = flip). */
export function FlashcardsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const deck = useDeck('cafe');
  const cards = deck.data?.cards ?? [];
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [again, setAgain] = useState(0);
  const [jumps, setJumps] = useState(0);
  const dx = useSharedValue(0);
  const flip = useSharedValue(0);
  const leaving = useSharedValue(0);

  const card = cards[idx];

  const commit = (dir: 1 | -1) => {
    haptic(dir > 0 ? 'success' : 'light');
    if (dir > 0) {
      setKnown((k) => k + 1);
      setJumps((j) => j + 1);
    } else setAgain((a) => a + 1);
    setIdx((i) => i + 1);
    setFlipped(false);
    dx.value = 0;
    leaving.value = 0;
    flip.value = 0;
  };

  const flyOut = (dir: 1 | -1) => {
    leaving.value = dir;
    dx.value = withTiming(dir * 520, { duration: 260 }, () => runOnJS(commit)(dir));
  };

  const onFlip = () => {
    haptic('light');
    flip.value = withSequence(
      withTiming(90, { duration: 180, easing: Easing.out(Easing.ease) }, () =>
        runOnJS(setFlipped)(!flipped),
      ),
      withTiming(-90, { duration: 0 }),
      withTiming(0, { duration: 180, easing: Easing.out(Easing.ease) }),
    );
  };

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      dx.value = e.translationX;
    })
    .onEnd(() => {
      if (dx.value > THRESHOLD) runOnJS(flyOut)(1);
      else if (dx.value < -THRESHOLD) runOnJS(flyOut)(-1);
      else dx.value = withTiming(0, { duration: 260 });
    });
  const tap = Gesture.Tap().onEnd(() => runOnJS(onFlip)());
  const gesture = Gesture.Exclusive(pan, tap);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: dx.value },
      { rotate: `${leaving.value ? leaving.value * 18 : dx.value / 18}deg` },
      { perspective: 1000 },
      { rotateY: `${flip.value}deg` },
    ],
  }));
  const leftStamp = useAnimatedStyle(() => ({
    opacity: dx.value < 0 ? Math.min(-dx.value / 110, 1) : 0,
  }));
  const rightStamp = useAnimatedStyle(() => ({
    opacity: dx.value > 0 ? Math.min(dx.value / 110, 1) : 0,
  }));
  const leftHint = useAnimatedStyle(() => ({
    color: dx.value < -40 ? colors.sub : colors.neutral[400],
  }));
  const rightHint = useAnimatedStyle(() => ({
    color: dx.value > 40 ? colors.accent[700] : colors.neutral[400],
  }));

  return (
    <Screen top={0} bottom={6} className="px-[22px]">
      <TopBar
        left="close"
        title={t('flashcards.title')}
        titleSize={20}
        right={
          <Text className="text-sub" style={{ fontSize: 15, fontVariant: ['tabular-nums'] }}>
            {Math.min(idx + 1, cards.length)} / {cards.length}
          </Text>
        }
      />
      <View className="mt-[14px] flex-row" style={{ columnGap: 4 }}>
        {cards.map((c, i) => (
          <View
            key={c.id}
            className="h-[4px] flex-1 rounded-[2px]"
            style={{
              backgroundColor:
                i < idx ? colors.accent[800] : i === idx ? colors.accent[400] : colors.neutral[200],
            }}
          />
        ))}
      </View>
      <View className="mt-[22px] flex-row justify-between">
        <Animated.Text
          style={[
            {
              fontFamily: 'Inter-Regular',
              fontSize: 12,
              letterSpacing: 1.44,
              textTransform: 'uppercase',
            },
            leftHint,
          ]}
        >
          {t('flashcards.left')}
        </Animated.Text>
        <Animated.Text
          style={[
            {
              fontFamily: 'Inter-Regular',
              fontSize: 12,
              letterSpacing: 1.44,
              textTransform: 'uppercase',
            },
            rightHint,
          ]}
        >
          {t('flashcards.right')}
        </Animated.Text>
      </View>
      <View className="relative mt-[14px] flex-1" style={{ minHeight: 0 }}>
        {idx + 1 < cards.length ? (
          <View
            className="absolute rounded-[26px] bg-surface2"
            style={{ top: 16, left: 40, right: 40, bottom: 140, boxShadow: '0 0 0 1px #e4e7f5' }}
          />
        ) : null}
        {card ? (
          <GestureDetector gesture={gesture}>
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  top: 32,
                  left: 26,
                  right: 26,
                  bottom: 128,
                  borderRadius: 26,
                  backgroundColor: colors.surface,
                  padding: 26,
                  boxShadow: '0 0 0 1px #e4e7f5, 0 6px 18px rgba(41,43,49,.10)',
                },
                cardStyle,
              ]}
            >
              <View className="flex-1 justify-center" style={{ rowGap: 8 }}>
                <Text
                  className="font-medium text-accent-900"
                  style={{ fontSize: 40, lineHeight: 44, letterSpacing: -0.8 }}
                >
                  {flipped ? card.back : card.front}
                </Text>
                <Text className="text-sub" style={{ fontSize: 17 }}>
                  {flipped ? card.front : card.example}
                </Text>
              </View>
              <Text className="text-center text-muted" style={{ fontSize: 14 }}>
                {t('flashcards.flip')}
              </Text>
              <Animated.View
                style={[
                  {
                    position: 'absolute',
                    left: 22,
                    top: 22,
                    borderRadius: 999,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderWidth: 2,
                    borderColor: colors.faint,
                    transform: [{ rotate: '-10deg' }],
                  },
                  leftStamp,
                ]}
              >
                <Text
                  className="font-medium uppercase text-sub"
                  style={{ fontSize: 13, letterSpacing: 0.78 }}
                >
                  {t('flashcards.again')}
                </Text>
              </Animated.View>
              <Animated.View
                style={[
                  {
                    position: 'absolute',
                    right: 22,
                    top: 22,
                    borderRadius: 999,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderWidth: 2,
                    borderColor: colors.accent[600],
                    transform: [{ rotate: '10deg' }],
                  },
                  rightStamp,
                ]}
              >
                <Text
                  className="font-medium uppercase text-accent-700"
                  style={{ fontSize: 13, letterSpacing: 0.78 }}
                >
                  {t('flashcards.known')}
                </Text>
              </Animated.View>
            </Animated.View>
          </GestureDetector>
        ) : (
          <View
            className="absolute items-center justify-center rounded-[26px] bg-surface p-[26px]"
            style={{ top: 32, left: 26, right: 26, bottom: 128, rowGap: 6 }}
          >
            <Text
              className="font-medium text-accent-900"
              style={{ fontSize: 34, lineHeight: 34, letterSpacing: -1.02 }}
            >
              {t('flashcards.done')}
            </Text>
            <Text className="text-sub" style={{ fontSize: 16 }}>
              {t('flashcards.doneSub', { known, again })}
            </Text>
            <Tap
              haptic="light"
              onPress={() => {
                setIdx(0);
                setKnown(0);
                setAgain(0);
                setFlipped(false);
              }}
              className="mt-[14px] rounded-pill bg-accent-800 px-[18px] py-[10px]"
            >
              <Text className="font-medium text-accent-100" style={{ fontSize: 15 }}>
                {t('flashcards.restart')}
              </Text>
            </Tap>
          </View>
        )}
        <View
          pointerEvents="none"
          className="absolute items-center"
          style={{ left: '50%', bottom: -6, marginLeft: -48 }}
        >
          <Illustration key={jumps} name="pip-cheer-2" size={96} />
        </View>
      </View>
      <View className="flex-row items-center justify-center pt-[6px]" style={{ columnGap: 28 }}>
        <Tap
          haptic="light"
          onPress={() => card && flyOut(-1)}
          className="h-[68px] w-[68px] items-center justify-center rounded-full bg-surface"
        >
          <CloseIcon size={26} color={colors.sub} strokeWidth={2.2} />
        </Tap>
        <View style={{ width: 80 }} />
        <Tap
          haptic="success"
          onPress={() => (card ? flyOut(1) : router.back())}
          className="h-[68px] w-[68px] items-center justify-center rounded-full bg-accent-800"
        >
          <CheckIcon size={26} color={colors.accent[100]} strokeWidth={2.2} />
        </Tap>
      </View>
    </Screen>
  );
}
