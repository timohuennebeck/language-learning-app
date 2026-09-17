import { useRouter } from 'expo-router';
import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/features/auth/hooks/useSession';
import { OnboardingFrame } from '@/features/onboarding/components/OnboardingFrame';
import { colors } from '@/shared/theme/tokens';
import { Button } from '@/shared/ui/Button';
import { CheckIcon, Eye } from '@/shared/ui/icons';
import { Tap } from '@/shared/ui/Tap';
import { Text } from '@/shared/ui/Text';

/** 12b · E-Mail und Passwort (10 von 13). Also used as the "Einloggen" entry from Welcome. */
export function AccountEmailStep() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session, completeOnboarding } = useSession();
  const [email, setEmail] = useState(t('onboarding.accountEmail.emailValue'));
  const [password, setPassword] = useState('12345678');
  const [show, setShow] = useState(false);
  const [focus, setFocus] = useState<'email' | 'password'>('email');
  const field = (focused: boolean) => ({
    height: 58,
    borderRadius: 20,
    backgroundColor: '#fff',
    boxShadow: focused ? `0 0 0 2px ${colors.accent[700]}` : `0 0 0 1.5px ${colors.line2}`,
    paddingHorizontal: 18,
  });
  return (
    <OnboardingFrame
      step={10}
      title={t('onboarding.account.title')}
      sub={t('onboarding.account.sub')}
      footer={
        <>
          <Button
            height={60}
            size={17}
            label={t('onboarding.accountEmail.cta')}
            onPress={() =>
              session.onboardingComplete ? router.back() : router.push('/(onboarding)/plus-active')
            }
          />
          <View className="mt-[14px] flex-row items-center justify-center">
            <Text className="text-ink2" style={{ fontSize: 15 }}>
              {t('common.alreadyMember')}{' '}
            </Text>
            <Tap haptic="light" onPress={() => completeOnboarding()}>
              <Text className="font-semibold text-accent-800" style={{ fontSize: 15 }}>
                {t('common.signIn')}
              </Text>
            </Tap>
          </View>
        </>
      }
    >
      <View className="mt-[24px]" style={{ rowGap: 14 }}>
        <View>
          <Text className="uppercase text-muted" style={{ fontSize: 13, letterSpacing: 1.3 }}>
            {t('onboarding.accountEmail.email')}
          </Text>
          <View className="mt-[7px] flex-row items-center" style={field(focus === 'email')}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocus('email')}
              autoCapitalize="none"
              keyboardType="email-address"
              className="flex-1 font-regular text-ink"
              style={{ fontSize: 17, padding: 0 }}
            />
          </View>
        </View>
        <View>
          <Text className="uppercase text-muted" style={{ fontSize: 13, letterSpacing: 1.3 }}>
            {t('onboarding.accountEmail.password')}
          </Text>
          <View
            className="mt-[7px] flex-row items-center justify-between"
            style={field(focus === 'password')}
          >
            <TextInput
              value={password}
              onChangeText={setPassword}
              onFocus={() => setFocus('password')}
              secureTextEntry={!show}
              className="flex-1 font-regular text-ink"
              style={{ fontSize: 17, padding: 0, letterSpacing: show ? 0 : 3.74 }}
            />
            <Tap haptic="light" onPress={() => setShow((s) => !s)}>
              <Eye />
            </Tap>
          </View>
          <View className="mt-[8px] flex-row items-center" style={{ columnGap: 7 }}>
            <CheckIcon size={15} color={colors.accent[700]} strokeWidth={2.4} />
            <Text className="text-muted" style={{ fontSize: 13.5 }}>
              {t('onboarding.accountEmail.hint')}
            </Text>
          </View>
        </View>
      </View>
    </OnboardingFrame>
  );
}
