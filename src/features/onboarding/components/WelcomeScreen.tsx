import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/shared/ui/Button';
import { Gradient } from '@/shared/ui/Gradient';
import { Illustration } from '@/shared/ui/Illustration';
import { Star } from '@/shared/ui/icons';
import { Tap } from '@/shared/ui/Tap';
import { Text } from '@/shared/ui/Text';

/** 02b · Welcome (full-bleed Pip, headline with highlighted phrase, rating, CTA, legal). */
export function WelcomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <Gradient
      colors={['#e7e5fe', '#eceafe', '#f3f5fe']}
      locations={[0, 0.34, 0.52]}
      className="flex-1 overflow-hidden px-[26px]"
      style={{ paddingTop: insets.top + 36, paddingBottom: insets.bottom }}
    >
      <View className="flex-1 items-center justify-center">
        <Illustration name="pip-cheer-3" size={272} />
      </View>
      <View>
        <Text
          className="font-semibold text-ink"
          style={{ fontSize: 33, lineHeight: 37.6, letterSpacing: -1.155 }}
        >
          {t('welcome.headline1')}
        </Text>
        <View className="mt-[9px] flex-row items-center">
          <Text
            className="font-semibold text-ink"
            style={{ fontSize: 33, lineHeight: 37.6, letterSpacing: -1.155 }}
          >
            {t('welcome.headline2')}
          </Text>
          <View className="rounded-[8px] bg-lilac3 px-[7px] py-[3px]">
            <Text
              className="font-semibold text-ink"
              style={{ fontSize: 33, lineHeight: 37.6, letterSpacing: -1.155 }}
            >
              {t('welcome.headline2Mark')}
            </Text>
          </View>
        </View>
      </View>
      <Text className="mt-[14px] text-muted" style={{ fontSize: 16.5, lineHeight: 23.9 }}>
        {t('welcome.sub')}
      </Text>
      <View className="mt-[18px] flex-row items-center" style={{ columnGap: 10 }}>
        <View className="flex-row" style={{ columnGap: 3 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} size={17} />
          ))}
        </View>
        <Text className="font-semibold text-ink" style={{ fontSize: 15 }}>
          {t('welcome.rating')}
        </Text>
        <Text className="text-muted" style={{ fontSize: 14 }}>
          {t('welcome.reviews')}
        </Text>
      </View>
      <Button
        className="mt-[26px]"
        height={62}
        size={18}
        label={t('welcome.cta')}
        onPress={() => router.push('/(onboarding)/app-language')}
      />
      <View className="mt-[16px] flex-row items-center justify-center">
        <Text className="text-ink2" style={{ fontSize: 16 }}>
          {t('common.alreadyMember')}{' '}
        </Text>
        <Tap haptic="light" onPress={() => router.push('/(onboarding)/account-email')}>
          <Text className="font-semibold text-accent-800" style={{ fontSize: 16 }}>
            {t('common.login')}
          </Text>
        </Tap>
      </View>
      <Text
        className="mt-[14px] px-[4px] text-center text-faint"
        style={{ fontSize: 13, lineHeight: 19.5 }}
      >
        {t('welcome.legal1')}
        <Text
          className="font-semibold text-accent-800"
          style={{ fontSize: 13 }}
          onPress={() => router.push('/(onboarding)/terms')}
        >
          {t('common.terms')}
        </Text>
        {t('welcome.legal2')}
        <Text
          className="font-semibold text-accent-800"
          style={{ fontSize: 13 }}
          onPress={() =>
            router.push({ pathname: '/(onboarding)/terms', params: { doc: 'privacy' } })
          }
        >
          {t('common.privacy')}
        </Text>
        {t('welcome.legal3')}
      </Text>
    </Gradient>
  );
}
