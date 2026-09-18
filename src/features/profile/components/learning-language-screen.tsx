import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/features/auth/hooks/use-session';
import type { LearningLanguage } from '@/features/auth/data/schemas';
import { LearningLanguageList } from '@/shared/components/learning-language-list';
import { Headline } from '@/shared/components/headline';
import { Button } from '@/shared/ui/button';
import { Screen } from '@/shared/ui/screen';
import { TopBar } from '@/shared/ui/top-bar';

/** 09c · Profil · Lernsprache ändern. */
export function LearningLanguageScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session, update } = useSession();
  const [value, setValue] = useState<LearningLanguage>(session.learningLanguage);
  return (
    <Screen top={0} bottom={6} className="px-[22px]">
      <TopBar left="back" title={t('profile.learningLanguageScreen.title')} />
      <Headline
        size={30}
        titleMarginTop={20}
        title={t('profile.learningLanguageScreen.headline')}
        sub={t('profile.learningLanguageScreen.sub')}
      />
      <View className="mt-[20px]">
        <LearningLanguageList
          value={value}
          onChange={setValue}
          frSub={t('profile.learningLanguageScreen.frSub')}
        />
      </View>
      <View className="flex-1" />
      <Button
        height={60}
        size={17.5}
        label={t('common.save')}
        onPress={() => {
          update({ learningLanguage: value });
          router.back();
        }}
      />
    </Screen>
  );
}
