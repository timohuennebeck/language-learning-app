import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { segments } from '@/features/reading/data/content';
import { InlineFlow } from '@/shared/components/inline-flow';
import { InlineMark } from '@/shared/components/inline-mark';
import { insetRing } from '@/shared/lib/styles';
import { splitMarks } from '@/shared/lib/text';
import { colors } from '@/shared/theme/tokens';
import { Button, TextButton } from '@/shared/ui/button';
import { Kicker } from '@/shared/ui/kicker';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';
import { TopBar } from '@/shared/ui/top-bar';

/** 16a · Worterklärung aus dem Lesetext. */
export function WordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { seg } = useLocalSearchParams<{ seg?: string }>();
  const s = segments[seg ?? 'creme'] ?? segments.creme;
  const pct = Math.round((s.stats.right / s.stats.total) * 100);
  const [saved, setSaved] = useState(false);
  return (
    <Screen bottom={0} className="px-[20px]">
      <TopBar left="back" title={t('reading.headline')} />
      <View className="mt-[22px] flex-row items-center" style={{ columnGap: 10 }}>
        <View className="rounded-pill bg-surface px-[12px] py-[5px]">
          <Text
            className="font-semibold text-accent-800"
            style={{ fontSize: 13, letterSpacing: 0.52 }}
          >
            {t('word.sure', { pct: `${pct} %` })}
          </Text>
        </View>
        <Text className="text-faint" style={{ fontSize: 13 }}>
          {t('word.note', { right: s.stats.right, total: s.stats.total })}
        </Text>
      </View>
      <Text
        className="mt-[14px] font-semibold text-ink"
        style={{ fontSize: 34, lineHeight: 36.7, letterSpacing: -1.19 }}
      >
        {s.word}
      </Text>
      <Text className="mt-[8px] text-sub" style={{ fontSize: 19 }}>
        {s.trans}
      </Text>
      <View className="mt-[26px]" style={{ rowGap: 9 }}>
        <Kicker tracking={0.1} className="text-accent-700">
          {t('word.inSentence')}
        </Kicker>
        <InlineFlow
          textStyle={{ fontSize: 19, lineHeight: 28.9, color: colors.accent[900] }}
          pieces={[
            s.sentence.pre,
            {
              key: 'word',
              node: (
                <InlineMark size={19} color={colors.accent[900]} bg={colors.track} py={1}>
                  {s.word}
                </InlineMark>
              ),
            },
            s.sentence.post,
          ]}
        />
        <InlineFlow
          textStyle={{ fontSize: 14.5, lineHeight: 21, color: colors.muted }}
          pieces={splitMarks(s.sentence.de, s.sentence.deMarks).map((run, i) =>
            run.marked
              ? {
                  key: `de-${i}`,
                  node: (
                    <InlineMark
                      size={14.5}
                      lineHeight={18}
                      color={colors.accent[900]}
                      bg={colors.track}
                      radius={5}
                      px={3}
                      py={1}
                    >
                      {run.text}
                    </InlineMark>
                  ),
                }
              : run.text,
          )}
        />
      </View>
      <View className="flex-1" />
      <View style={{ rowGap: 10 }}>
        <Button
          height={58}
          label={saved ? t('word.saved') : t('word.save')}
          variant={saved ? 'ghost-accent' : 'primary'}
          style={saved ? { boxShadow: insetRing(1.5, colors.accent[800]) } : undefined}
          haptic={saved ? 'light' : 'success'}
          onPress={() => setSaved((v) => !v)}
        />
        <TextButton
          className="h-[52px]"
          label={t('word.continue')}
          color="text-accent-900"
          size={16.5}
          onPress={() => router.back()}
        />
      </View>
    </Screen>
  );
}
