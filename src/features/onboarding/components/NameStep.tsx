import { useRouter } from 'expo-router';
import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/features/auth/hooks/useSession';
import { OnboardingFrame } from '@/features/onboarding/components/OnboardingFrame';
import { colors } from '@/shared/theme/tokens';
import { Button } from '@/shared/ui/Button';
import { CardGradient } from '@/shared/ui/Gradient';
import { Illustration } from '@/shared/ui/Illustration';

/** 04 · Name (4 von 13). */
export function NameStep() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session, update } = useSession();
  const [name, setName] = useState(session.name);
  return (
    <OnboardingFrame
      step={4}
      title={t('onboarding.name.title')}
      sub={t('onboarding.name.sub')}
      footer={
        <Button
          height={60}
          size={17.5}
          label={t('common.next')}
          onPress={() => {
            if (name.trim()) update({ name: name.trim() });
            router.push('/(onboarding)/notifications');
          }}
        />
      }
    >
      <CardGradient
        className="mt-[18px] items-center justify-between p-[20px]"
        style={{ height: 290 }}
      >
        <Illustration name="pip-book-pencil" size={176} />
        <View
          className="w-full flex-row items-center rounded-[18px] bg-white px-[16px] py-[14px]"
          style={{ columnGap: 10 }}
        >
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={t('onboarding.name.placeholder')}
            placeholderTextColor={colors.faint}
            autoCapitalize="words"
            className="flex-1 font-regular text-ink"
            style={{ fontSize: 19, padding: 0, lineHeight: 22 }}
          />
        </View>
      </CardGradient>
    </OnboardingFrame>
  );
}
