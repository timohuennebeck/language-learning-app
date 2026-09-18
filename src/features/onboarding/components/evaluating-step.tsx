import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { ProgressChecklist } from '@/shared/components/progress-checklist';
import { Screen } from '@/shared/ui/screen';

/** 08 · Auswertung läuft. Advances to the level result automatically. */
export function EvaluatingStep() {
  const { t } = useTranslation();
  const router = useRouter();
  useEffect(() => {
    const id = setTimeout(() => router.replace('/(onboarding)/level-result'), 6000);
    return () => clearTimeout(id);
  }, [router]);
  return (
    <Screen bottom={0} className="px-[20px]">
      <ProgressChecklist
        progress={0.68}
        label="68 %"
        pip="pip-cheer-2"
        pipSize={140}
        headline={t('onboarding.evaluating.title')}
        steps={t('onboarding.evaluating.steps', { returnObjects: true }) as string[]}
        active={2}
        footer={t('onboarding.evaluating.secondsLeft', { n: 6 })}
      />
    </Screen>
  );
}
