import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ProgressBar } from '@/shared/ui/progress-bar';
import { Text } from '@/shared/ui/text';
import { TopBar } from '@/shared/ui/top-bar';

/** "Einstufung" bar with the round progress, shared by the reading and question screens. */
export function PlacementTop({ round, progress = true }: { round: 1 | 2; progress?: boolean }) {
  const { t } = useTranslation();
  return (
    <>
      <TopBar left="back" title={t('onboarding.placement.screenTitle')} />
      {progress ? (
        <View className="mt-[10px] flex-row items-center" style={{ columnGap: 10 }}>
          <ProgressBar className="flex-1" progress={round / 2} radius={4} />
          <Text className="text-muted" style={{ fontSize: 12.5 }}>
            {t('onboarding.placement.roundOf', { n: round })}
          </Text>
        </View>
      ) : null}
    </>
  );
}
