import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/features/auth/hooks/use-session';
import { AppLanguageList } from '@/shared/components/app-language-list';
import { TitledFrame } from '@/shared/components/titled-frame';
import type { AppLanguage } from '@/shared/lib/i18n';
import { Button } from '@/shared/ui/button';

/** 09d · Profil · Interface-Sprache ändern. */
export function AppLanguageScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session, update } = useSession();
  const [value, setValue] = useState<AppLanguage>(session.appLanguage);
  return (
    <TitledFrame
      title={t('profile.appLanguageScreen.title')}
      headline={t('profile.appLanguageScreen.headline')}
      sub={t('profile.appLanguageScreen.sub')}
      footer={
        <Button
          height={60}
          size={17.5}
          label={t('common.save')}
          onPress={() => {
            update({ appLanguage: value });
            router.back();
          }}
        />
      }
    >
      <AppLanguageList className="mt-[20px]" value={value} onChange={setValue} />
    </TitledFrame>
  );
}
