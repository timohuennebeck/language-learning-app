import { useRouter } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/shared/theme/tokens';
import { ChevronRight, MicSmall } from '@/shared/ui/icons';
import { Tap } from '@/shared/ui/tap';
import { Text } from '@/shared/ui/text';

const LIVE = '/(app)/live' as const;

/**
 * Content of the iOS 26 bottom accessory: a persistent "Gespräch starten" strip that floats
 * above the tab bar on every tab and shrinks to icon + short label when the bar minimises.
 */
export function StartTalkAccessory() {
  const { t } = useTranslation();
  const router = useRouter();
  const placement = NativeTabs.BottomAccessory.usePlacement();
  const inline = placement === 'inline';
  return (
    <Tap
      haptic="medium"
      onPress={() => router.push(LIVE)}
      accessibilityLabel={t('tabs.startTalk')}
      className="h-full flex-row items-center"
      style={{ paddingHorizontal: inline ? 10 : 14, columnGap: 10 }}
    >
      <View className="h-[30px] w-[30px] items-center justify-center rounded-full bg-accent-800">
        <MicSmall size={16} />
      </View>
      <Text className="flex-1 font-semibold text-ink" style={{ fontSize: 15 }} numberOfLines={1}>
        {inline ? t('tabs.startTalkShort') : t('tabs.startTalk')}
      </Text>
      {inline ? null : <ChevronRight size={13} color={colors.muted} />}
    </Tap>
  );
}

/** Fallback for Android and iOS < 26: a floating button in the bottom-right of each tab root. */
export function StartTalkFab() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <Tap
      haptic="medium"
      onPress={() => router.push(LIVE)}
      accessibilityLabel={t('tabs.startTalk')}
      className="absolute flex-row items-center rounded-pill bg-accent-800 pl-[14px] pr-[18px]"
      style={{
        right: 22,
        bottom: insets.bottom + 16,
        height: 52,
        columnGap: 9,
        boxShadow: '0 8px 22px rgba(58,52,120,.28)',
      }}
    >
      <MicSmall size={18} />
      <Text className="font-semibold text-accent-100" style={{ fontSize: 15 }}>
        {t('tabs.startTalkShort')}
      </Text>
    </Tap>
  );
}
