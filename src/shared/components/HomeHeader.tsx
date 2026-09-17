import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib/cn';
import { Avatar } from '@/shared/ui/Illustration';
import { ChevronDown } from '@/shared/ui/icons';
import { Tap } from '@/shared/ui/Tap';
import { Text } from '@/shared/ui/Text';

type Props = {
  /** Chapter screens use a slightly tighter 38px bar with a 14px pill label. */
  compact?: boolean;
  className?: string;
};

/** Avatar (→ profile) on the left, "Französisch · A2" pill (→ languages) on the right. */
export function HomeHeader({ compact = false, className }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <View
      className={cn(
        'flex-row items-center justify-between',
        compact ? 'h-[38px]' : 'h-[40px]',
        className,
      )}
    >
      <Tap
        haptic="light"
        onPress={() => router.push('/(app)/profile')}
        accessibilityLabel={t('profile.title')}
      >
        <Avatar size={34} />
      </Tap>
      <Tap
        haptic="light"
        onPress={() => router.push('/(app)/languages')}
        className="flex-row items-center rounded-pill bg-surface px-[12px] py-[6px]"
        style={{ columnGap: 6 }}
      >
        <Text className="text-accent-900" style={{ fontSize: compact ? 14 : 15 }}>
          {t('common.languagePill')}
        </Text>
        <ChevronDown size={compact ? 13 : 14} strokeWidth={2.4} />
      </Tap>
    </View>
  );
}
