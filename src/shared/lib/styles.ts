import { Platform } from 'react-native';

/** Hides the browser focus ring on web; the design draws its own focus states. */
export const NO_OUTLINE = Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null;

/** Outer ring (selection / hairline border) drawn as a box shadow so it never affects layout. */
export const ring = (width: number, color: string) => `0 0 0 ${width}px ${color}`;

/** Inset ring drawn inside the element's bounds (empty radios, outlined chips). */
export const insetRing = (width: number, color: string) => `inset 0 0 0 ${width}px ${color}`;
