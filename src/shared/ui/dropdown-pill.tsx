import { ChevronDown, ChevronUp } from '@/shared/ui/icons';
import { Tap } from '@/shared/ui/tap';
import { Text } from '@/shared/ui/text';

interface Props {
  label: string;
  /** Flips the chevron while a picker is open. */
  open?: boolean;
  onPress?: () => void;
}

/** Surface pill with a label and a chevron ("Französisch · A2", the terms document picker). */
export function DropdownPill({ label, open = false, onPress }: Props) {
  return (
    <Tap
      haptic="light"
      onPress={onPress}
      className="flex-row items-center rounded-pill bg-surface px-[12px] py-[6px]"
      style={{ columnGap: 6 }}
    >
      <Text className="text-accent-900" style={{ fontSize: 15 }}>
        {label}
      </Text>
      {open ? (
        <ChevronUp size={14} strokeWidth={2.4} />
      ) : (
        <ChevronDown size={14} strokeWidth={2.4} />
      )}
    </Tap>
  );
}
