import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { ProgressChecklist } from '@/shared/components/progress-checklist';
import { Screen } from '@/shared/ui/screen';
import { TopBar } from '@/shared/ui/top-bar';

/** 01c · Übung wird vorbereitet. Hands off to the exercise flow once "done". */
export function PreparingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  useEffect(() => {
    const id = setTimeout(() => router.replace('/(app)/exercise'), 4000);
    return () => clearTimeout(id);
  }, [router]);
  return (
    <Screen bottom={6} className="px-[22px]">
      <TopBar left="close" title={t('preparing.title')} titleSize={20} />
      <ProgressChecklist
        progress={0.62}
        label="62 %"
        pip="pip-cheer-2"
        headline={t('preparing.headline')}
        headlineMaxWidth={300}
        steps={t('preparing.steps', { returnObjects: true }) as string[]}
        active={2}
        footer={t('preparing.secondsLeft', { n: 8 })}
      />
    </Screen>
  );
}
