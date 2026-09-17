import { QueryClientProvider } from '@tanstack/react-query';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  SafeAreaInsetsContext,
  SafeAreaProvider,
  type EdgeInsets,
} from 'react-native-safe-area-context';

import { SessionProvider } from '@/features/auth/lib/session-store';
import { queryClient } from '@/shared/lib/query-client';

import '@/shared/lib/i18n';

/**
 * On web there are no device insets; we mimic an iPhone 16 Pro (dynamic island, home
 * indicator) so layouts and the visual-regression screenshots match the design frame.
 */
const WEB_INSETS: EdgeInsets = { top: 60, bottom: 34, left: 0, right: 0 };

function InsetsForWeb({ children }: { children: React.ReactNode }) {
  if (Platform.OS !== 'web') return <>{children}</>;
  return (
    <SafeAreaInsetsContext.Provider value={WEB_INSETS}>{children}</SafeAreaInsetsContext.Provider>
  );
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <InsetsForWeb>
          <QueryClientProvider client={queryClient}>
            <SessionProvider>{children}</SessionProvider>
          </QueryClientProvider>
        </InsetsForWeb>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
