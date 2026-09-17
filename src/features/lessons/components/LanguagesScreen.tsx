import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/features/auth/hooks/useSession';
import type { LearningLanguage } from '@/features/auth/data/schemas';
import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/theme/tokens';
import { Button } from '@/shared/ui/Button';
import { Flag } from '@/shared/ui/Illustration';
import { CheckCircle } from '@/shared/ui/Marks';
import { PlusIconSm } from '@/shared/ui/icons';
import { ProgressBar } from '@/shared/ui/ProgressBar';
import { Screen } from '@/shared/ui/Screen';
import { Tap } from '@/shared/ui/Tap';
import { Text } from '@/shared/ui/Text';
import { TopBar } from '@/shared/ui/TopBar';

const CARDS: {
  code: LearningLanguage;
  sub: string;
  words: string;
  level: string;
  to: string;
  pct: number;
}[] = [
  { code: 'fr', sub: 'active', level: 'A2', words: '86', to: 'toB1', pct: 0.64 },
  { code: 'en', sub: 'enSub', level: 'B1', words: '240', to: 'toB2', pct: 0.33 },
  { code: 'es', sub: 'esSub', level: 'A1', words: '31', to: 'toA2', pct: 0.15 },
];

/** 01a · Sprache wechseln. */
export function LanguagesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session, update } = useSession();
  return (
    <Screen top={0} bottom={6} className="px-[22px]" style={{ rowGap: 16 }}>
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
      {CARDS.map((c, i) => {
        const active = session.learningLanguage === c.code;
        return (
          <Tap
            key={c.code}
            haptic="selection"
            onPress={() => update({ learningLanguage: c.code })}
            className={cn('rounded-[24px] bg-white p-[16px]', i > 0 && 'mt-[-6px]')}
            style={{
              rowGap: 12,
              boxShadow: active ? `0 0 0 2px ${colors.accent[700]}` : undefined,
            }}
          >
            <View className="flex-row items-center" style={{ columnGap: 13 }}>
              <Flag code={c.code} size={42} />
              <View className="flex-1" style={{ rowGap: 1 }}>
                <Text
                  className={cn('text-ink', active && 'font-semibold')}
                  style={{ fontSize: 17.5 }}
                >
                  {t(`common.language.${c.code}`)}
                </Text>
                <Text className="text-muted" style={{ fontSize: 13.5 }}>
                  {t(`languages.${c.sub}`)}
                </Text>
              </View>
              {active ? (
                <CheckCircle size={24} bg={colors.accent[700]} stroke={2.6} iconSize={13} />
              ) : null}
            </View>
            <View style={{ rowGap: 7 }}>
              <View className="flex-row justify-between">
                <Text className="text-sub" style={{ fontSize: 13.5 }}>
                  {t('languages.words', { level: c.level, n: c.words })}
                </Text>
                <Text className="text-muted" style={{ fontSize: 13.5 }}>
                  {t(`languages.${c.to}`)}
                </Text>
              </View>
              <ProgressBar
                progress={c.pct}
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
        left={<PlusIconSm />}
        className="[column-gap:-1px]"
        haptic="light"
        onPress={() => router.push('/(app)/profile/learning-language')}
      />
    </Screen>
  );
}
