import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button, TextButton } from '@/shared/ui/button';
import { Illustration } from '@/shared/ui/illustration';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';
import { TopBar } from '@/shared/ui/top-bar';

interface Props {
  title: string;
  headline: string;
  sub: string;
  /** Stable code from the row ("invalid_content"), shown next to the time. */
  code: string;
  /** When the failure happened; formatted as "heute 18:42". */
  at?: Date | null;
  retryLabel: string;
  onRetry: () => void;
  retrying?: boolean;
  reportLabel: string;
}

/**
 * 01d · "Das hat nicht geklappt." Shared by the exercise and reading flows: same layout, own copy,
 * and the code comes from the failed row rather than being hardcoded, so the pill says something
 * true when a learner reads it out to support.
 */
export function FailureScreen({
  title,
  headline,
  sub,
  code,
  at,
  retryLabel,
  onRetry,
  retrying,
  reportLabel,
}: Props) {
  const { i18n } = useTranslation();
  const time = (at ?? new Date()).toLocaleTimeString(i18n.language, {
    hour: '2-digit',
    minute: '2-digit',
  });
  return (
    <Screen bottom={6} className="px-[22px]">
      <TopBar left="close" title={title} titleSize={20} />
      <View className="flex-1 items-center justify-center" style={{ rowGap: 22 }}>
        <Illustration name="pip-dizzy" size={150} />
        <View className="items-center">
          <Text
            className="text-center font-semibold text-ink"
            style={{ fontSize: 31, lineHeight: 33.5, letterSpacing: -1.085 }}
          >
            {headline}
          </Text>
          <Text
            className="mt-[12px] text-center text-muted"
            style={{ fontSize: 16, lineHeight: 24, maxWidth: 280 }}
          >
            {sub}
          </Text>
        </View>
        <View
          className="flex-row items-center rounded-pill bg-surface2 px-[14px] py-[8px]"
          style={{ columnGap: 8 }}
        >
          <Text className="text-sub" style={{ fontSize: 13.5, fontVariant: ['tabular-nums'] }}>
            {code}
          </Text>
          <Text className="text-neutral-400" style={{ fontSize: 13.5 }}>
            ·
          </Text>
          <Text className="text-sub" style={{ fontSize: 13.5, fontVariant: ['tabular-nums'] }}>
            {time}
          </Text>
        </View>
      </View>
      <View style={{ rowGap: 10 }}>
        <Button
          height={58}
          label={retryLabel}
          variant={retrying ? 'disabled' : 'primary'}
          disabled={retrying}
          onPress={onRetry}
        />
        <TextButton
          className="h-[48px]"
          label={reportLabel}
          color="text-muted"
          labelClassName="font-regular"
        />
      </View>
    </Screen>
  );
}
