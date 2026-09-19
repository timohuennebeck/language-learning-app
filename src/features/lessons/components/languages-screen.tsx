import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { LEVELS, type Level } from '@/features/auth/data/types';
import { useSession } from '@/features/auth/hooks/use-session';
import { DESIGN_PROGRESS } from '@/features/profile/data/repository';
import type { LearnerLanguageSummary } from '@/features/profile/data/types';
import { useLearnerLanguages } from '@/features/profile/hooks/use-profile';
import { cn } from '@/shared/lib/cn';
import { ring } from '@/shared/lib/styles';
import { colors } from '@/shared/theme/tokens';
import { Button } from '@/shared/ui/button';
import { Flag } from '@/shared/ui/illustration';
import { CheckCircle } from '@/shared/ui/marks';
import { ProgressBar } from '@/shared/ui/progress-bar';
import { Screen } from '@/shared/ui/screen';
import { Tap } from '@/shared/ui/tap';
import { Text } from '@/shared/ui/text';
import { TopBar } from '@/shared/ui/top-bar';

/** The next level above the current one (B2 stays B2). */
function nextLevel(level: Level): Level {
  return LEVELS[Math.min(LEVELS.indexOf(level) + 1, LEVELS.length - 1)];
}

/** 01a · Sprache wechseln: one card per started language (`learner_languages`), the active one ringed. */
export function LanguagesScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { session, update } = useSession();
  const learned = useLearnerLanguages().data ?? [];
  // The active language is listed even before its row has been fetched (just added, or offline).
  const cards: LearnerLanguageSummary[] = learned.some(
    (l) => l.language === session.learningLanguage,
  )
    ? learned
    : [
        ...learned,
        {
          language: session.learningLanguage,
          level: session.level,
          targetLevel: session.targetLevel,
          words: 0,
          startedAt: new Date().toISOString(),
        },
      ];
  return (
    <Screen bottom={6} className="px-[22px]" style={{ rowGap: 16 }}>
      <TopBar left="back" title={t('languages.title')} />
      <View style={{ rowGap: 4 }}>
        <Text
          className="font-semibold text-ink"
          style={{ fontSize: 30, lineHeight: 32.4, letterSpacing: -1.05 }}
        >
          {t('languages.headline')}
        </Text>
        <Text className="text-muted" style={{ fontSize: 15.5, lineHeight: 22.5 }}>
          {t('languages.sub')}
        </Text>
      </View>
      {cards.map((c, i) => {
        const active = session.learningLanguage === c.language;
        const name = t(`common.languageNative.${c.language}`);
        const since = new Date(c.startedAt).toLocaleDateString(i18n.language, {
          month: 'long',
          year: 'numeric',
        });
        // Level progress stays at the design's value until activity tracking exists (docs/lernen-plan.md).
        const pct = DESIGN_PROGRESS.levelProgress;
        return (
          <Tap
            key={c.language}
            haptic="selection"
            onPress={() => update({ learningLanguage: c.language })}
            className={cn('rounded-[24px] bg-white p-[16px]', i > 0 && 'mt-[-6px]')}
            style={{
              rowGap: 12,
              boxShadow: active ? ring(2, colors.accent[700]) : undefined,
            }}
          >
            <View className="flex-row items-center" style={{ columnGap: 13 }}>
              <Flag code={c.language} size={42} />
              <View className="flex-1" style={{ rowGap: 1 }}>
                <Text
                  className={cn('text-ink', active && 'font-semibold')}
                  style={{ fontSize: 17.5 }}
                >
                  {t(`common.language.${c.language}`)}
                </Text>
                <Text className="text-muted" style={{ fontSize: 13.5 }}>
                  {active
                    ? t('languages.activeSub', { name })
                    : t('languages.sinceSub', { name, date: since })}
                </Text>
              </View>
              {active ? <CheckCircle /> : null}
            </View>
            <View style={{ rowGap: 7 }}>
              <View className="flex-row justify-between">
                <Text className="text-sub" style={{ fontSize: 13.5 }}>
                  {t('languages.words', { level: c.level, n: c.words })}
                </Text>
                <Text className="text-muted" style={{ fontSize: 13.5 }}>
                  {t('languages.to', { pct: Math.round(pct * 100), level: nextLevel(c.level) })}
                </Text>
              </View>
              <ProgressBar
                progress={pct}
                height={8}
                trackColor={colors.surface2}
                fillColor={active ? colors.accent[800] : colors.dim8}
              />
            </View>
          </Tap>
        );
      })}
      <View className="flex-1" />
      <Button
        variant="surface"
        height={56}
        size={16.5}
        label={t('languages.new')}
        haptic="light"
        onPress={() => router.push('/(app)/profile/learning-language')}
      />
    </Screen>
  );
}
