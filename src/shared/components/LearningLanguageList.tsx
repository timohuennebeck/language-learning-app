import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { LearningLanguage } from '@/features/auth/data/schemas';
import { SelectRow } from '@/shared/components/SelectRow';
import { Flag } from '@/shared/ui/Illustration';
import { Kicker } from '@/shared/ui/Kicker';
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
      <Kicker size={12} tracking={0.07} className="mt-[8px] text-muted">
        {t('common.soon')}
      </Kicker>
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
