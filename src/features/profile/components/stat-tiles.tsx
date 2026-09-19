import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/theme/tokens';
import { Ring } from '@/shared/ui/ring';
import { Text } from '@/shared/ui/text';

interface StatTile {
  n: number;
  pct: number;
  label: string;
  sub: string;
}

/** Two side-by-side stat tiles with a progress ring and a big number. */
export function StatTiles({ tiles, className }: { tiles: StatTile[]; className?: string }) {
  return (
    <View className={cn('flex-row', className)} style={{ columnGap: 12 }}>
      {tiles.map((tile) => (
        <View key={tile.label} className="flex-1 rounded-[24px] bg-surface2 p-[18px]">
          <View className="flex-row items-center" style={{ columnGap: 12 }}>
            <Ring
              size={38}
              stroke={5}
              progress={tile.pct}
              trackColor={colors.track4}
              color={colors.accent[600]}
            />
            <Text
              className="font-medium text-accent-900"
              style={{ fontSize: 32, lineHeight: 32, letterSpacing: -0.96 }}
            >
              {tile.n}
            </Text>
          </View>
          <Text className="mt-[12px] text-sub" style={{ fontSize: 14.5 }}>
            {tile.label}
          </Text>
          <Text className="mt-[4px] text-faint" style={{ fontSize: 12.5 }}>
            {tile.sub}
          </Text>
        </View>
      ))}
    </View>
  );
}
