import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ExpandedPreview } from '@/features/lessons/components/stations/station-previews';
import type { StationKind } from '@/features/lessons/data/types';
import { Button } from '@/shared/ui/button';
import { Kicker } from '@/shared/ui/kicker';
import { Text } from '@/shared/ui/text';

/** The expanded (current) station: dark card with preview, subline and CTA. */
export function StationCard({ kind, onPress }: { kind: StationKind; onPress: () => void }) {
  const { t } = useTranslation();
  const base = `chapter.${kind}`;
  return (
    <View
      className="relative flex-1 overflow-hidden rounded-[26px] bg-accent-800 px-[18px] pb-[16px] pt-[18px]"
      style={{ boxShadow: '0 14px 32px rgba(41,43,49,.2)', minHeight: 268 }}
    >
      <View className="flex-row items-center justify-between">
        <Kicker className="text-lilac">{t(`${base}.num`)}</Kicker>
        <View className="rounded-pill bg-accent-100 px-[10px] py-[4px]">
          <Kicker tracking={0.06}>{kind === 'live' ? t('chapter.go') : t('chapter.next')}</Kicker>
        </View>
      </View>
      <Text
        className="mt-[10px] text-accent-100"
        style={{ fontSize: 23, lineHeight: 25.3, letterSpacing: -0.46 }}
      >
        {t(`${base}.title`)}
      </Text>
      <View className="mt-[12px] flex-1 justify-center" style={{ rowGap: 12, minHeight: 0 }}>
        <ExpandedPreview kind={kind} />
        <Text className="text-lilac" style={{ fontSize: 13 }}>
          {t(`${base}.sub`)}
        </Text>
      </View>
      <Button
        className="mt-[14px]"
        variant="light"
        height={56}
        label={t(`${base}.cta`)}
        onPress={onPress}
      />
    </View>
  );
}
