import * as Application from 'expo-application';
import { Platform } from 'react-native';

/**
 * Stable install id sent with placement calls (docs/database-plan.md §3.6 "Placement limits").
 * Null on web and when the platform cannot provide one.
 */
export async function getDeviceId(): Promise<string | null> {
  try {
    if (Platform.OS === 'ios') return await Application.getIosIdForVendorAsync();
    if (Platform.OS === 'android') return Application.getAndroidId();
  } catch {
    /* fall through */
  }
  return null;
}
