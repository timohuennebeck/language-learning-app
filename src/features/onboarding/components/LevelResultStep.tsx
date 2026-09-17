import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/features/auth/hooks/useSession';
import { colors } from '@/shared/theme/tokens';
import { Button } from '@/shared/ui/Button';
import { Illustration } from '@/shared/ui/Illustration';
import { Ring } from '@/shared/ui/Ring';
import { Screen } from '@/shared/ui/Screen';
import { Kicker } from '@/shared/ui/Kicker';
import { Text } from '@/shared/ui/Text';
import { TopBar } from '@/shared/ui/TopBar';

const PCT: Record<string, number> = { A1: 0.1, A2: 0.3, B1: 0.5, B2: 0.7 };

/** 09 · Level-Ergebnis. */
export function LevelResultStep() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session } = useSession();
  const level = session.level in PCT ? session.level : 'A2';
  const pct = PCT[level];
  const items = t('onboarding.levelResult.items', { returnObjects: true }) as {
    text: string;
    sub: string;
    status: string;
    pct: number;
  }[];
  return (
    <Screen top={0} bottom={6} className="px-[22px]">
      <TopBar
        left="close"
        title={t('onboarding.levelResult.title')}
        titleSize={20}
        onLeftPress={() => router.replace('/(onboarding)/assessment-intro')}
      />
      <View
        className="relative mt-[22px] overflow-hidden rounded-[26px] bg-surface px-[24px] py-[22px]"
        style={{ height: 236 }}
      >
        <View className="flex-row items-center" style={{ columnGap: 8 }}>
          <View className="rounded-pill bg-bg px-[9px] py-[4px]">
            <Kicker tracking={0.06}>{t('onboarding.levelResult.kicker')}</Kicker>
          </View>
          <Kicker>{t('onboarding.levelResult.kickerSub')}</Kicker>
        </View>
        <View className="mt-[14px] flex-row items-end" style={{ columnGap: 10 }}>
          <Text
            className="font-medium text-accent-900"
            style={{ fontSize: 52, lineHeight: 47, letterSpacing: -2.08 }}
          >
            {level}
          </Text>
          <Text className="pb-[6px] text-sub" style={{ fontSize: 16 }}>
            {t(`common.levelName.${level}`)}
          </Text>
        </View>
        <View className="mt-[16px]" style={{ maxWidth: 196 }}>
          <View className="relative h-[8px] rounded-pill bg-bg">
            <View
              className="absolute bottom-0 left-0 top-0 rounded-pill bg-accent-700"
              style={{ width: `${pct * 100}%` }}
            />
            <View
              className="absolute h-[16px] w-[16px] rounded-full bg-white"
              style={{
                top: -4,
                left: `${pct * 100}%`,
                marginLeft: -8,
                borderWidth: 3,
                borderColor: colors.accent[800],
              }}
            />
          </View>
          <View className="mt-[7px] flex-row justify-between">
            {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((l) => (
              <Text key={l} className="text-muted" style={{ fontSize: 11.5 }}>
                {l}
              </Text>
            ))}
          </View>
        </View>
        <Illustration
          name="pip-glasses-book"
          size={118}
          style={{ position: 'absolute', right: -2, bottom: 8 }}
        />
      </View>
      <Text className="mt-[18px] text-sub" style={{ fontSize: 15, lineHeight: 21 }}>
        {t(`onboarding.levelResult.blurb.${level}`)}
      </Text>
      <View className="mt-[22px] flex-row items-baseline justify-between">
        <Text className="text-sub" style={{ fontSize: 17 }}>
          {t('onboarding.levelResult.fromTalk')}
        </Text>
        <Text className="font-medium text-accent-800" style={{ fontSize: 15 }}>
          {t('onboarding.levelResult.spots')}
        </Text>
      </View>
      <View className="mt-[4px] flex-1 overflow-hidden">
        {items.map((it) => (
          <View key={it.text} className="flex-row items-center py-[12px]" style={{ columnGap: 16 }}>
            <Ring
              size={44}
              stroke={5}
              progress={it.pct / 100}
              trackColor={colors.track3}
              color={colors.accent[700]}
              linecap="butt"
            >
              <Text className="font-medium text-accent-900" style={{ fontSize: 12 }}>
                {it.pct}
              </Text>
            </Ring>
            <View className="flex-1">
              <Text className="text-text" style={{ fontSize: 18, lineHeight: 21.6 }}>
                {it.text}
              </Text>
              <Text className="text-muted" style={{ fontSize: 14 }}>
                {it.sub}
              </Text>
            </View>
            <Text style={{ fontSize: 14, color: it.pct >= 80 ? colors.ok.strong : colors.warn }}>
              {it.status}
            </Text>
          </View>
        ))}
      </View>
      <Button
        className="mt-[10px]"
        height={62}
        size={18}
        labelClassName="font-medium"
        label={t('onboarding.levelResult.cta')}
        onPress={() => router.push('/(onboarding)/target-level')}
      />
    </Screen>
  );
}
