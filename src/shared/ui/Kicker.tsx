import { cn } from '@/shared/lib/cn';
import { Text, type TextProps } from '@/shared/ui/Text';

type Props = TextProps & {
  /** Font size in px (design: 11, sometimes 12/13). */
  size?: number;
  /** Letter spacing as a fraction of the font size (design: .12em by default). */
  tracking?: number;
};

/** Uppercase micro-label ("01 LESEN", "SERIE", "LÜCKE FÜLLEN"). Color comes from className. */
export function Kicker({ size = 11, tracking = 0.12, className, style, ...props }: Props) {
  return (
    <Text
      className={cn('uppercase text-accent-800', className)}
      style={[{ fontSize: size, letterSpacing: Math.round(size * tracking * 100) / 100 }, style]}
      {...props}
    />
  );
}
