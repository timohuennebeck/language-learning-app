import { View } from 'react-native';

import { colors } from '@/shared/theme/tokens';
import { Illustration, type IllustrationName } from '@/shared/ui/illustration';
import { Ring } from '@/shared/ui/ring';
import { Text } from '@/shared/ui/text';

type Props = { progress: number; label: string; pip: IllustrationName; pipSize?: number };

/** 250px progress ring with Pip inside and a percentage pill at the bottom edge. */
export function LoadingRing({ progress, label, pip, pipSize = 148 }: Props) {
  return (
    <View className="items-center justify-center" style={{ width: 250, height: 250 }}>
      <Ring
        size={250}
        stroke={10}
        progress={progress}
        trackColor={colors.track}
        color={colors.accent[700]}
      >
        <Illustration name={pip} size={pipSize} />
      </Ring>
      <View
        className="absolute rounded-pill bg-accent-800 px-[16px] py-[7px]"
        style={{ bottom: -4 }}
      >
        <Text
          className="font-semibold text-accent-100"
          style={{ fontSize: 15, fontVariant: ['tabular-nums'] }}
        >
          {label}
        </Text>
      </View>
    </View>
  );
}
