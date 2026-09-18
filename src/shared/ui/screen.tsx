import type { ReactNode } from 'react';
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
  /**
   * Root of a bottom tab. The native tab container already insets its content below the status
   * bar, so no top padding is added on device; the web preview keeps a simulated inset.
   */
  tabRoot?: boolean;
  /** Keep the footer above the keyboard (screens with text inputs). */
  keyboard?: boolean;
  /**
   * Pinned bottom actions. When set, `children` scroll and the footer always stays in view,
   * so a primary button is never pushed off small screens.
   */
  footer?: ReactNode;
};

/** Full-height screen container with the app background and safe-area aware padding. */
export function Screen({
  className,
  style,
  top = 0,
  bottom = 0,
  scroll = false,
  edgeToEdgeTop = false,
  tabRoot = false,
  keyboard = false,
  footer,
  children,
  ...props
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const paddingTop = edgeToEdgeTop
    ? 0
    : tabRoot
      ? Platform.OS === 'web'
        ? insets.top - 16
        : 0
      : insets.top + top;
  const paddingBottom = insets.bottom + bottom;
  let body: ReactNode;
  if (footer) {
    body = (
      <View
        className={cn('flex-1 bg-bg', className)}
        style={[{ paddingTop, paddingBottom }, style]}
        {...props}
      >
        <ScrollView
          className="flex-1"
          // Bleed the scroll area past the horizontal padding so shadows/rings are not clipped.
          style={{ marginHorizontal: -24 }}
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
        {footer}
      </View>
    );
  } else if (scroll) {
    body = (
      <ScrollView
        className="flex-1 bg-bg"
        contentContainerStyle={{ flexGrow: 1, paddingTop, paddingBottom }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View className={cn('flex-1', className)} style={style} {...props}>
          {children}
        </View>
      </ScrollView>
    );
  } else {
    body = (
      <View
        className={cn('flex-1 overflow-hidden bg-bg', className)}
        style={[{ paddingTop, paddingBottom }, style]}
        {...props}
      >
        {children}
      </View>
    );
  }
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
