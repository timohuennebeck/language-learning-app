import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/features/auth/hooks/use-session';
import { resetCall, useLiveCallState } from '@/features/live/lib/live-call-store';
import { ProgressChecklist } from '@/shared/components/progress-checklist';
import { Screen } from '@/shared/ui/screen';

/** Shortest time the checklist stays up, so the steps are readable even when the review is quick. */
const MIN_MS = 3000;
/** Without a call to wait for (dev index), move on after this. */
const FALLBACK_MS = 6000;

/** 08 · Auswertung läuft. Advances to the level result once end-conversation has written the review. */
export function EvaluatingStep() {
  const { t } = useTranslation();
  const router = useRouter();
  const { update } = useSession();
  const call = useLiveCallState();
  const [minElapsed, setMinElapsed] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setMinElapsed(true), call.status === 'idle' ? FALLBACK_MS : MIN_MS);
    return () => clearTimeout(id);
  }, [call.status]);

  const done = call.status === 'idle' || call.status === 'ended' || call.status === 'error';
  useEffect(() => {
    if (!minElapsed || !done) return;
    const level = call.result?.level;
    if (level) update({ level, levelSource: 'placement' });
    resetCall();
    router.replace('/(onboarding)/level-result');
  }, [minElapsed, done, call.result, update, router]);

  const active =
    call.status === 'ended' || call.status === 'idle' ? 3 : call.status === 'ending' ? 2 : 1;
  return (
    <Screen bottom={0} className="px-[20px]">
      <ProgressChecklist
        progress={(active + 1) / 5}
        label={`${Math.round(((active + 1) / 5) * 100)} %`}
        pip="pip-cheer-2"
        pipSize={140}
        headline={t('onboarding.evaluating.title')}
        steps={t('onboarding.evaluating.steps', { returnObjects: true }) as string[]}
        active={active}
        footer={t('onboarding.evaluating.hint')}
      />
    </Screen>
  );
}
