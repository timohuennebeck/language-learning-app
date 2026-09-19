import { useRouter } from 'expo-router';
import { EnvelopeIcon } from 'phosphor-react-native';
import { Alert, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors } from '@/shared/theme/tokens';
import { OnboardingFrame } from '@/features/onboarding/components/onboarding-frame';
import { Button } from '@/shared/ui/button';
import { CardGradient } from '@/shared/ui/gradient';
import { Illustration } from '@/shared/ui/illustration';
import { GoogleLogo } from '@/shared/ui/google-logo';
import { Text } from '@/shared/ui/text';
import { TextLink } from '@/shared/ui/text-link';

/**
 * 12 · Konto (10 von 13). Both buttons lead to the email screen for now: phone sign-in needs an
 * SMS provider and Google/Apple need native sign-in modules (see docs/database-plan.md §2).
 */
export function AccountStep() {
  const { t } = useTranslation();
  const router = useRouter();
  const link = (label: string, doc?: 'privacy') => (
    <TextLink
      style={{ fontSize: 13.5 }}
      onPress={() => router.push({ pathname: '/(onboarding)/terms', params: doc ? { doc } : {} })}
    >
      {label}
    </TextLink>
  );
  return (
    <OnboardingFrame
      step={16}
      title={t('onboarding.account.title')}
      sub={t('onboarding.account.sub')}
      footer={
        <Text className="text-center text-muted" style={{ fontSize: 13.5, lineHeight: 20.25 }}>
          {t('onboarding.account.legal1')}
          {link(t('common.terms'))}
          {t('onboarding.account.legal2')}
          {link(t('common.privacy'), 'privacy')}
          {t('onboarding.account.legal3')}
        </Text>
      }
    >
      <CardGradient className="mt-[18px] items-center justify-center" style={{ height: 280 }}>
        <Illustration name="pip-key" size={213} />
      </CardGradient>
      <View className="mt-[22px]" style={{ rowGap: 12 }}>
        <Button
          height={60}
          size={17}
          label={t('onboarding.account.email')}
          left={<EnvelopeIcon size={20} color={colors.accent[100]} weight="regular" />}
          className="[column-gap:2px]"
          onPress={() => router.push('/(onboarding)/account-email')}
        />
        <Button
          height={60}
          size={17}
          variant="white"
          label={t('onboarding.account.google')}
          left={<GoogleLogo />}
          onPress={() => Alert.alert(t('auth.providerSoon'))}
        />
      </View>
    </OnboardingFrame>
  );
}
