import { Platform } from 'react-native';

/** iOS 26+ renders the native tab bar as Liquid Glass and supports a bottom accessory above it. */
export const HAS_TAB_ACCESSORY = Platform.OS === 'ios' && Number(Platform.Version) >= 26;
