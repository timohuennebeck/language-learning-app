import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '@/shared/ui/text';

type Props = { style?: StyleProp<ViewStyle>; size?: number; paddingVertical?: number };

/** Absolutely positioned "Empfohlen" pill hanging over a card edge. Position via `style`. */
export function RecommendedBadge({ style, size = 12, paddingVertical = 4 }: Props) {
  const { t } = useTranslation();
  return (
    <View
      className="absolute rounded-pill bg-accent-800 px-[12px]"
      style={[{ paddingVertical, zIndex: 2 }, style]}
    >
      <Text className="font-semibold text-accent-100" style={{ fontSize: size }}>
        {t('common.recommended')}
      </Text>
    </View>
  );
}
