import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { CARD_FRAME } from '@/features/flashcards/components/swipe-card';
import { Button } from '@/shared/ui/button';
import { Text } from '@/shared/ui/text';

type Props = { known: number; again: number; onRestart: () => void };

/** Shown in place of the card stack once every card was swiped. */
export function DoneCard({ known, again, onRestart }: Props) {
  const { t } = useTranslation();
  return (
    <View
      className="absolute items-center justify-center rounded-[26px] bg-surface p-[26px]"
      style={{ ...CARD_FRAME, rowGap: 6 }}
    >
      <Text
        className="font-medium text-accent-900"
        style={{ fontSize: 34, lineHeight: 34, letterSpacing: -1.02 }}
      >
        {t('flashcards.done')}
      </Text>
      <Text className="text-sub" style={{ fontSize: 16 }}>
        {t('flashcards.doneSub', { known, again })}
      </Text>
      <Button
        className="mt-[14px] px-[18px]"
        height={43}
        size={15}
        labelClassName="font-medium"
        label={t('flashcards.restart')}
        haptic="light"
        onPress={onRestart}
      />
    </View>
  );
}
