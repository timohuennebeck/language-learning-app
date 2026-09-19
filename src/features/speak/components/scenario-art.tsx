import { Image } from 'expo-image';
import { useState } from 'react';
import { View } from 'react-native';

import { colors } from '@/shared/theme/tokens';
import { Text } from '@/shared/ui/text';

interface Props {
  url: string;
  label: string;
  size?: number;
  radius?: number;
}

/** Scenario illustration from Storage; a dashed placeholder until the file exists. */
export function ScenarioArt({ url, label, size = 96, radius = 18 }: Props) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <View
        className="items-center justify-center px-[8px]"
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          borderWidth: 1.5,
          borderStyle: 'dashed',
          borderColor: colors.ring,
          backgroundColor: colors.surface,
        }}
      >
        <Text className="text-center text-muted" style={{ fontSize: 11.5 }} numberOfLines={2}>
          {label}
        </Text>
      </View>
    );
  }
  return (
    <Image
      source={{ uri: url }}
      style={{ width: size, height: size, borderRadius: radius }}
      contentFit="cover"
      transition={150}
      onError={() => setFailed(true)}
      accessibilityLabel={label}
    />
  );
}
