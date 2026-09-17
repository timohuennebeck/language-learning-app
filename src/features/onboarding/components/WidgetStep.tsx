import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/features/auth/hooks/useSession';
import { Headline } from '@/shared/components/Headline';
import { colors } from '@/shared/theme/tokens';
import { Button, TextButton } from '@/shared/ui/Button';
import { NavCircle } from '@/shared/ui/NavCircle';
import { Screen } from '@/shared/ui/Screen';
import { Text } from '@/shared/ui/Text';

const w = colors.widget;

/** 13b · Widget (optional last onboarding step). Finishing it completes onboarding. */
export function WidgetStep() {
  const { t } = useTranslation();
  const router = useRouter();
  const { completeOnboarding } = useSession();
  const finish = () => {
    completeOnboarding();
    router.replace('/(app)');
  };
  return (
    <Screen top={-4} bottom={0} className="px-[20px]">
      <View className="h-[34px] justify-center">
        <NavCircle icon="close" onPress={finish} />
      </View>
      <Headline title={t('onboarding.widget.title')} sub={t('onboarding.widget.sub')} />
      <View
        className="mt-[18px] rounded-[26px] p-[18px]"
        style={{ backgroundColor: w.bg, rowGap: 14 }}
      >
        <View className="flex-row" style={{ columnGap: 14 }}>
          <View
            className="rounded-[22px] bg-white p-[14px]"
            style={{ width: 156, height: 156, borderWidth: 1.5, borderColor: colors.line2 }}
          >
            <Text className="uppercase text-muted" style={{ fontSize: 11, letterSpacing: 1.1 }}>
              {t('onboarding.widget.kicker')}
            </Text>
            <View className="mt-[10px] flex-row items-end">
              <Text className="text-ink" style={{ fontSize: 19, lineHeight: 24.7 }}>
                {t('onboarding.widget.sentence')}
              </Text>
              <View
                style={{
                  width: 56,
                  height: 21,
                  borderBottomWidth: 2,
                  borderColor: colors.accent[700],
                }}
              />
            </View>
            <View className="flex-1" />
            <View className="flex-row" style={{ columnGap: 6 }}>
              <View className="flex-1 items-center rounded-pill bg-surface py-[8px]">
                <Text className="text-accent-900" style={{ fontSize: 13.5 }}>
                  {t('onboarding.widget.opt1')}
                </Text>
              </View>
              <View
                className="flex-1 items-center rounded-pill py-[8px]"
                style={{ backgroundColor: '#f1f0fa' }}
              >
                <Text className="text-muted" style={{ fontSize: 13.5 }}>
                  {t('onboarding.widget.opt2')}
                </Text>
              </View>
            </View>
          </View>
          <View className="flex-1 flex-row flex-wrap" style={{ gap: 14 }}>
            {[w.tile1, w.tile2, w.tile3, w.tile4].map((c, i) => (
              <View
                key={i}
                className="rounded-[18px]"
                style={{ width: 71, height: 71, backgroundColor: c }}
              />
            ))}
          </View>
        </View>
        <View className="flex-row" style={{ columnGap: 14 }}>
          {[w.tile1, w.tile2, w.tile3].map((c, i) => (
            <View
              key={i}
              className="rounded-[19px]"
              style={{ width: 71, height: 71, backgroundColor: c }}
            />
          ))}
        </View>
        <View
          className="mt-[2px] flex-row justify-between rounded-[24px] px-[12px] py-[10px]"
          style={{ backgroundColor: w.dock }}
        >
          {[w.dock1, w.dock2, w.dock1, w.dock2].map((c, i) => (
            <View
              key={i}
              className="rounded-[17px]"
              style={{ width: 62, height: 62, backgroundColor: c }}
            />
          ))}
        </View>
      </View>
      <View className="flex-1" />
      <Button height={60} size={17.5} label={t('onboarding.widget.cta')} onPress={finish} />
      <TextButton className="mt-[16px]" label={t('common.maybeLater')} onPress={finish} />
    </Screen>
  );
}
