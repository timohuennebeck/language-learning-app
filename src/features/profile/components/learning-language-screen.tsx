import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { LearningLanguage } from '@/features/auth/data/types';
import { useSession } from '@/features/auth/hooks/use-session';
import { LearningLanguageList } from '@/shared/components/learning-language-list';
import { TitledFrame } from '@/shared/components/titled-frame';
import { Button } from '@/shared/ui/button';

/** 09c · Profil · Lernsprache ändern. */
export function LearningLanguageScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session, update } = useSession();
  const [value, setValue] = useState<LearningLanguage>(session.learningLanguage);
  return (
    <TitledFrame
      title={t('profile.learningLanguageScreen.title')}
      headline={t('profile.learningLanguageScreen.headline')}
      sub={t('profile.learningLanguageScreen.sub')}
      footer={
        <Button
          height={60}
          size={17.5}
          label={t('common.save')}
          onPress={() => {
            update({ learningLanguage: value });
            router.back();
          }}
        />
      }
    >
      <LearningLanguageList
        className="mt-[20px]"
        value={value}
        onChange={setValue}
        frSub={t('profile.learningLanguageScreen.frSub')}
      />
    </TitledFrame>
  );
}
