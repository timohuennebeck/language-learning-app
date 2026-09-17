import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { forms } from '@/features/grammar/data/content';
import { colors } from '@/shared/theme/tokens';
import { Button } from '@/shared/ui/Button';
import { Illustration } from '@/shared/ui/Illustration';
import { Play } from '@/shared/ui/icons';
import { Ring } from '@/shared/ui/Ring';
import { Screen } from '@/shared/ui/Screen';
import { Tap } from '@/shared/ui/Tap';
import { Text } from '@/shared/ui/Text';
import { TopBar } from '@/shared/ui/TopBar';

/** 05 · Grammatik-Auswertung. */
export function GrammarScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <Screen top={0} bottom={6} className="px-[22px]">
      <TopBar left="back" title={t('grammar.title')} titleSize={20} />
      <View
        className="relative mt-[22px] overflow-hidden rounded-[26px] bg-surface px-[24px] py-[22px]"
        style={{ height: 236 }}
      >
        <View className="flex-row items-center" style={{ columnGap: 8 }}>
          <View className="rounded-pill bg-bg px-[9px] py-[4px]">
            <Text
              className="uppercase text-accent-800"
              style={{ fontSize: 11, letterSpacing: 0.66 }}
            >
              {t('grammar.weakest')}
            </Text>
          </View>
          <Text className="uppercase text-accent-800" style={{ fontSize: 11, letterSpacing: 1.32 }}>
            {t('grammar.weakestSub')}
          </Text>
        </View>
        <Text
          className="mt-[16px] font-medium text-accent-900"
          style={{ fontSize: 32, lineHeight: 32, letterSpacing: -0.64 }}
        >
          {t('grammar.form')}
        </Text>
        <Text
          className="mt-[10px] text-sub"
          style={{ fontSize: 14, lineHeight: 18.9, maxWidth: 180 }}
        >
          {t('grammar.meta')}
        </Text>
        <Illustration
          name="pip-glasses-book"
          size={118}
          style={{ position: 'absolute', right: 2, bottom: 8 }}
        />
        <Tap
          haptic="medium"
          onPress={() => router.push('/(app)/exercise/preparing')}
          className="absolute flex-row items-center rounded-pill bg-accent-800 px-[18px] py-[11px]"
          style={{ left: 24, bottom: 22, columnGap: 8 }}
        >
          <Play size={14} color={colors.accent[100]} />
          <Text className="font-medium text-accent-100" style={{ fontSize: 15 }}>
            {t('grammar.practiceNow')}
          </Text>
        </Tap>
      </View>
      <View className="mt-[26px] flex-row items-baseline justify-between">
        <Text className="text-sub" style={{ fontSize: 17 }}>
          {t('grammar.used')}
        </Text>
        <Text className="font-medium text-accent-800" style={{ fontSize: 15 }}>
          {t('grammar.score')}
        </Text>
      </View>
      <View className="mt-[4px] flex-1 overflow-hidden">
        {forms.map((f) => {
          const p = f.score[0] / f.score[1];
          return (
            <Tap
              key={f.name}
              haptic="light"
              className="flex-row items-center py-[11px]"
              style={{ columnGap: 16 }}
            >
              <Ring
                size={48}
                stroke={5}
                progress={p}
                trackColor={colors.bg}
                color={f.ok ? colors.accent[600] : colors.faint}
              >
                <Text className="font-medium text-accent-900" style={{ fontSize: 12 }}>
                  {f.score[0]}/{f.score[1]}
                </Text>
              </Ring>
              <View className="flex-1">
                <Text className="text-text" style={{ fontSize: 18, lineHeight: 21.6 }}>
                  {f.name}
                </Text>
                <Text className="text-muted" style={{ fontSize: 14 }}>
                  {f.ko}
                </Text>
              </View>
              <Text style={{ fontSize: 14, color: f.ok ? colors.accent[800] : colors.muted }}>
                {Math.round(p * 100)}%
              </Text>
            </Tap>
          );
        })}
      </View>
      <Button
        className="mt-[14px]"
        height={58}
        size={17.5}
        labelClassName="font-medium"
        label={t('grammar.finish')}
        onPress={() => router.push('/(app)/streak')}
      />
    </Screen>
  );
}
