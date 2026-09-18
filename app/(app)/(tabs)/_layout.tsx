import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useTranslation } from 'react-i18next';

import { StartTalkAccessory } from '@/shared/components/start-talk-bar';
import { HAS_TAB_ACCESSORY } from '@/shared/lib/platform';
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
      // No custom label font: the bar's own SF metrics keep the platform spacing between icon and label.
      minimizeBehavior="onScrollDown"
    >
      {HAS_TAB_ACCESSORY ? (
        <NativeTabs.BottomAccessory>
          <StartTalkAccessory />
        </NativeTabs.BottomAccessory>
      ) : null}
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon sf="book.pages.fill" md="menu_book" />
        <NativeTabs.Trigger.Label>{t('tabs.learn')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="course">
        <NativeTabs.Trigger.Icon sf="asterisk" md="emergency" />
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
