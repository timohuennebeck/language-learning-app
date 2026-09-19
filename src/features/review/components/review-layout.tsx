import { TopTabs, type MaterialTopTabBarProps } from 'expo-router/js-top-tabs';
import { useTranslation } from 'react-i18next';

import { ReviewTabBar } from '@/features/review/components/review-tab-bar';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';
import { TopBar } from '@/shared/ui/top-bar';

/** 3h · Rückblick: header plus swipeable Wörter / Umschrieben pages (material top tabs). */
export function ReviewLayout() {
  const { t } = useTranslation();
  return (
    <Screen bottom={6} className="px-[22px]">
      <TopBar left="close" title={t('review.title')} titleSize={20} />
      <Text className="mt-[8px] text-center text-sub" style={{ fontSize: 17 }}>
        {t('review.meta')}
      </Text>
      <TopTabs
        tabBar={(props: MaterialTopTabBarProps) => <ReviewTabBar {...props} />}
        screenOptions={{ sceneStyle: { backgroundColor: 'transparent' } }}
      >
        <TopTabs.Screen name="index" />
        <TopTabs.Screen name="next" />
      </TopTabs>
    </Screen>
  );
}
