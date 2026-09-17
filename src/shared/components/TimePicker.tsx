import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib/cn';
import { Gradient } from '@/shared/ui/Gradient';
import { Tap } from '@/shared/ui/Tap';
import { Text } from '@/shared/ui/Text';

type Props = {
  hour: number;
  minute: number;
  minuteStep?: 5 | 15;
  onChange: (next: { hour: number; minute: number }) => void;
  className?: string;
};

const pad = (n: number) => String(n).padStart(2, '0');
const dim = (offset: number) => (offset === 0 ? 1 : Math.abs(offset) === 1 ? 0.4 : 0.16);

/** Wheel-style time picker (5 visible rows, selected row highlighted). Tap a value to pick it. */
export function TimePicker({ hour, minute, minuteStep = 5, onChange, className }: Props) {
  const { t } = useTranslation();
  const hours = [-2, -1, 0, 1, 2].map((o) => ({ v: (hour + o + 24) % 24, o }));
  const minutes = [-2, -1, 0, 1, 2].map((o) => ({ v: (minute + o * minuteStep + 60) % 60, o }));
  const isAm = hour < 12;
  const periods = [
    {
      label: t('onboarding.reminder.am'),
      active: isAm,
      pick: () => onChange({ hour: hour % 12, minute }),
    },
    {
      label: t('onboarding.reminder.pm'),
      active: !isAm,
      pick: () => onChange({ hour: (hour % 12) + 12, minute }),
    },
  ];
  const cell = (
    key: string,
    label: string,
    opacity: number,
    active: boolean,
    pick: () => void,
    size = 27,
    align: 'flex-end' | 'flex-start' | 'center' = 'center',
  ) => (
    <Tap key={key} haptic="selection" onPress={pick} style={{ alignSelf: align }}>
      <Text
        className={cn('text-ink', active && 'font-medium')}
        style={{ fontSize: size, lineHeight: 34, opacity, fontVariant: ['tabular-nums'] }}
      >
        {label}
      </Text>
    </Tap>
  );
  return (
    <View className={cn('relative overflow-hidden', className)} style={{ height: 226 }}>
      <View
        className="absolute left-0 right-0 rounded-[12px] bg-surface"
        style={{ top: 113 - 23, height: 46 }}
      />
      <View className="absolute inset-0 flex-row items-center">
        <View className="flex-1 items-end pr-[4px]" style={{ rowGap: 12 }}>
          {hours.map((h) =>
            cell(
              `h${h.o}`,
              pad(h.v),
              dim(h.o),
              h.o === 0,
              () => onChange({ hour: h.v, minute }),
              27,
              'flex-end',
            ),
          )}
        </View>
        <Text className="w-[14px] text-center text-ink" style={{ fontSize: 27, lineHeight: 34 }}>
          :
        </Text>
        <View className="flex-1 items-start pl-[4px]" style={{ rowGap: 12 }}>
          {minutes.map((m) =>
            cell(
              `m${m.o}`,
              pad(m.v),
              dim(m.o),
              m.o === 0,
              () => onChange({ hour, minute: m.v }),
              27,
              'flex-start',
            ),
          )}
        </View>
        <View className="flex-1 items-center" style={{ rowGap: 12 }}>
          <Text style={{ fontSize: 19, lineHeight: 34, opacity: 0 }}>—</Text>
          {periods.map((p) => cell(p.label, p.label, p.active ? 1 : 0.4, p.active, p.pick, 19))}
          <Text style={{ fontSize: 19, lineHeight: 34, opacity: 0 }}>—</Text>
          <Text style={{ fontSize: 19, lineHeight: 34, opacity: 0 }}>—</Text>
        </View>
      </View>
      <Gradient
        colors={['#f3f5fe', 'rgba(243,245,254,0)']}
        locations={[0.2, 1]}
        pointerEvents="none"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 64 }}
      />
      <Gradient
        colors={['rgba(243,245,254,0)', '#f3f5fe']}
        locations={[0, 0.8]}
        pointerEvents="none"
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 64 }}
      />
    </View>
  );
}

/** Three-way repeat segments: Täglich / Mo–Fr / Wochenende. */
export function RepeatSegments({
  value,
  onChange,
  className,
}: {
  value: number;
  onChange: (i: number) => void;
  className?: string;
}) {
  const { t } = useTranslation();
  const labels = [
    t('onboarding.reminder.daily'),
    t('onboarding.reminder.weekdays'),
    t('onboarding.reminder.weekend'),
  ];
  return (
    <View className={cn('flex-row', className)} style={{ columnGap: 8 }}>
      {labels.map((label, i) => {
        const on = i === value;
        return (
          <Tap
            key={label}
            haptic="selection"
            onPress={() => onChange(i)}
            className={cn(
              'h-[44px] flex-1 items-center justify-center rounded-pill',
              on ? 'bg-accent-800' : 'bg-surface2',
            )}
          >
            <Text
              className={cn(on ? 'font-medium text-accent-100' : 'text-muted')}
              style={{ fontSize: 15.5 }}
            >
              {label}
            </Text>
          </Tap>
        );
      })}
    </View>
  );
}
