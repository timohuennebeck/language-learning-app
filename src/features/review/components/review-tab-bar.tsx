import type { TabNavigationState } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { nextTime, recapWords } from '@/features/review/data/content';
import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/theme/tokens';
import { Tap } from '@/shared/ui/tap';
import { Text } from '@/shared/ui/text';

/** Per-page lead sentence, tab label and count, keyed by route name. */
const PAGES: Record<string, { lead: string; label: string; count: number }> = {
  index: { lead: 'review.leadWords', label: 'review.tabWords', count: recapWords.length },
  next: { lead: 'review.leadNext', label: 'review.tabNext', count: nextTime.length },
};

interface Props {
  state: TabNavigationState<Record<string, object | undefined>>;
  navigation: {
    emit: (event: { type: 'tabPress'; target: string; canPreventDefault: true }) => {
      defaultPrevented: boolean;
    };
    navigate: (name: string) => void;
  };
}

/** Lead sentence plus the two underlined tabs with count pills; tapping or swiping switches pages. */
export function ReviewTabBar({ state, navigation }: Props) {
  const { t } = useTranslation();
  const active = state.routes[state.index].name;
  return (
    <View>
      <Text
        className="mt-[22px] text-sub"
        style={{ fontSize: 15, lineHeight: 20.25, minHeight: 41 }}
      >
        {t(PAGES[active]?.lead ?? PAGES.index.lead)}
      </Text>
      <View className="mt-[14px] flex-row">
        {state.routes.map((route, i) => {
          const on = i === state.index;
          const page = PAGES[route.name] ?? PAGES.index;
          return (
            <Tap
              key={route.key}
              haptic="selection"
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!on && !event.defaultPrevented) navigation.navigate(route.name);
              }}
              className="flex-1 flex-row items-center justify-center pb-[12px] pt-[10px]"
              style={{
                columnGap: 8,
                borderBottomWidth: 2,
                borderColor: on ? colors.accent[800] : colors.neutral[200],
              }}
            >
              <Text
                className={cn('font-medium', on ? 'text-accent-900' : 'text-muted')}
                style={{ fontSize: 16 }}
              >
                {t(page.label)}
              </Text>
              <View
                className={cn(
                  'min-w-[22px] items-center rounded-pill px-[7px] py-[2px]',
                  on ? 'bg-accent-800' : 'bg-neutral-200',
                )}
              >
                <Text
                  className={cn('font-medium', on ? 'text-accent-100' : 'text-muted')}
                  style={{ fontSize: 13, fontVariant: ['tabular-nums'] }}
                >
                  {page.count}
                </Text>
              </View>
            </Tap>
          );
        })}
      </View>
    </View>
  );
}
