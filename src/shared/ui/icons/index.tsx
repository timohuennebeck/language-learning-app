/**
 * Icon set. Generic glyphs come from Heroicons (react-native-heroicons), sized and
 * stroked to match the design. Bespoke shapes that Heroicons doesn't carry
 * (drag handle, waveforms, call controls, Google mark) are drawn with react-native-svg
 * using the design's own paths.
 */
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon as HiCheck,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  Cog6ToothIcon,
  EyeIcon,
  PlusIcon,
  XMarkIcon,
} from 'react-native-heroicons/outline';
import { LockClosedIcon, PlayIcon, StarIcon as HiStar } from 'react-native-heroicons/solid';
import { View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

import { colors } from '@/shared/theme/tokens';

type IconProps = { size?: number; color?: string; strokeWidth?: number };

/** Back chevron inside the 32px nav circle (design: 11px, 1.9 stroke on a 12 box). */
export function BackIcon({ size = 12, color = colors.glyph, strokeWidth = 3.6 }: IconProps) {
  return <ChevronLeftIcon size={size} color={color} strokeWidth={strokeWidth} />;
}

export function ChevronRight({ size = 12, color = colors.faint, strokeWidth = 3.6 }: IconProps) {
  return <ChevronRightIcon size={size} color={color} strokeWidth={strokeWidth} />;
}

export function ChevronDown({
  size = 14,
  color = colors.accent[900],
  strokeWidth = 2.6,
}: IconProps) {
  return <ChevronDownIcon size={size} color={color} strokeWidth={strokeWidth} />;
}

export function ChevronUp({ size = 14, color = colors.accent[900], strokeWidth = 2.6 }: IconProps) {
  return (
    <View style={{ transform: [{ rotate: '180deg' }] }}>
      <ChevronDownIcon size={size} color={color} strokeWidth={strokeWidth} />
    </View>
  );
}

/** Close cross (design: 14px on a 20 box, 2px stroke). */
export function CloseIcon({ size = 16, color = colors.accent[900], strokeWidth = 2.6 }: IconProps) {
  return <XMarkIcon size={size} color={color} strokeWidth={strokeWidth} />;
}

export function CheckIcon({ size = 14, color = '#fff', strokeWidth = 3 }: IconProps) {
  return <HiCheck size={size} color={color} strokeWidth={strokeWidth} />;
}

export function PlusIconSm({
  size = 15,
  color = colors.accent[900],
  strokeWidth = 2.6,
}: IconProps) {
  return <PlusIcon size={size} color={color} strokeWidth={strokeWidth} />;
}

export function ArrowRight({ size = 18, color = colors.lilac, strokeWidth = 2 }: IconProps) {
  return <ArrowRightIcon size={size} color={color} strokeWidth={strokeWidth} />;
}

export function ArrowLeft({ size = 22, color = colors.accent[900], strokeWidth = 2.2 }: IconProps) {
  return <ArrowLeftIcon size={size} color={color} strokeWidth={strokeWidth} />;
}

export function Clock({ size = 17, color = colors.accent[800] }: IconProps) {
  return <ClockIcon size={size} color={color} strokeWidth={2.2} />;
}

export function Eye({ size = 20, color = colors.muted }: IconProps) {
  return <EyeIcon size={size} color={color} strokeWidth={1.8} />;
}

export function Play({ size = 14, color = '#fff' }: IconProps) {
  return <PlayIcon size={size} color={color} />;
}

export function Star({ size = 17, color = colors.accent[700] }: IconProps) {
  return <HiStar size={size} color={color} />;
}

export function Lock({ size = 12, color = colors.dim3 }: IconProps) {
  return <LockClosedIcon size={size} color={color} />;
}

/** Settings cog inside a nav circle. */
export function CogIcon({ size = 20, color = colors.glyph, strokeWidth = 1.8 }: IconProps) {
  return <Cog6ToothIcon size={size} color={color} strokeWidth={strokeWidth} />;
}

/** Muted microphone (call controls). */
export function MicSlash({ size = 26, color = colors.accent[900] }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 256 256" fill={color}>
      <Path d="M213.4 221.9a8 8 0 0 1-11.3-.6L164 178.7A79.4 79.4 0 0 1 136 207.6V232a8 8 0 0 1-16 0v-24.4A80.1 80.1 0 0 1 48 128a8 8 0 0 1 16 0 64 64 0 0 0 89.2 58.8l-11.9-13A47.6 47.6 0 0 1 128 176a48 48 0 0 1-48-48v-24.5L42.1 61.4a8 8 0 0 1 11.8-10.8l160 176a8 8 0 0 1-.5 11.3ZM176 128a8 8 0 0 0 0-16h-.5A48 48 0 0 0 80 64.4a8 8 0 0 0 2 6.3l86.6 95.2A63.4 63.4 0 0 0 192 128a8 8 0 0 0-16 0Z" />
    </Svg>
  );
}

/** Hang-up handset (rotated phone). */
export function PhoneEnd({ size = 34, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 256 256" fill={color}>
      <Path
        d="M231.59 175.11 176 149.61a16 16 0 0 0-16.9 2.3l-27.5 21.28a121.34 121.34 0 0 1-48.8-48.8l21.3-27.5a16 16 0 0 0 2.3-16.9l-25.5-55.6A16 16 0 0 0 63.6 15.1L26.7 24.6A16 16 0 0 0 15.3 40.2C19.2 148 108 236.8 215.8 240.7a16 16 0 0 0 15.6-11.4l9.5-36.9a16 16 0 0 0-9.31-17.29Z"
        transform="rotate(135 128 128)"
      />
    </Svg>
  );
}

/** Closed-captions glyph. */
export function Subtitles({ size = 26, color = colors.accent[900] }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 256 256" fill={color}>
      <Path d="M224 48H32a16 16 0 0 0-16 16v128a16 16 0 0 0 16 16h192a16 16 0 0 0 16-16V64a16 16 0 0 0-16-16Zm0 144H32V64h192v128ZM96 104a8 8 0 0 0-8-8H72a24 24 0 0 0-24 24v16a24 24 0 0 0 24 24h16a8 8 0 0 0 0-16H72a8 8 0 0 1-8-8v-16a8 8 0 0 1 8-8h16a8 8 0 0 0 8-8Zm112 0a8 8 0 0 0-8-8h-16a24 24 0 0 0-24 24v16a24 24 0 0 0 24 24h16a8 8 0 0 0 0-16h-16a8 8 0 0 1-8-8v-16a8 8 0 0 1 8-8h16a8 8 0 0 0 8-8Z" />
    </Svg>
  );
}

/** Info "i" in a circle (call top bar). */
export function InfoCircle({ size = 18, color = colors.accent[900] }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 256 256" fill={color}>
      <Path d="M128 24a104 104 0 1 0 104 104A104.1 104.1 0 0 0 128 24Zm0 192a88 88 0 1 1 88-88 88.1 88.1 0 0 1-88 88Zm16-40a8 8 0 0 1-8 8 16 16 0 0 1-16-16v-40a8 8 0 0 1 0-16 16 16 0 0 1 16 16v40a8 8 0 0 1 8 8ZM112 84a12 12 0 1 1 12 12 12 12 0 0 1-12-12Z" />
    </Svg>
  );
}

/** Microphone on the "Konversation starten" onboarding button. */
export function MicSmall({ size = 20, color = colors.accent[100] }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Rect x="7" y="2.5" width="6" height="10" rx="3" fill={color} />
      <Path
        d="M4.5 9.5a5.5 5.5 0 0011 0M10 15v3"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** Smartphone outline on the "Mit Telefonnummer" button. */
export function PhoneDevice({ size = 20, color = colors.accent[100] }: IconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M6.5 2.5h7a1.5 1.5 0 011.5 1.5v12a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 015 16V4a1.5 1.5 0 011.5-1.5zM9 15h2" />
    </Svg>
  );
}

export function GoogleLogo({ size = 19 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20">
      <Path
        d="M19.6 10.2c0-.7-.1-1.2-.2-1.8H10v3.5h5.5c-.1.9-.7 2.3-1.5 3.2l2.7 2.1c1.6-1.5 2.9-3.8 2.9-7z"
        fill="#4285F4"
      />
      <Path
        d="M10 20c2.7 0 5-.9 6.7-2.4l-2.7-2.1c-.9.6-2.1 1-4 1-2.6 0-4.8-1.7-5.6-4.1L1.6 14.5C3.3 17.8 6.4 20 10 20z"
        fill="#34A853"
      />
      <Path
        d="M4.4 12.4c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2L1.6 5.5C.9 6.9.5 8.4.5 10s.4 3.1 1.1 4.5l2.8-2.1z"
        fill="#FBBC05"
      />
      <Path
        d="M10 3.9c1.9 0 3.1.8 3.9 1.5l2.6-2.5C14.9 1.4 12.7.5 10 .5 6.4.5 3.3 2.7 1.6 5.5l2.8 2.9C5.2 5.6 7.4 3.9 10 3.9z"
        fill="#EA4335"
      />
    </Svg>
  );
}

/** Small 3-bar "speaking" glyph inside the 30px accent circle on the hero card. */
export function SpeakGlyph({ color = colors.accent[100] }: { color?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 2.5 }}>
      {[8, 14, 10].map((h, i) => (
        <View key={i} style={{ width: 3, height: h, borderRadius: 999, backgroundColor: color }} />
      ))}
    </View>
  );
}

/** Reset arrow (↺) shown on the word-builder retry circle. */
export function ResetGlyph({ size = 17, color = colors.muted }: IconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M3 12a9 9 0 1 0 3-6.7" />
      <Path d="M3 4v5h5" />
    </Svg>
  );
}
