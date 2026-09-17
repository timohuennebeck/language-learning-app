import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export type HapticKind =
  | 'selection'
  | 'light'
  | 'medium'
  | 'heavy'
  | 'soft'
  | 'rigid'
  | 'success'
  | 'warning'
  | 'error'
  | 'none';

const supported = Platform.OS === 'ios' || Platform.OS === 'android';

/** Fire-and-forget haptic feedback. No-op on web and when the kind is `none`. */
export function haptic(kind: HapticKind = 'light'): void {
  if (!supported || kind === 'none') return;
  const run = async () => {
    switch (kind) {
      case 'selection':
        return Haptics.selectionAsync();
      case 'light':
        return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      case 'medium':
        return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      case 'heavy':
        return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      case 'soft':
        return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      case 'rigid':
        return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
      case 'success':
        return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      case 'warning':
        return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      case 'error':
        return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };
  run().catch(() => {
    /* haptics are best-effort */
  });
}
