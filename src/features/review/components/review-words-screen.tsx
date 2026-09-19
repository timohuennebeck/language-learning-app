import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { recapWords } from '@/features/review/data/content';
import { useGoToCourse } from '@/shared/hooks/use-back';
import { colors } from '@/shared/theme/tokens';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/marks';
import { Tap } from '@/shared/ui/tap';
import { Text } from '@/shared/ui/text';

/** 3h · Rückblick · Wörter: pick the words from the conversation to save. */
export function ReviewWordsScreen() {
  const { t } = useTranslation();
  const goToCourse = useGoToCourse();
  const [words, setWords] = useState(recapWords);
  const selected = words.filter((w) => w.state === 1).length;
  return (
    <View className="flex-1">
      <View className="mb-[6px] mt-[22px] flex-row items-baseline justify-between">
        <Text className="text-text" style={{ fontSize: 17 }}>
          {t('review.count', { n: words.length })}
        </Text>
        <Tap
          haptic="light"
          onPress={() => setWords((ws) => ws.map((w) => (w.state === 0 ? { ...w, state: 1 } : w)))}
        >
          <Text className="text-accent-700" style={{ fontSize: 17 }}>
            {t('review.selectAll')}
          </Text>
        </Tap>
      </View>
      <View className="flex-1 overflow-hidden">
        {words.map((w, i) => (
          <Tap
            key={w.word}
            haptic="selection"
            disabled={w.state === 2}
            onPress={() =>
              setWords((ws) =>
                ws.map((x, j) => (j === i ? { ...x, state: x.state === 1 ? 0 : 1 } : x)),
              )
            }
            className="flex-row items-center py-[14px]"
            style={{ columnGap: 16 }}
          >
            <Checkbox
              checked={w.state > 0}
              bg={w.state === 2 ? colors.neutral[300] : colors.accent[800]}
            />
            <View className="flex-1">
              <Text className="text-text" style={{ fontSize: 19, lineHeight: 22.8 }}>
                {w.word}
              </Text>
              <Text className="text-muted" style={{ fontSize: 15 }}>
                {w.meaning}
              </Text>
            </View>
            {w.state === 2 ? (
              <Text className="text-faint" style={{ fontSize: 15 }}>
                {t('review.saved')}
              </Text>
            ) : null}
          </Tap>
        ))}
      </View>
      <Button
        className="mt-[14px]"
        height={63.9}
        size={18}
        haptic="success"
        labelClassName="font-medium"
        label={t('review.cta', { n: selected })}
        onPress={() => goToCourse(1)}
      />
    </View>
  );
}
