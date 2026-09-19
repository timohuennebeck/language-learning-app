import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { isStale, useTextStatus } from '@/features/reading/hooks/use-reading';
import { ProgressChecklist } from '@/shared/components/progress-checklist';
import { Screen } from '@/shared/ui/screen';
import { TopBar } from '@/shared/ui/top-bar';

/** How far round the ring each generation stage sits. Index is `reading_texts.stage`. */
const RING = [0.1, 0.35, 0.75, 1];
/** Roughly how long a text takes, for the countdown under the checklist. */
const ESTIMATE_SECONDS = 20;

/**
 * 01c · "Pip schreibt deinen Text", the reading twin of `exercise/preparing`.
 *
 * Unlike that screen this one is not on a timer: `stage` on the polled row says which of the three
 * model calls is running, so the checklist ticks off work that actually happened. Between stages
 * the ring eases towards the next mark, because a bar that sits still for eight seconds reads as
 * a hang.
 */
export function ReadingPreparingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { textId } = useLocalSearchParams<{ textId?: string }>();
  const { data: text } = useTextStatus(textId);
  const [elapsed, setElapsed] = useState(0);
  const settled = useRef(false);

  useEffect(() => {
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    // `replace`, so the back gesture from the text does not land on the checklist again. The guard
    // keeps a late poll from navigating twice.
    if (!text || settled.current) return;
    if (text.status === 'ready') {
      settled.current = true;
      router.replace({ pathname: '/(app)/reading', params: { textId: text.id } });
    } else if (text.status === 'failed' || isStale(text)) {
      // A row that outran the wait goes to the error screen too. Silently stopping the poll left
      // the learner on a checklist that would never finish, with no way out but the close button.
      settled.current = true;
      router.replace({ pathname: '/(app)/reading/error', params: { textId: text.id } });
    }
  }, [text, router, elapsed]);

  const stage = Math.min(text?.stage ?? 0, RING.length - 1);
  // Ease from this stage's mark towards the next one over the time a stage usually takes.
  const next = RING[Math.min(stage + 1, RING.length - 1)];
  const drift = Math.min(1, (elapsed % 8) / 8) * (next - RING[stage]) * 0.6;
  const progress = Math.min(1, RING[stage] + drift);
  const left = Math.max(1, ESTIMATE_SECONDS - elapsed);

  return (
    <Screen bottom={6} className="px-[22px]">
      <TopBar left="close" title={t('reading.preparing.title')} titleSize={20} />
      <ProgressChecklist
        progress={progress}
        label={`${Math.round(progress * 100)} %`}
        pip="pip-cheer-2"
        headline={t('reading.preparing.headline')}
        headlineMaxWidth={300}
        steps={t('reading.preparing.steps', { returnObjects: true }) as string[]}
        active={stage}
        footer={t('reading.preparing.secondsLeft', { n: left })}
      />
    </Screen>
  );
}
