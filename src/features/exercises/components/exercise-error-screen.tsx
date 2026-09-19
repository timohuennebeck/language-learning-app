import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { FailureScreen } from '@/shared/components/failure-screen';

/** 01d-iv · Übung fehlgeschlagen (minimal, mit Fehlercode). */
export function ExerciseErrorScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <FailureScreen
      title={t('error.title')}
      headline={t('error.headline')}
      sub={t('error.sub')}
      code={t('error.code')}
      retryLabel={t('error.retry')}
      onRetry={() => router.replace('/(app)/exercise/preparing')}
      reportLabel={t('error.report')}
    />
  );
}
