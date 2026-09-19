import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/theme/tokens';
import { Gradient } from '@/shared/ui/gradient';

/** Gap between the status bar and the pinned tab header. */
const TAB_ROOT_TOP = 0;
/** Gap between the status bar and a pushed page's top bar, so back/close circles clear the notch. */
export const PAGE_TOP = 8;
/** Space between a pinned header and the scrolling content, and the fade drawn over that content. */
const HEADER_GAP = 8;
const HEADER_FADE = 18;
/** Fade drawn over the bottom of scrolling content so it dissolves into the footer instead of cutting off. */
const FOOTER_FADE = 56;

interface ScreenProps extends ViewProps {
  className?: string;
  /** Extra top padding added on top of the safe-area inset and the page gap. */
  top?: number;
  /** Extra bottom padding added to the home-indicator inset (design screens use 34–42px on a 34px inset). */
  bottom?: number;
  /** Render inside a ScrollView (for screens taller than the viewport). */
  scroll?: boolean;
  /** Skip the safe-area top padding (screens that paint their own header area). */
  edgeToEdgeTop?: boolean;
  /**
   * Root of a bottom tab: safe-area top plus a fixed small gap, identical on every tab.
   */
  tabRoot?: boolean;
  /** Keep the footer above the keyboard (screens with text inputs). */
  keyboard?: boolean;
  /**
   * Pinned bottom actions. When set, `children` scroll and the footer always stays in view,
   * so a primary button is never pushed off small screens.
   */
  footer?: ReactNode;
  /** Pinned top section (the tab header). Content scrolls underneath it. */
  header?: ReactNode;
  /** Fade the scrolling content out towards the footer (long texts that end right above a button). */
  footerFade?: boolean;
}

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
  header,
  footerFade = false,
  children,
  ...props
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const paddingTop = edgeToEdgeTop ? 0 : insets.top + (tabRoot ? TAB_ROOT_TOP : PAGE_TOP + top);
  // Tab roots let the native tab bar inset their scroll view (content runs under the glass bar),
  // so they add no bottom padding of their own on device.
  const paddingBottom = tabRoot && Platform.OS !== 'web' ? 0 : insets.bottom + bottom;
  let body: ReactNode;
  if (footer || header) {
    body = (
      <View
        className={cn('flex-1 bg-bg', className)}
        style={[{ paddingTop, paddingBottom }, style]}
        {...props}
      >
        {header ? <View style={{ paddingBottom: HEADER_GAP }}>{header}</View> : null}
        <View className="flex-1" style={{ marginHorizontal: -24 }}>
          <ScrollView
            className="flex-1"
            // Bleed the scroll area past the horizontal padding so shadows/rings are not clipped.
            contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: 24,
              paddingBottom: footerFade ? FOOTER_FADE : 0,
            }}
            // Inside native tabs iOS insets the first scroll view for the tab bar and drives the
            // bar's transparent scroll-edge appearance; elsewhere the Screen pads for itself.
            contentInsetAdjustmentBehavior={tabRoot ? 'automatic' : 'never'}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
          {header ? (
            // Content slides under the pinned header through a short fade.
            <Gradient
              pointerEvents="none"
              colors={[colors.bg, 'rgba(243,245,254,0)']}
              className="absolute left-0 right-0 top-0"
              style={{ height: HEADER_FADE }}
            />
          ) : null}
          {footerFade ? (
            <Gradient
              pointerEvents="none"
              colors={['rgba(243,245,254,0)', colors.bg]}
              className="absolute bottom-0 left-0 right-0"
              style={{ height: FOOTER_FADE }}
            />
          ) : null}
        </View>
        {footer}
      </View>
    );
  } else if (scroll) {
    body = (
      <ScrollView
        className="flex-1 bg-bg"
        contentContainerStyle={{ flexGrow: 1, paddingTop, paddingBottom }}
        contentInsetAdjustmentBehavior="never"
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
