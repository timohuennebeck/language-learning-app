import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Headline } from '@/shared/components/headline';
import { Screen } from '@/shared/ui/screen';
import { TopBar } from '@/shared/ui/top-bar';

type Props = {
  /** Compact top-bar title ("Lernsprache"). */
  title: string;
  headline: string;
  sub?: string;
  children?: ReactNode;
  /** Bottom actions, pushed to the end of the screen. */
  footer?: ReactNode;
  /** Scroll when the content is taller than the viewport (the daily-goal list). */
  scroll?: boolean;
};

/** Sub-page chrome shared by the profile settings screens and the redeem screen: back bar, 30px headline, content, pinned actions. */
export function TitledFrame({ title, headline, sub, children, footer, scroll = false }: Props) {
  const body = (
    <>
      <TopBar title={title} />
      <Headline size={30} titleMarginTop={20} title={headline} sub={sub} />
      {children}
      <View className="flex-1" style={scroll ? { minHeight: 20 } : undefined} />
      {footer}
    </>
  );
  if (scroll) {
    return (
      <Screen top={0} bottom={6} scroll>
        <View className="flex-1 px-[22px]">{body}</View>
      </Screen>
    );
  }
  return (
    <Screen top={0} bottom={6} className="px-[22px]">
      {body}
    </Screen>
  );
}
