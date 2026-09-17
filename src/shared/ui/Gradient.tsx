import { LinearGradient, type LinearGradientProps } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';

// Let NativeWind resolve `className` on the gradient like on a View.
cssInterop(LinearGradient, { className: 'style' });

type Props = LinearGradientProps & { className?: string };

/** The recurring soft header gradient (#e7e5fe → #eceafe → #f3f5fe, top to bottom). */
export const HEADER_GRADIENT = {
  colors: ['#e7e5fe', '#eceafe', '#f3f5fe'] as const,
  locations: [0, 0.64, 1] as const,
};

/** The onboarding card gradient at 158deg (#eeedfe → #e7e5fe). */
export const CARD_GRADIENT = {
  colors: ['#eeedfe', '#e7e5fe'] as const,
  start: { x: 0.12, y: 0 },
  end: { x: 0.88, y: 1 },
};

export function Gradient(props: Props) {
  return <LinearGradient {...props} />;
}
