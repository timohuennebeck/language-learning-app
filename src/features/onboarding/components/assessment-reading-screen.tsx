import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { PlacementTop } from '@/features/onboarding/components/placement-top';
import { usePlacement } from '@/features/onboarding/lib/placement-store';
import { colors } from '@/shared/theme/tokens';
import { Button } from '@/shared/ui/button';
import { Kicker } from '@/shared/ui/kicker';
import { Screen } from '@/shared/ui/screen';
import { Tap } from '@/shared/ui/tap';
import { Text } from '@/shared/ui/text';

const BODY = { fontSize: 20.5, lineHeight: 35.3 } as const;

/** 60e · Einstufung · Lesen: the text, every word tappable as "unknown". */
export function AssessmentReadingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const p = usePlacement();
  return (
    <Screen
      top={0}
      bottom={6}
      className="px-[22px]"
      footer={
        <Button
          height={58}
          size={17}
          label={t('common.next')}
          onPress={() => {
            p.startQuestions();
            router.push('/(onboarding)/assessment-question');
          }}
        />
      }
    >
      <PlacementTop round={p.round} />
      <Kicker tracking={0.1} className="mt-[22px] text-accent-700">
        {t('onboarding.placement.readKicker', { n: p.round })}
      </Kicker>
      <Text className="mt-[6px] text-muted" style={{ fontSize: 14.5 }}>
        {t('onboarding.placement.tapHint')}
      </Text>
      <View className="mt-[14px] flex-row flex-wrap">
        {p.words.map((w, i) => {
          const on = p.tapped.has(i);
          return (
            <Tap
              key={i}
              haptic="selection"
              onPress={() => p.toggleWord(i)}
              accessibilityState={{ selected: on }}
              style={{
                borderRadius: 6,
                paddingHorizontal: 3,
                marginHorizontal: -1,
                backgroundColor: on ? colors.accent[300] : 'transparent',
              }}
            >
              <Text style={{ ...BODY, color: on ? colors.accent[900] : colors.ink }}>{w}</Text>
            </Tap>
          );
        })}
      </View>
    </Screen>
  );
}
