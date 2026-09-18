import { View } from 'react-native';

import { LoadingRing } from '@/shared/components/loading-ring';
import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/theme/tokens';
import type { IllustrationName } from '@/shared/ui/illustration';
import { CheckCircle } from '@/shared/ui/marks';
import { Spinner } from '@/shared/ui/spinner';
import { Text } from '@/shared/ui/text';

type StepState = 'done' | 'active' | 'pending';

/** Vertical checklist: check circles for done steps, a spinner on the active one. */
function StepsList({ steps }: { steps: { label: string; state: StepState }[] }) {
  return (
    <View className="self-stretch px-[6px]" style={{ rowGap: 13 }}>
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

type Props = {
  /** 0..1 shown on the ring and as its label ("62 %"). */
  progress: number;
  label: string;
  pip: IllustrationName;
  pipSize?: number;
  headline: string;
  headlineMaxWidth?: number;
  steps: string[];
  /** Index of the step in progress; earlier steps are done, later ones pending. */
  active: number;
  /** Muted line pinned under the centred block ("8 Sekunden übrig"). */
  footer: string;
};

/** "Pip is working" layout: loading ring, headline and checklist centred, a countdown below. */
export function ProgressChecklist({
  progress,
  label,
  pip,
  pipSize,
  headline,
  headlineMaxWidth,
  steps,
  active,
  footer,
}: Props) {
  return (
    <>
      <View className="flex-1 items-center justify-center" style={{ rowGap: 26 }}>
        <LoadingRing progress={progress} label={label} pip={pip} pipSize={pipSize} />
        <Text
          className="text-center font-semibold text-ink"
          style={{
            fontSize: 30,
            lineHeight: 32.4,
            letterSpacing: -0.9,
            maxWidth: headlineMaxWidth,
          }}
        >
          {headline}
        </Text>
        <StepsList
          steps={steps.map((s, i) => ({
            label: s,
            state: i < active ? 'done' : i === active ? 'active' : 'pending',
          }))}
        />
      </View>
      <Text className="text-center text-muted" style={{ fontSize: 14.5 }}>
        {footer}
      </Text>
    </>
  );
}
