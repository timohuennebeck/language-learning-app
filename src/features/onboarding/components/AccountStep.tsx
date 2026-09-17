import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { OnboardingFrame } from '@/features/onboarding/components/OnboardingFrame';
import { colors } from '@/shared/theme/tokens';
import { Button } from '@/shared/ui/Button';
import { Gradient } from '@/shared/ui/Gradient';
import { Illustration } from '@/shared/ui/Illustration';
import { GoogleLogo, PhoneDevice } from '@/shared/ui/icons';
import { Text } from '@/shared/ui/Text';

/** 12 · Konto (10 von 13). */
export function AccountStep() {
  const { t } = useTranslation();
  const router = useRouter();
  const link = (label: string) => (
    <Text
      className="text-accent-700 underline"
      style={{ fontSize: 13.5 }}
      onPress={() => router.push('/(onboarding)/terms')}
    >
      {label}
    </Text>
  );
  return (
    <OnboardingFrame
      step={10}
      title={t('onboarding.account.title')}
      sub={t('onboarding.account.sub')}
      footer={
        <Text className="text-center text-muted" style={{ fontSize: 13.5, lineHeight: 20.25 }}>
          {t('onboarding.account.legal1')}
          {link(t('common.terms'))}
          {t('onboarding.account.legal2')}
          {link(t('common.privacy'))}
          {t('onboarding.account.legal3')}
        </Text>
      }
    >
      <Gradient
        colors={['#eeedfe', '#e7e5fe']}
        start={{ x: 0.12, y: 0 }}
        end={{ x: 0.88, y: 1 }}
        className="mt-[18px] items-center justify-center overflow-hidden rounded-[26px]"
        style={{ height: 280 }}
      >
        <Illustration name="pip-key" size={213} />
      </Gradient>
      <View className="mt-[22px]" style={{ rowGap: 12 }}>
        <Button
          height={60}
          size={17}
          label={t('onboarding.account.phone')}
          left={<PhoneDevice />}
          className="[column-gap:2px]"
          onPress={() => router.push('/(onboarding)/account-email')}
        />
        <Button
          height={60}
          size={17}
          variant="outline"
          label={t('onboarding.account.google')}
          labelClassName="text-ink"
          left={<GoogleLogo />}
          style={{
            height: 60,
            borderWidth: 0,
            backgroundColor: '#fff',
            boxShadow: `0 0 0 1.5px ${colors.line2}`,
          }}
          onPress={() => router.push('/(onboarding)/plus-active')}
        />
      </View>
    </OnboardingFrame>
  );
}
