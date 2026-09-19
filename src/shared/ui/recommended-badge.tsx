import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '@/shared/ui/text';

interface Props {
  style?: StyleProp<ViewStyle>;
  size?: number;
  paddingVertical?: number;
}

/**
 * Absolutely positioned "Empfohlen" pill hanging over a card edge. Render it as the LAST child of
 * the list that holds the card (positioned from the card's measured layout), never inside the
 * card: a child outside its card is clipped on Android and painted under neighbouring rings on iOS.
 */
export function RecommendedBadge({ style, size = 12, paddingVertical = 4 }: Props) {
  const { t } = useTranslation();
  return (
    <View
      className="absolute rounded-pill bg-accent-800 px-[12px]"
      style={[{ paddingVertical }, style]}
    >
      <Text className="font-semibold text-accent-100" style={{ fontSize: size }}>
        {t('common.recommended')}
      </Text>
    </View>
  );
}
