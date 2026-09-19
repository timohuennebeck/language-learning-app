import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { nextTime } from '@/features/review/data/content';
import { useGoToCourse } from '@/shared/hooks/use-back';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/marks';
import { Tap } from '@/shared/ui/tap';
import { Text } from '@/shared/ui/text';

/** 3h · Rückblick · Umschrieben: the words the learner described instead of naming. */
export function ReviewNextScreen() {
  const { t } = useTranslation();
  const goToCourse = useGoToCourse();
  const [picked, setPicked] = useState<number[]>([0, 1, 2, 3]);
  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 4, rowGap: 4 }}
        showsVerticalScrollIndicator={false}
      >
        {nextTime.map((n, i) => {
          const on = picked.includes(i);
          return (
            <Tap
              key={n.word}
              haptic="selection"
              onPress={() => setPicked((p) => (on ? p.filter((x) => x !== i) : [...p, i]))}
              className="flex-row items-start py-[14px]"
              style={{ columnGap: 16 }}
            >
              <Checkbox checked={on} className="mt-[4px]" />
              <View className="flex-1" style={{ rowGap: 5, minWidth: 0 }}>
                <Text className="text-faint" style={{ fontSize: 15, lineHeight: 20.25 }}>
                  „{n.said}“
                </Text>
                <Text
                  className="font-medium text-accent-900"
                  style={{ fontSize: 20, lineHeight: 25 }}
                >
                  {n.word}
                </Text>
                <Text className="text-muted" style={{ fontSize: 15, lineHeight: 20.25 }}>
                  {n.de}
                </Text>
              </View>
            </Tap>
          );
        })}
      </ScrollView>
      <Button
        className="mt-[14px]"
        height={63.9}
        size={18}
        haptic="success"
        labelClassName="font-medium"
        label={t('review.cta', { n: picked.length })}
        onPress={() => goToCourse(1)}
      />
    </View>
  );
}
