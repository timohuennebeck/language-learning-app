import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/features/auth/hooks/useSession';
import { OnboardingFrame } from '@/features/onboarding/components/OnboardingFrame';
import { SelectRow } from '@/shared/components/SelectRow';
import { Button } from '@/shared/ui/Button';

const LANGS = ['de', 'en', 'es', 'fr', 'it', 'pt'] as const;

/** 03 · App-Sprache (1 von 13). */
export function AppLanguageStep() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session, update } = useSession();
  return (
    <OnboardingFrame
      step={1}
      title={t('onboarding.appLanguage.title')}
      sub={t('onboarding.appLanguage.sub')}
      footer={
        <Button
          height={60}
          size={17.5}
          label={t('common.next')}
          onPress={() => router.push('/(onboarding)/learning-language')}
        />
      }
    >
      <View className="mt-[22px]" style={{ rowGap: 10 }}>
        {LANGS.map((code) => (
          <SelectRow
            key={code}
            flag={code}
            label={t(`common.languageNative.${code}`)}
            selected={session.appLanguage === code}
            onPress={() => {
              if (code === 'de' || code === 'en') update({ appLanguage: code });
            }}
          />
        ))}
      </View>
    </OnboardingFrame>
  );
}
