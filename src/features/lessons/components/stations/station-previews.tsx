import { View } from 'react-native';

import type { StationKind } from '@/features/lessons/data/types';
import {
  CardFanPreview,
  ChipsPreview,
  DotMatrix,
  ReadingCardPreview,
} from '@/shared/components/previews';
import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/theme/tokens';
import { ArrowRight } from '@/shared/ui/icons';
import { Text } from '@/shared/ui/text';

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

/** Tiny preview at the right edge of a collapsed station row. */
export function RowPreview({ kind }: { kind: StationKind }) {
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

/** Large preview inside the expanded (dark) station card. */
export function ExpandedPreview({ kind }: { kind: StationKind }) {
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
