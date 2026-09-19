import Svg, { Path } from 'react-native-svg';

/**
 * Google's own four-colour mark for the "Mit Google anmelden" button. Not a Phosphor icon on
 * purpose: Phosphor's GoogleLogo is a single-colour outline, and Google's branding guidelines
 * require the official mark on a sign-in button.
 */
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
