import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/theme/tokens';
import { Gradient, HEADER_GRADIENT } from '@/shared/ui/gradient';
import { NavCircle } from '@/shared/ui/nav-circle';
import { Text } from '@/shared/ui/text';

type Props = {
  /** Close (X) or back chevron in the top-left. */
  left?: 'close' | 'back';
  onLeftPress?: () => void;
  /** Centered title next to the left control (compact 16px bar). */
  title?: string;
  /** Background of the nav circle: paper (#fbfbff) or translucent white. */
  circle?: 'paper' | 'translucent';
  children?: ReactNode;
  className?: string;
  /** Bottom padding of the gradient block. */
  paddingBottom?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Top gradient block (#e7e5fe → #f3f5fe) that bleeds under the status bar and hosts a
 * nav circle plus the screen's Pip illustration.
 */
export function GradientHeader({
  left = 'close',
  onLeftPress,
  title,
  circle = 'paper',
  children,
  className,
  paddingBottom = 22,
  style,
}: Props) {
  const insets = useSafeAreaInsets();
  const circleBg = circle === 'paper' ? colors.paper : 'rgba(255,255,255,.7)';
  return (
    <Gradient
      {...HEADER_GRADIENT}
      className={cn('items-center overflow-hidden px-[22px]', className)}
      style={[{ paddingTop: insets.top - 4, paddingBottom }, style]}
    >
      {title ? (
        <View className="h-[40px] w-full flex-row items-center" style={{ columnGap: 12 }}>
          <NavCircle icon={left} onPress={onLeftPress} style={{ backgroundColor: circleBg }} />
          <Text className="flex-1 text-center font-medium text-accent-900" style={{ fontSize: 16 }}>
            {title}
          </Text>
          <View style={{ width: 32 }} />
        </View>
      ) : (
        <NavCircle
          icon={left}
          onPress={onLeftPress}
          className="self-start"
          style={{ backgroundColor: circleBg }}
        />
      )}
      {children}
    </Gradient>
  );
}
