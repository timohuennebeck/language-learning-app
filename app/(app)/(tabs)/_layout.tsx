import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useTranslation } from 'react-i18next';

import { colors } from '@/shared/theme/tokens';

/**
 * Bottom tabs: Lernen (today), Kurs (chapter stations), Profil.
 * Native UITabBar / BottomNavigationView, so iOS 26 renders it as Liquid Glass.
 * Flows (exercises, reading, calls…) live in the parent stack and cover the bar.
 */
export default function TabsLayout() {
  const { t } = useTranslation();
  return (
    <NativeTabs
      tintColor={colors.accent[800]}
      // The glass bar is translucent: paint the container behind it in the app background,
      // otherwise iOS's white system background shows through and around the bar.
      contentStyle={{ backgroundColor: colors.bg }}
      // No custom label font: the bar's own SF metrics keep the platform spacing between icon and label.
      minimizeBehavior="onScrollDown"
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon sf="book.pages.fill" md="menu_book" />
        <NativeTabs.Trigger.Label>{t('tabs.learn')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="course">
        <NativeTabs.Trigger.Icon sf="square.grid.2x2.fill" md="grid_view" />
        <NativeTabs.Trigger.Label>{t('tabs.course')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Icon
          sf={{ default: 'person.crop.circle', selected: 'person.crop.circle.fill' }}
          md="person"
        />
        <NativeTabs.Trigger.Label>{t('tabs.profile')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
