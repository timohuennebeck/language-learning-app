import { useRouter } from 'expo-router';
import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { GradientHeader } from '@/shared/components/GradientHeader';
import { colors } from '@/shared/theme/tokens';
import { Button, TextButton } from '@/shared/ui/Button';
import { Illustration } from '@/shared/ui/Illustration';
import { Star } from '@/shared/ui/icons';
import { Screen } from '@/shared/ui/Screen';
import { Tap } from '@/shared/ui/Tap';
import { Kicker } from '@/shared/ui/Kicker';
import { Text } from '@/shared/ui/Text';

/** 10a · Bewertung · Sterne plus Textfeld. */
export function RatingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [rating, setRating] = useState(4);
  const [note, setNote] = useState('');
  return (
    <Screen edgeToEdgeTop bottom={0} className="relative px-[22px]">
      <GradientHeader left="close" className="-mx-[22px]" paddingBottom={18}>
        <Illustration name="pip-stars" size={148} />
      </GradientHeader>
      <Text
        className="mt-[18px] text-center font-semibold text-ink"
        style={{ fontSize: 28, lineHeight: 31.4, letterSpacing: -0.98 }}
      >
        {t('rating.title')}
      </Text>
      <Text
        className="mt-[10px] self-center text-center text-muted"
        style={{ fontSize: 16, lineHeight: 24, maxWidth: 330 }}
      >
        {t('rating.sub')}
      </Text>
      <View className="mt-[16px] flex-row justify-center" style={{ columnGap: 8 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Tap
            key={i}
            haptic="selection"
            onPress={() => setRating(i)}
            className="h-[48px] w-[48px] items-center justify-center"
          >
            <Star size={34} color={i <= rating ? colors.accent[700] : '#d6d1f7'} />
          </Tap>
        ))}
      </View>
      <View
        className="mt-[20px] rounded-[24px] bg-paper px-[18px] py-[16px]"
        style={{ rowGap: 10, boxShadow: `0 0 0 1.5px ${colors.lilac2}` }}
      >
        <Kicker size={13} tracking={0.06} className="text-muted">
          {t('rating.label')}
        </Kicker>
        <TextInput
          value={note}
          onChangeText={(v) => setNote(v.slice(0, 240))}
          placeholder={t('rating.placeholder')}
          placeholderTextColor={colors.faint}
          multiline
          textAlignVertical="top"
          className="font-regular text-text"
          style={{ height: 104, fontSize: 16, lineHeight: 23.2, padding: 0 }}
        />
        <Text
          className="self-end"
          style={{ fontSize: 12.5, color: colors.faint2, fontVariant: ['tabular-nums'] }}
        >
          {note.length} / 240
        </Text>
      </View>
      <Text className="mt-[12px] text-muted" style={{ fontSize: 13.5, lineHeight: 18.9 }}>
        {t('rating.note')}
      </Text>
      <View className="flex-1" style={{ minHeight: 12 }} />
      <Button
        height={58}
        label={t('rating.cta')}
        labelClassName="font-medium"
        haptic="success"
        onPress={() => router.back()}
      />
      <TextButton
        className="mt-[14px]"
        label={t('common.notNow')}
        color="text-muted"
        labelClassName="font-medium"
        onPress={() => router.back()}
      />
    </Screen>
  );
}
