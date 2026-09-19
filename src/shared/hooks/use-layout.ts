import { useCallback, useState } from 'react';
import type { LayoutChangeEvent, LayoutRectangle } from 'react-native';

/** The last measured layout of a view plus the `onLayout` handler that records it. */
export function useLayout() {
  const [layout, setLayout] = useState<LayoutRectangle>();
  const onLayout = useCallback((e: LayoutChangeEvent) => setLayout(e.nativeEvent.layout), []);
  return [layout, onLayout] as const;
}
