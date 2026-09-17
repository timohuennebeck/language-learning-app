import { ScrollView, View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cn } from '@/shared/lib/cn';

export type ScreenProps = ViewProps & {
  className?: string;
  /** Extra top padding added to the safe-area inset (design screens use 56–60px on a 60px inset). */
  top?: number;
  /** Extra bottom padding added to the home-indicator inset (design screens use 34–42px on a 34px inset). */
  bottom?: number;
  /** Render inside a ScrollView (for screens taller than the viewport). */
  scroll?: boolean;
  /** Skip the safe-area top padding (screens that paint their own header area). */
  edgeToEdgeTop?: boolean;
};

/** Full-height screen container with the app background and safe-area aware padding. */
export function Screen({
  className,
  style,
  top = 0,
  bottom = 0,
  scroll = false,
  edgeToEdgeTop = false,
  children,
  ...props
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const padding = {
    paddingTop: edgeToEdgeTop ? 0 : insets.top + top,
    paddingBottom: insets.bottom + bottom,
  };
  if (scroll) {
    return (
      <ScrollView
        className="flex-1 bg-bg"
        contentContainerStyle={[{ flexGrow: 1 }, padding]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View className={cn('flex-1', className)} style={style} {...props}>
          {children}
        </View>
      </ScrollView>
    );
  }
  return (
    <View
      className={cn('flex-1 overflow-hidden bg-bg', className)}
      style={[padding, style]}
      {...props}
    >
      {children}
    </View>
  );
}

/** Safe-area top inset for screens that paint a header region edge-to-edge. */
export function useTopInset(extra = 0) {
  return useSafeAreaInsets().top + extra;
}
