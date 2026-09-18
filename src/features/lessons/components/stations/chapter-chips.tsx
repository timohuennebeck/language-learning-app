import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors } from '@/shared/theme/tokens';
import { CheckIcon, Lock } from '@/shared/ui/icons';
import { Tap } from '@/shared/ui/tap';
import { Text } from '@/shared/ui/text';

/** Chapter selector chips: previous (done), current (active), next (locked). */
export function ChapterChips({ className }: { className?: string }) {
  const { t } = useTranslation();
  const chapters = t('chapter.chapters', { returnObjects: true }) as string[];
  return (
    <View className={className}>
      <View className="flex-row overflow-hidden" style={{ columnGap: 8 }}>
        <Tap
          haptic="selection"
          className="flex-row items-center rounded-pill bg-surface2 px-[13px] py-[8px]"
          style={{ columnGap: 6 }}
        >
          <CheckIcon size={12} color={colors.accent[600]} strokeWidth={2.3} />
          <Text className="text-muted" style={{ fontSize: 13.5 }}>
            {chapters[0]}
          </Text>
        </Tap>
        <Tap haptic="selection" className="rounded-pill bg-accent-800 px-[15px] py-[8px]">
          <Text className="text-accent-100" style={{ fontSize: 13.5 }}>
            {chapters[1]}
          </Text>
        </Tap>
        <Tap
          haptic="selection"
          disabled
          accessibilityState={{ disabled: true }}
          className="flex-row items-center rounded-pill bg-surface2 px-[13px] py-[8px]"
          style={{ columnGap: 6 }}
        >
          <Lock size={12} />
          <Text className="text-dim3" style={{ fontSize: 13.5 }} numberOfLines={1}>
            {chapters[2]}
          </Text>
        </Tap>
      </View>
    </View>
  );
}
