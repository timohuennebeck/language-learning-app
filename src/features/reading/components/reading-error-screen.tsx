import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useGenerateText, useTextStatus } from '@/features/reading/hooks/use-reading';
import { FailureScreen } from '@/shared/components/failure-screen';

/**
 * 01d · a text that could not be written. "Nochmal versuchen" re-runs the same row rather than
 * starting a new one, so a failure does not cost the learner one of the day's texts — and when the
 * prose survived and only the annotation failed, the retry resumes from it.
 */
export function ReadingErrorScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { textId } = useLocalSearchParams<{ textId?: string }>();
  const { data: text } = useTextStatus(textId);
  const generate = useGenerateText();

  const limited = text?.errorCode === 'GENERATION_LIMIT';
  return (
    <FailureScreen
      title={t('reading.error.title')}
      headline={limited ? t('reading.error.limit') : t('reading.error.headline')}
      sub={limited ? t('reading.error.limitSub') : t('reading.error.sub')}
      code={text?.errorCode ?? 'unknown'}
      at={text ? new Date(text.createdAt) : null}
      retryLabel={t('reading.error.retry')}
      retrying={generate.isPending}
      onRetry={() => {
        if (!textId) return router.back();
        generate.mutate(
          { textId },
          {
            onSuccess: (id) =>
              router.replace({ pathname: '/(app)/reading/preparing', params: { textId: id } }),
          },
        );
      }}
      reportLabel={t('reading.error.report')}
    />
  );
}
