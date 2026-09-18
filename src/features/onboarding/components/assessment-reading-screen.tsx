import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/features/auth/hooks/use-session';
import { useReadingPlacement, type Phase } from '@/features/onboarding/hooks/use-reading-placement';
import { colors } from '@/shared/theme/tokens';
import { Button } from '@/shared/ui/button';
import { CheckIcon, CloseIcon } from '@/shared/ui/icons';
import { Illustration } from '@/shared/ui/illustration';
import { Kicker } from '@/shared/ui/kicker';
import { ProgressBar } from '@/shared/ui/progress-bar';
import { Screen } from '@/shared/ui/screen';
import { Tap } from '@/shared/ui/tap';
import { Text } from '@/shared/ui/text';
import { TopBar } from '@/shared/ui/top-bar';

const BODY = { fontSize: 20.5, lineHeight: 35.3 } as const;

/**
 * 60b–60d · Einstufung · Lesen. Two rounds of: read and tap unknown words → three yes/no
 * questions → round result. Dev param `?phase=question|result` opens a phase directly.
 */
export function AssessmentReadingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { update } = useSession();
  const params = useLocalSearchParams<{ phase?: Phase }>();
  const p = useReadingPlacement({
    initialPhase: params.phase === 'question' || params.phase === 'result' ? params.phase : 'read',
  });
  // Design sample when a phase is opened directly (no round was actually played).
  const result = p.result ?? { knownPct: 96, cards: ['a', 'b', 'c'], correct: 2, total: 3 };

  const onNext = () => {
    if (p.next() === 'done') {
      update({ readingLevel: p.readingLevel });
      router.push('/(onboarding)/assessment-call-intro');
    }
  };

  const footer =
    p.phase === 'read' ? (
      <Button height={58} size={17} label={t('common.next')} onPress={p.finishReading} />
    ) : p.phase === 'question' ? (
      <View className="flex-row" style={{ columnGap: 12 }}>
        <Button
          className="flex-1"
          variant="surface"
          height={58}
          size={16.5}
          haptic="light"
          left={<CheckIcon size={15} color={colors.accent[800]} strokeWidth={2.6} />}
          label={t('common.yes')}
          labelClassName="font-semibold text-accent-800"
          onPress={() => p.answer(true)}
        />
        <Button
          className="flex-1"
          height={58}
          size={16.5}
          left={<CloseIcon size={15} color={colors.accent[100]} strokeWidth={2.6} />}
          label={t('common.no')}
          onPress={() => p.answer(false)}
        />
      </View>
    ) : (
      <Button height={58} size={17} label={t('common.next')} onPress={onNext} />
    );

  return (
    <Screen top={0} bottom={6} className="px-[22px]" footer={footer}>
      <TopBar
        left="close"
        title={t('onboarding.placement.screenTitle')}
        onLeftPress={() => router.back()}
      />
      {p.phase !== 'result' ? (
        <View className="mt-[10px] flex-row items-center" style={{ columnGap: 10 }}>
          <ProgressBar className="flex-1" progress={p.round / 2} radius={4} />
          <Text className="text-muted" style={{ fontSize: 12.5 }}>
            {t('onboarding.placement.roundOf', { n: p.round })}
          </Text>
        </View>
      ) : null}

      {p.phase === 'read' ? (
        <>
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
        </>
      ) : p.phase === 'question' ? (
        <View className="flex-1 justify-center" style={{ paddingBottom: 40 }}>
          <Kicker tracking={0.1} className="text-accent-700">
            {t('onboarding.placement.questionKicker')}
          </Kicker>
          <Text
            className="mt-[10px] font-semibold text-ink"
            style={{ fontSize: 26, lineHeight: 31, letterSpacing: -0.52 }}
          >
            {p.question.prompt}
          </Text>
        </View>
      ) : (
        <>
          <View
            className="relative mt-[14px] overflow-hidden rounded-[26px] bg-surface px-[20px] py-[18px]"
            style={{ minHeight: 172 }}
          >
            <Kicker size={11} tracking={0.1}>
              {t('onboarding.placement.textOf', { n: p.round })}
            </Kicker>
            <Text
              className="mt-[6px] font-semibold text-accent-800"
              style={{ fontSize: 52, lineHeight: 56, letterSpacing: -2.08 }}
            >
              {result.knownPct} %
            </Text>
            <Text
              className="font-semibold text-ink"
              style={{ fontSize: 16, lineHeight: 21, maxWidth: 150 }}
            >
              {t('onboarding.placement.known')}
            </Text>
            <Illustration
              name="pip-cheer-4"
              size={120}
              style={{ position: 'absolute', right: 10, top: 22 }}
            />
          </View>
          <View className="mt-[12px] flex-row" style={{ columnGap: 12 }}>
            {[
              { n: String(result.cards.length), label: t('onboarding.placement.cardsMade') },
              {
                n: `${result.correct} / ${result.total}`,
                label: t('onboarding.placement.questionsRight'),
              },
            ].map((tile) => (
              <View
                key={tile.label}
                className="flex-1 rounded-[22px] bg-surface2 px-[16px] py-[16px]"
              >
                <Text
                  className="font-semibold text-ink"
                  style={{ fontSize: 26, lineHeight: 30, letterSpacing: -0.52 }}
                >
                  {tile.n}
                </Text>
                <Text className="mt-[6px] text-muted" style={{ fontSize: 13.5 }}>
                  {tile.label}
                </Text>
              </View>
            ))}
          </View>
        </>
      )}
    </Screen>
  );
}
