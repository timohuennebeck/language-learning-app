import { View } from 'react-native';

import { colors } from '@/shared/theme/tokens';
import { Illustration } from '@/shared/ui/illustration';
import { Ring } from '@/shared/ui/ring';
import { Text } from '@/shared/ui/text';

const RING = { size: 190, stroke: 8, badge: 36 };

type Props = {
  /** 0..1, drawn as the ring. */
  progress: number;
  /** Pill on the ring's bottom edge ("41 von 64"). */
  badge: string;
  title: string;
  sub: string;
};

/** Result header shared by the flashcards and exercise done screens: progress ring around Pip with the trophy, badge, headline, sub line. */
export function ResultHero({ progress, badge, title, sub }: Props) {
  return (
    <View className="mt-[24px] items-center">
      {/* The badge's centre sits on the ring line: half the badge height minus half the stroke. */}
      <View className="items-center" style={{ paddingBottom: RING.badge / 2 - RING.stroke / 2 }}>
        <Ring
          size={RING.size}
          stroke={RING.stroke}
          progress={progress}
          trackColor={colors.track3}
          color={colors.accent[700]}
        >
          <Illustration name="pip-trophy" size={112} />
        </Ring>
        <View
          className="absolute rounded-pill bg-accent-800 px-[16px]"
          style={{ bottom: 0, height: RING.badge, justifyContent: 'center' }}
        >
          <Text
            className="font-semibold text-accent-100"
            style={{ fontSize: 15, fontVariant: ['tabular-nums'] }}
          >
            {badge}
          </Text>
        </View>
      </View>
      <Text
        className="mt-[26px] text-center font-semibold text-ink"
        style={{ fontSize: 30, lineHeight: 34, letterSpacing: -0.9 }}
      >
        {title}
      </Text>
      <Text
        className="mt-[12px] px-[20px] text-center text-muted"
        style={{ fontSize: 17, lineHeight: 24 }}
      >
        {sub}
      </Text>
    </View>
  );
}
