import { useRouter, type Href } from 'expo-router';
import { ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/features/auth/hooks/useSession';
import screens from '../../../../design/screens.json';
import { Tap } from '@/shared/ui/Tap';
import { Text } from '@/shared/ui/Text';

type Entry = { name: string; route: string; onboarded?: boolean };

/**
 * Every screen from the Claude Design canvas, in design order, for quick visual checks.
 * The list is the same manifest the screenshot scripts use (`design/screens.json`).
 */
export function DevIndex() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session, update } = useSession();
  const open = (s: Entry) => {
    if (s.onboarded !== undefined && s.onboarded !== session.onboardingComplete)
      update({ onboardingComplete: s.onboarded });
    // Let the protected-route guard swap stacks before navigating into one of them.
    setTimeout(() => router.push(s.route as Href), 0);
  };
  return (
    <ScrollView
      className="flex-1 bg-bg"
      contentContainerStyle={{ padding: 24, paddingTop: 72, rowGap: 6 }}
    >
      <Text className="font-semibold text-ink" style={{ fontSize: 24 }}>
        {t('dev.title')}
      </Text>
      <Text className="mb-[12px] text-muted" style={{ fontSize: 14 }}>
        {t('dev.sub')}
      </Text>
      {(screens as Entry[]).map((s) => (
        <Tap
          key={s.name}
          haptic="light"
          onPress={() => open(s)}
          className="flex-row items-center"
          style={{ columnGap: 10 }}
        >
          <Text className="w-[56px] text-faint" style={{ fontSize: 12 }}>
            {s.name.split('-')[0]}
          </Text>
          <Text className="text-accent-800" style={{ fontSize: 16 }}>
            {s.name.slice(s.name.indexOf('-') + 1)}
          </Text>
          <Text className="text-faint" style={{ fontSize: 12 }}>
            {s.route}
          </Text>
        </Tap>
      ))}
    </ScrollView>
  );
}
