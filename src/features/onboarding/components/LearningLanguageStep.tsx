import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/features/auth/hooks/useSession';
import type { LearningLanguage } from '@/features/auth/data/schemas';
import { OnboardingFrame } from '@/features/onboarding/components/OnboardingFrame';
import { SelectRow } from '@/shared/components/SelectRow';
import { Button } from '@/shared/ui/Button';
import { Flag } from '@/shared/ui/Illustration';
import { Text } from '@/shared/ui/Text';

const LANGS: LearningLanguage[] = ['fr', 'en', 'es'];

/** Language list shared by 03a (onboarding) and 09c (profile). */
export function LearningLanguageList({
  value,
  onChange,
  frSub,
}: {
  value: LearningLanguage;
  onChange: (l: LearningLanguage) => void;
  frSub?: string;
}) {
  const { t } = useTranslation();
  return (
    <View style={{ rowGap: 10 }}>
      {LANGS.map((code) => (
        <SelectRow
          key={code}
          flag={code}
          label={t(`common.language.${code}`)}
          sub={code === 'fr' && frSub ? frSub : t(`common.languageNative.${code}`)}
          selected={value === code}
          onPress={() => onChange(code)}
        />
      ))}
      <Text className="mt-[8px] uppercase text-muted" style={{ fontSize: 12, letterSpacing: 0.84 }}>
        {t('common.soon')}
      </Text>
      <View className="flex-row flex-wrap" style={{ gap: 8 }}>
        <View
          className="flex-row items-center rounded-pill py-[8px] pl-[8px] pr-[14px]"
          style={{ backgroundColor: '#efedf7', columnGap: 9 }}
        >
          <Flag code="de" size={26} opacity={0.7} />
          <Text style={{ fontSize: 15, color: '#5c6070' }}>{t('common.languageNative.de')}</Text>
        </View>
      </View>
    </View>
  );
}

/** 03a · Lernsprache (2 von 13). */
export function LearningLanguageStep() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session, update } = useSession();
  return (
    <OnboardingFrame
      step={2}
      title={t('onboarding.learningLanguage.title')}
      sub={t('onboarding.learningLanguage.sub')}
      footer={
        <Button
          height={60}
          size={17.5}
          label={t('onboarding.learningLanguage.cta')}
          onPress={() => router.push('/(onboarding)/goal')}
        />
      }
    >
      <View className="mt-[22px]">
        <LearningLanguageList
          value={session.learningLanguage}
          onChange={(learningLanguage) => update({ learningLanguage })}
        />
      </View>
    </OnboardingFrame>
  );
}
