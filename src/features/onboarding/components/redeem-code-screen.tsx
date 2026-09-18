import { useRef, useState } from 'react';
import { TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { CodeBoxes } from '@/shared/components/code-boxes';
import { Headline } from '@/shared/components/headline';
import { PipTip, Strong } from '@/shared/components/pip-tip';
import { Button, TextButton } from '@/shared/ui/button';
import { useBack } from '@/shared/hooks/use-back';
import { Screen } from '@/shared/ui/screen';
import { Tap } from '@/shared/ui/tap';
import { TopBar } from '@/shared/ui/top-bar';

/** 11b · Code einlösen. */
export function RedeemCodeScreen() {
  const { t } = useTranslation();
  const back = useBack();
  const [code, setCode] = useState('MAJA7');
  const inputRef = useRef<TextInput>(null);
  return (
    <Screen bottom={6} className="px-[22px]">
      <TopBar left="back" title={t('onboarding.redeem.title')} />
      <Headline
        size={30}
        titleMarginTop={20}
        title={t('onboarding.redeem.headline')}
        sub={t('onboarding.redeem.sub')}
      />
      <View className="mt-[22px]">
        <Tap haptic="light" onPress={() => inputRef.current?.focus()}>
          <CodeBoxes value={code} activeIndex={Math.min(code.length, 5)} variant="input" />
        </Tap>
        <TextInput
          ref={inputRef}
          autoFocus
          maxLength={6}
          value={code}
          onChangeText={(v) =>
            setCode(
              v
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, '')
                .slice(0, 6),
            )
          }
          autoCapitalize="characters"
          autoCorrect={false}
          style={{ position: 'absolute', opacity: 0, width: 1, height: 1 }}
          accessibilityLabel={t('onboarding.redeem.title')}
        />
      </View>
      <PipTip className="mt-[16px]">
        {t('onboarding.redeem.tip1')}
        <Strong>{t('onboarding.redeem.tipCode')}</Strong>
        {t('onboarding.redeem.tip2')}
      </PipTip>
      <View className="flex-1" />
      <View style={{ rowGap: 10 }}>
        <Button height={60} size={17.5} label={t('onboarding.redeem.cta')} onPress={back} />
        <TextButton
          className="h-[52px]"
          label={t('onboarding.redeem.noCode')}
          color="text-muted"
          labelClassName="font-regular"
          onPress={back}
        />
      </View>
    </Screen>
  );
}
