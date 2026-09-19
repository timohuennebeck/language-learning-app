import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { SelectRow } from '@/shared/components/select-row';
import { isAppLanguage, type AppLanguage } from '@/shared/lib/i18n';
import type { FlagCode } from '@/shared/ui/illustration';

/** Every interface language the design lists; only the supported ones are selectable. */
const OPTIONS: FlagCode[] = ['de', 'en', 'es', 'fr', 'it', 'pt'];

interface Props {
  value: AppLanguage;
  onChange: (l: AppLanguage) => void;
  className?: string;
}

/** Interface-language list shared by 03 (onboarding) and 09d (profile). */
export function AppLanguageList({ value, onChange, className }: Props) {
  const { t } = useTranslation();
  return (
    <View className={className} style={{ rowGap: 10 }}>
      {OPTIONS.map((code) => (
        <SelectRow
          key={code}
          flag={code}
          label={t(`common.languageNative.${code}`)}
          selected={value === code}
          disabled={!isAppLanguage(code)}
          onPress={() => {
            if (isAppLanguage(code)) onChange(code);
          }}
        />
      ))}
    </View>
  );
}
