import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Gradient } from '@/shared/ui/gradient';
import { Illustration } from '@/shared/ui/illustration';
import { Text } from '@/shared/ui/text';

type Props = { children?: React.ReactNode; holdMs?: number };

/** 01 · Splash. Shows the brand for a moment, then renders `children` (typically a Redirect). */
export function SplashScreen({ children, holdMs = 900 }: Props) {
  const { t } = useTranslation();
  const [done, setDone] = useState(holdMs === 0);
  useEffect(() => {
    const id = setTimeout(() => setDone(true), holdMs);
    return () => clearTimeout(id);
  }, [holdMs]);
  if (done && children) return <>{children}</>;
  return (
    <Gradient
      colors={['#e7e5fe', '#eeedfe', '#f3f5fe']}
      locations={[0, 0.52, 1]}
      className="flex-1 items-center justify-center overflow-hidden"
      style={{ rowGap: 18 }}
    >
      <Illustration name="pip-wave" size={190} />
      <View className="items-center">
        <Text className="font-semibold text-ink" style={{ fontSize: 38, letterSpacing: -1.52 }}>
          {t('splash.brand')}
        </Text>
      </View>
    </Gradient>
  );
}
