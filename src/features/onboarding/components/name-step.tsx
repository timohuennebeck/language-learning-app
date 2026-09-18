import { useRouter } from 'expo-router';
import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/features/auth/hooks/use-session';
import { OnboardingFrame } from '@/features/onboarding/components/onboarding-frame';
import { NO_OUTLINE } from '@/shared/lib/styles';
import { colors } from '@/shared/theme/tokens';
import { Button } from '@/shared/ui/button';
import { CardGradient } from '@/shared/ui/gradient';
import { Illustration } from '@/shared/ui/illustration';

/** 04 · Name (4 von 13). */
export function NameStep() {
  const { t } = useTranslation();
  const router = useRouter();
  const { update } = useSession();
  const [name, setName] = useState('');
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
          className="w-full flex-row items-center rounded-[20px] bg-white px-[18px]"
          style={{ columnGap: 10, height: 62 }}
        >
          <TextInput
            autoFocus
            returnKeyType="done"
            value={name}
            onChangeText={setName}
            placeholder={t('onboarding.name.placeholder')}
            placeholderTextColor={colors.faint}
            autoCapitalize="words"
            className="flex-1 font-regular text-ink"
            style={[{ fontSize: 20, padding: 0, lineHeight: 24 }, NO_OUTLINE]}
          />
        </View>
      </CardGradient>
    </OnboardingFrame>
  );
}
