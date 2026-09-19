import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useTranslation } from 'react-i18next';

import { colors } from '@/shared/theme/tokens';

/**
 * Each tab's native container is painted in the app background: the Liquid Glass bar is
 * translucent, so without this iOS's white system background shows through and around it.
 */
const CONTENT = { backgroundColor: colors.bg };

/**
 * Bottom tabs: Lernen (today), Kurs (chapter stations), Sprechen (scenarios), Profil.
 * Native UITabBar / BottomNavigationView, so iOS 26 renders it as Liquid Glass.
 * Flows (exercises, reading, calls…) live in the parent stack and cover the bar.
 */
export default function TabsLayout() {
  const { t } = useTranslation();
  return (
    <NativeTabs
      tintColor={colors.accent[800]}
      // No material behind the bar: on iOS 26 this leaves pure Liquid Glass over the content.
      blurEffect="none"
      // No custom label font: the bar's own SF metrics keep the platform spacing between icon and label.
      minimizeBehavior="onScrollDown"
    >
      <NativeTabs.Trigger name="index" contentStyle={CONTENT}>
        <NativeTabs.Trigger.Icon sf="book.pages.fill" md="menu_book" />
        <NativeTabs.Trigger.Label>{t('tabs.learn')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="course" contentStyle={CONTENT}>
        <NativeTabs.Trigger.Icon sf="square.grid.2x2.fill" md="grid_view" />
        <NativeTabs.Trigger.Label>{t('tabs.course')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="speak" contentStyle={CONTENT}>
        <NativeTabs.Trigger.Icon sf="waveform" md="graphic_eq" />
        <NativeTabs.Trigger.Label>{t('tabs.speak')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile" contentStyle={CONTENT}>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'person.crop.circle', selected: 'person.crop.circle.fill' }}
          md="person"
        />
        <NativeTabs.Trigger.Label>{t('tabs.profile')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
