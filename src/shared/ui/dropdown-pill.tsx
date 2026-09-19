import { CaretDownIcon, CaretUpIcon } from 'phosphor-react-native';
import { colors } from '@/shared/theme/tokens';
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
        <CaretUpIcon size={14} color={colors.accent[900]} weight="bold" />
      ) : (
        <CaretDownIcon size={14} color={colors.accent[900]} weight="bold" />
      )}
    </Tap>
  );
}
