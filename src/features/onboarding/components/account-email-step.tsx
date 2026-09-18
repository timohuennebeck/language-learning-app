import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/features/auth/hooks/use-session';
import { OnboardingFrame } from '@/features/onboarding/components/onboarding-frame';
import { NO_OUTLINE } from '@/shared/lib/styles';
import { colors } from '@/shared/theme/tokens';
import { Button } from '@/shared/ui/button';
import { Eye } from '@/shared/ui/icons';
import { CheckCircle } from '@/shared/ui/marks';
import { Tap } from '@/shared/ui/tap';
import { Kicker } from '@/shared/ui/kicker';
import { Text } from '@/shared/ui/text';

/** 12b · E-Mail und Passwort (16 von 17). With `?mode=login` it is the "Einloggen" page from Welcome. */
export function AccountEmailStep() {
  const { t } = useTranslation();
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const login = mode === 'login';
  const { completeOnboarding } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const rules = [
    { key: 'length', ok: password.length >= 8 },
    { key: 'number', ok: /\d/.test(password) },
    { key: 'special', ok: /[^\p{L}\p{N}\s]/u.test(password) },
  ] as const;
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
      step={login ? undefined : 16}
      title={t(login ? 'onboarding.login.title' : 'onboarding.account.title')}
      sub={t(login ? 'onboarding.login.sub' : 'onboarding.account.sub')}
      footer={
        <>
          <Button
            height={60}
            size={17}
            label={t(login ? 'onboarding.login.cta' : 'onboarding.accountEmail.cta')}
            onPress={() =>
              login ? completeOnboarding() : router.push('/(onboarding)/plus-active')
            }
          />
          {login ? null : (
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
          )}
        </>
      }
    >
      <View className="mt-[24px]" style={{ rowGap: 14 }}>
        <View>
          <Kicker size={13} tracking={0.1} className="text-muted">
            {t('onboarding.accountEmail.email')}
          </Kicker>
          <View className="mt-[7px] flex-row items-center" style={field(focus === 'email')}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocus('email')}
              autoFocus
              placeholder={t('onboarding.accountEmail.emailPlaceholder')}
              placeholderTextColor={colors.faint}
              autoCorrect={false}
              autoCapitalize="none"
              keyboardType="email-address"
              className="flex-1 font-regular text-ink"
              style={[{ fontSize: 17, padding: 0 }, NO_OUTLINE]}
            />
          </View>
        </View>
        <View>
          <Kicker size={13} tracking={0.1} className="text-muted">
            {t('onboarding.accountEmail.password')}
          </Kicker>
          <View
            className="mt-[7px] flex-row items-center justify-between"
            style={field(focus === 'password')}
          >
            <TextInput
              value={password}
              onChangeText={setPassword}
              onFocus={() => setFocus('password')}
              secureTextEntry={!show}
              placeholder={t('onboarding.accountEmail.passwordPlaceholder')}
              placeholderTextColor={colors.faint}
              className="flex-1 font-regular text-ink"
              style={[
                { fontSize: 17, padding: 0, letterSpacing: show || !password ? 0 : 3.74 },
                NO_OUTLINE,
              ]}
            />
            <Tap
              haptic="light"
              onPress={() => setShow((s) => !s)}
              accessibilityLabel={t(
                show
                  ? 'onboarding.accountEmail.hidePassword'
                  : 'onboarding.accountEmail.showPassword',
              )}
            >
              <Eye />
            </Tap>
          </View>
          {login ? null : (
            <View className="mt-[10px]" style={{ rowGap: 6 }}>
              {rules.map((r) => (
                <View key={r.key} className="flex-row items-center" style={{ columnGap: 8 }}>
                  {r.ok ? (
                    <CheckCircle size={18} bg={colors.accent[700]} stroke={2.6} iconSize={10} />
                  ) : (
                    <View
                      className="h-[18px] w-[18px] rounded-full"
                      style={{ boxShadow: `inset 0 0 0 1.5px ${colors.ring}` }}
                    />
                  )}
                  <Text className={r.ok ? 'text-ink' : 'text-muted'} style={{ fontSize: 13.5 }}>
                    {t(`onboarding.accountEmail.rules.${r.key}`)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </OnboardingFrame>
  );
}
