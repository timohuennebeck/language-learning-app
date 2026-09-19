import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/features/auth/hooks/use-session';
import { avatarUrl } from '@/features/profile/data/avatar';
import { cn } from '@/shared/lib/cn';
import { DropdownPill } from '@/shared/ui/dropdown-pill';
import { Avatar } from '@/shared/ui/illustration';
import { Tap } from '@/shared/ui/tap';

interface Props {
  className?: string;
  /** Extra control rendered after the language pill (e.g. the settings cog on Profil). */
  right?: ReactNode;
  /** Hide the avatar shortcut (the profile tab shows the big one right below). */
  avatar?: boolean;
}

/** Avatar (→ profile) on the left, "Französisch · A2" pill (→ languages) on the right. */
export function HomeHeader({ className, right, avatar = true }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const { session } = useSession();
  return (
    <View className={cn('h-[40px] flex-row items-center justify-between', className)}>
      {avatar ? (
        <Tap
          haptic="light"
          onPress={() => router.push('/(app)/(tabs)/profile')}
          accessibilityLabel={t('profile.title')}
        >
          <Avatar size={34} uri={avatarUrl(session.avatarPath)} />
        </Tap>
      ) : (
        <View />
      )}
      <View className="flex-row items-center" style={{ columnGap: 10 }}>
        <DropdownPill
          label={t('common.languagePill')}
          onPress={() => router.push('/(app)/languages')}
        />
        {right}
      </View>
    </View>
  );
}
