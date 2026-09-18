import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/features/auth/hooks/use-session';
import { Headline } from '@/shared/components/headline';
import { isAppLanguage, type AppLanguage } from '@/shared/lib/i18n';
import { SelectRow } from '@/shared/components/select-row';
import { Button } from '@/shared/ui/button';
import { Screen } from '@/shared/ui/screen';
import { TopBar } from '@/shared/ui/top-bar';

const LANGS = ['de', 'en', 'es', 'fr', 'it', 'pt'] as const;

/** 09d · Profil · Interface-Sprache ändern. */
export function AppLanguageScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session, update } = useSession();
  const [value, setValue] = useState<AppLanguage>(session.appLanguage);
  return (
    <Screen bottom={6} className="px-[22px]">
      <TopBar left="back" title={t('profile.appLanguageScreen.title')} />
      <Headline
        size={30}
        titleMarginTop={20}
        title={t('profile.appLanguageScreen.headline')}
        sub={t('profile.appLanguageScreen.sub')}
      />
      <View className="mt-[20px]" style={{ rowGap: 10 }}>
        {LANGS.map((code) => (
          <SelectRow
            key={code}
            flag={code}
            label={t(`common.languageNative.${code}`)}
            selected={value === code}
            disabled={!isAppLanguage(code)}
            onPress={() => {
              if (isAppLanguage(code)) setValue(code);
            }}
          />
        ))}
      </View>
      <View className="flex-1" />
      <Button
        height={60}
        size={17.5}
        label={t('common.save')}
        onPress={() => {
          update({ appLanguage: value });
          router.back();
        }}
      />
    </Screen>
  );
}
