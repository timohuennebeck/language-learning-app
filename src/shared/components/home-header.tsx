import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib/cn';
import { DropdownPill } from '@/shared/ui/dropdown-pill';
import { Avatar } from '@/shared/ui/illustration';
import { Tap } from '@/shared/ui/tap';

type Props = { className?: string };

/** Avatar (→ profile) on the left, "Französisch · A2" pill (→ languages) on the right. */
export function HomeHeader({ className }: Props) {
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
      <DropdownPill
        label={t('common.languagePill')}
        onPress={() => router.push('/(app)/languages')}
      />
    </View>
  );
}
