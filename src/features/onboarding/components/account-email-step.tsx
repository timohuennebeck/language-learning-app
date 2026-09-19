import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/features/auth/hooks/use-session';
import { authErrorKey } from '@/features/auth/lib/auth-errors';
import { OnboardingFrame } from '@/features/onboarding/components/onboarding-frame';
import { NO_OUTLINE } from '@/shared/lib/styles';
import { colors } from '@/shared/theme/tokens';
import { Button } from '@/shared/ui/button';
import { Eye } from '@/shared/ui/icons';
import { CheckCircle } from '@/shared/ui/marks';
import { Tap } from '@/shared/ui/tap';
import { Kicker } from '@/shared/ui/kicker';
import { Text } from '@/shared/ui/text';

type Mode = 'signup' | 'login';

/**
 * 12b · E-Mail und Passwort (10 von 13). Creates the account for the anonymous onboarding user;
 * with `?mode=login` (the "Einloggen" entry from Welcome) it signs an existing user in instead.
 */
export function AccountEmailStep() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const { signUp, signIn } = useSession();
  const [mode, setMode] = useState<Mode>(params.mode === 'login' ? 'login' : 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rules = [
    { key: 'length', ok: password.length >= 8 },
    { key: 'number', ok: /\d/.test(password) },
    { key: 'special', ok: /[^\p{L}\p{N}\s]/u.test(password) },
  ] as const;
  const [show, setShow] = useState(false);
  const [focus, setFocus] = useState<'email' | 'password'>('email');
  const login = mode === 'login';
  const valid =
    /\S+@\S+\.\S+/.test(email) && (login ? password.length > 0 : rules.every((r) => r.ok));
  const field = (focused: boolean) => ({
    height: 58,
    borderRadius: 20,
    backgroundColor: '#fff',
    boxShadow: focused ? `0 0 0 2px ${colors.accent[700]}` : `0 0 0 1.5px ${colors.line2}`,
    paddingHorizontal: 18,
  });

  const submit = async () => {
    if (!valid || busy) return;
    setBusy(true);
    setError(null);
    try {
      const session = login
        ? await signIn(email.trim(), password)
        : await signUp(email.trim(), password);
      // A finished onboarding flips the route guard on its own; otherwise continue the flow.
      if (!session.onboardingComplete) router.push('/(onboarding)/plus-active');
    } catch (e) {
      setError(t(authErrorKey(e)));
    } finally {
      setBusy(false);
    }
  };

  const switchMode = () => {
    setMode(login ? 'signup' : 'login');
    setError(null);
  };

  return (
    <OnboardingFrame
      step={10}
      title={login ? t('auth.login.title') : t('onboarding.account.title')}
      sub={login ? t('auth.login.sub') : t('onboarding.account.sub')}
      footer={
        <>
          <Button
            height={60}
            size={17}
            variant={valid && !busy ? 'primary' : 'disabled'}
            disabled={!valid || busy}
            label={login ? t('auth.login.cta') : t('onboarding.accountEmail.cta')}
            onPress={() => void submit()}
          />
          <View className="mt-[14px] flex-row items-center justify-center">
            <Text className="text-ink2" style={{ fontSize: 15 }}>
              {login ? t('common.noAccountYet') : t('common.alreadyMember')}{' '}
            </Text>
            <Tap haptic="light" onPress={switchMode}>
              <Text className="font-semibold text-accent-800" style={{ fontSize: 15 }}>
                {login ? t('common.createAccount') : t('common.signIn')}
              </Text>
            </Tap>
          </View>
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
              textContentType="emailAddress"
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
              onSubmitEditing={() => void submit()}
              secureTextEntry={!show}
              placeholder={t('onboarding.accountEmail.passwordPlaceholder')}
              placeholderTextColor={colors.faint}
              textContentType={login ? 'password' : 'newPassword'}
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
        {error ? (
          <Text
            accessibilityRole="alert"
            style={{ fontSize: 14, lineHeight: 19, color: colors.danger }}
          >
            {error}
          </Text>
        ) : null}
      </View>
    </OnboardingFrame>
  );
}
