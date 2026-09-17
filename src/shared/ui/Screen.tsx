import { KeyboardAvoidingView, Platform, ScrollView, View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cn } from '@/shared/lib/cn';

type ScreenProps = ViewProps & {
  className?: string;
  /** Extra top padding added to the safe-area inset (design screens use 56–60px on a 60px inset). */
  top?: number;
  /** Extra bottom padding added to the home-indicator inset (design screens use 34–42px on a 34px inset). */
  bottom?: number;
  /** Render inside a ScrollView (for screens taller than the viewport). */
  scroll?: boolean;
  /** Skip the safe-area top padding (screens that paint their own header area). */
  edgeToEdgeTop?: boolean;
  /** Keep the footer above the keyboard (screens with text inputs). */
  keyboard?: boolean;
};

/** Full-height screen container with the app background and safe-area aware padding. */
export function Screen({
  className,
  style,
  top = 0,
  bottom = 0,
  scroll = false,
  edgeToEdgeTop = false,
  keyboard = false,
  children,
  ...props
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const padding = {
    paddingTop: edgeToEdgeTop ? 0 : insets.top + top,
    paddingBottom: insets.bottom + bottom,
  };
  const body = scroll ? (
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
  ) : (
    <View
      className={cn('flex-1 overflow-hidden bg-bg', className)}
      style={[padding, style]}
      {...props}
    >
      {children}
    </View>
  );
  if (!keyboard) return body;
  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {body}
    </KeyboardAvoidingView>
  );
}
