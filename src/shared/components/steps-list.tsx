import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/theme/tokens';
import { CheckCircle } from '@/shared/ui/marks';
import { Spinner } from '@/shared/ui/spinner';
import { Text } from '@/shared/ui/text';

type StepState = 'done' | 'active' | 'pending';

/** Vertical checklist used by the "Pip is working" screens. */
export function StepsList({
  steps,
  className,
}: {
  steps: { label: string; state: StepState }[];
  className?: string;
}) {
  return (
    <View className={cn('self-stretch px-[6px]', className)} style={{ rowGap: 13 }}>
      {steps.map((s) => (
        <View key={s.label} className="flex-row items-center" style={{ columnGap: 12 }}>
          {s.state === 'done' ? (
            <CheckCircle size={26} bg={colors.accent[700]} stroke={2.6} iconSize={14} />
          ) : s.state === 'active' ? (
            <Spinner />
          ) : (
            <View
              className="h-[26px] w-[26px] rounded-full"
              style={{ borderWidth: 1.5, borderColor: colors.ring6 }}
            />
          )}
          <Text
            className={cn(
              s.state === 'done' ? 'text-ink' : s.state === 'active' ? 'text-muted' : 'text-faint',
            )}
            style={{ fontSize: 17, lineHeight: 23 }}
          >
            {s.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
