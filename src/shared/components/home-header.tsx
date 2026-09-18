import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib/cn';
import { Avatar } from '@/shared/ui/illustration';
import { ChevronDown } from '@/shared/ui/icons';
import { Tap } from '@/shared/ui/tap';
import { Text } from '@/shared/ui/text';

type Props = {
  className?: string;
  /** Extra control rendered after the language pill (e.g. the settings cog on Profil). */
  right?: ReactNode;
};

/** Avatar (→ profile) on the left, "Französisch · A2" pill (→ languages) on the right. */
export function HomeHeader({ className, right }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <View className={cn('h-[40px] flex-row items-center justify-between', className)}>
      <Tap
        haptic="light"
        onPress={() => router.push('/(app)/(tabs)/profile')}
        accessibilityLabel={t('profile.title')}
      >
        <Avatar size={34} />
      </Tap>
      <View className="flex-row items-center" style={{ columnGap: 10 }}>
        <Tap
          haptic="light"
          onPress={() => router.push('/(app)/languages')}
          className="flex-row items-center rounded-pill bg-surface px-[12px] py-[6px]"
          style={{ columnGap: 6 }}
        >
          <Text className="text-accent-900" style={{ fontSize: 15 }}>
            {t('common.languagePill')}
          </Text>
          <ChevronDown size={14} strokeWidth={2.4} />
        </Tap>
        {right}
      </View>
    </View>
  );
}
