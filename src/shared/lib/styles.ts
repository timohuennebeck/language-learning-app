import { Platform } from 'react-native';

/** Hides the browser focus ring on web; the design draws its own focus states. */
export const NO_OUTLINE = Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null;
