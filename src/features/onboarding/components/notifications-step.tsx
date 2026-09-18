import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/features/auth/hooks/use-session';
import { OnboardingFrame } from '@/features/onboarding/components/onboarding-frame';
import { Button, TextButton } from '@/shared/ui/button';
import { CardGradient } from '@/shared/ui/gradient';
import { Illustration } from '@/shared/ui/illustration';
import { Text } from '@/shared/ui/text';

/** 05 · Mitteilungen erlauben (5 von 13). */
export function NotificationsStep() {
  const { t } = useTranslation();
  const router = useRouter();
  const { update } = useSession();
  return (
    <OnboardingFrame
      step={5}
      title={t('onboarding.notifications.title')}
      sub={t('onboarding.notifications.sub')}
      footer={
        <>
          <Button
            height={60}
            size={17.5}
            label={t('onboarding.notifications.cta')}
            onPress={() => router.push('/(onboarding)/reminder-time')}
          />
          <TextButton
            className="mt-[16px]"
            label={t('common.notNow')}
            onPress={() => {
              update({ reminder: null });
              router.push('/(onboarding)/assessment-intro');
            }}
          />
        </>
      }
    >
      <CardGradient className="mt-[18px] p-[18px]" style={{ rowGap: 16 }}>
        <View
          className="flex-row items-start rounded-[20px] px-[14px] py-[13px]"
          style={{
            backgroundColor: 'rgba(255,255,255,.92)',
            columnGap: 12,
            boxShadow: '0 6px 18px rgba(41,43,49,.07)',
          }}
        >
          <View className="h-[40px] w-[40px] items-center justify-center overflow-hidden rounded-[11px]">
            <Illustration name="pip-face" size={40} contentFit="cover" />
          </View>
          <View className="flex-1">
            <View className="flex-row items-baseline" style={{ columnGap: 8 }}>
              <Text
                className="font-semibold text-ink"
                style={{ fontSize: 13, letterSpacing: 0.52 }}
              >
                {t('onboarding.notifications.app')}
              </Text>
              <View className="flex-1" />
              <Text className="text-faint" style={{ fontSize: 12.5 }}>
                {t('onboarding.notifications.now')}
              </Text>
            </View>
            <Text className="mt-[3px] font-semibold text-ink" style={{ fontSize: 15.5 }}>
              {t('onboarding.notifications.notifTitle')}
            </Text>
            <Text className="mt-[2px] text-ink2" style={{ fontSize: 15, lineHeight: 20.25 }}>
              {t('onboarding.notifications.notifBody')}
            </Text>
          </View>
        </View>
        <View className="items-center">
          <Illustration name="pip-wave-2" size={156} />
        </View>
      </CardGradient>
    </OnboardingFrame>
  );
}
