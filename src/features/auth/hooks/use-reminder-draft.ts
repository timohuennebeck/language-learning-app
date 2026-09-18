import { useState } from 'react';

import type { Session } from '@/features/auth/data/schemas';
import { formatTime } from '@/shared/lib/time';

/** Editable copy of the reminder (time + repeat) for the onboarding step and the profile screen. */
export function useReminderDraft(reminder: Session['reminder']) {
  const [time, setTime] = useState({
    hour: reminder?.hour ?? 20,
    minute: reminder?.minute ?? 30,
  });
  const [repeat, setRepeat] = useState(reminder?.repeat ?? 0);
  return {
    time,
    setTime,
    repeat,
    setRepeat,
    /** "HH:MM" for labels. */
    label: formatTime(time.hour, time.minute),
    /** The value to store in the session. */
    value: { ...time, repeat },
  };
}
