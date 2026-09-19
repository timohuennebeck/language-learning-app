import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useEffect } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Defs, Ellipse, RadialGradient, Rect, Stop } from 'react-native-svg';

import { useSession } from '@/features/auth/hooks/use-session';
import { CallTimer } from '@/features/live/components/call-timer';
import type { EndConversationResult, LiveKind } from '@/features/live/data/types';
import {
  endCall,
  resetCall,
  setMuted,
  setSubtitles,
  startCall,
  useLiveCallState,
} from '@/features/live/lib/live-call-store';
import { CallControls } from '@/shared/components/call-controls';
import { Waveform } from '@/shared/components/waveform';
import { colors } from '@/shared/theme/tokens';
import { Button, TextButton } from '@/shared/ui/button';
import { Illustration } from '@/shared/ui/illustration';
import { ChecklistIcon, ChevronDown } from '@/shared/ui/icons';
import { NavCircle } from '@/shared/ui/nav-circle';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';

/**
 * Soft radial glow behind the call (design: radial-gradient 125% 85% at 50% 8%).
 * Drawn with absolute numbers: percentage geometry resolves differently on native SVG and left
 * an unpainted strip at the right edge.
 */
function CallBackdrop() {
  const { width, height } = useWindowDimensions();
  const cx = width / 2;
  const cy = height * 0.08;
  const rx = width * 1.25;
  const ry = height * 0.85;
  return (
    <Svg
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, left: 0 }}
      width={width}
      height={height}
    >
      <Defs>
        <RadialGradient
          id="glow"
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          fx={cx}
          fy={cy}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#efedfd" />
          <Stop offset="0.55" stopColor="#f3f5fe" />
          <Stop offset="1" stopColor="#e9ebf9" />
        </RadialGradient>
      </Defs>
      <Rect x={0} y={0} width={width} height={height} fill="#e9ebf9" />
      <Ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="url(#glow)" />
    </Svg>
  );
}

export function formatClock(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** Error codes the edge function returns that have their own copy; everything else is generic. */
const KNOWN_ERRORS = new Set([
  'placement_used',
  'account_required',
  'placement_limit',
  'microphone',
]);

interface Props {
  /** Placement uses the placement scenario; the route decides between free talk and a scenario. */
  kind?: LiveKind;
  /**
   * Called when the user ends the call, with the pending review. The default waits for it and
   * opens the done page; onboarding navigates straight to the evaluation screen instead.
   */
  onEnd?: (result: Promise<EndConversationResult>) => void;
  /** Placement call: no way back, but the header keeps its layout. */
  hideBack?: boolean;
  /** Where the checklist circle goes; onboarding passes its own route (the app group is locked until then). */
  tasksHref?: Href;
}

/** 02c · Live-Gespräch · Vollbild-Call (also used as the placement call in onboarding). */
export function LiveCallScreen({
  kind,
  onEnd,
  hideBack = false,
  tasksHref = '/(app)/live/tasks',
}: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const { session } = useSession();
  const params = useLocalSearchParams<{ scenario?: string }>();
  const call = useLiveCallState();
  const callKind: LiveKind = kind ?? (params.scenario ? 'scenario' : 'free');
  const scenarioSlug = params.scenario;

  useEffect(() => {
    void startCall({ kind: callKind, scenarioSlug });
    return () => {
      // Leaving the screen mid-call (back gesture, deep link) ends it; a finished call is kept
      // for the done / evaluation screen and reset there.
      resetCall();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finish = () => {
    const result = endCall('user');
    if (onEnd) onEnd(result);
    else {
      void result.then(() =>
        router.replace({ pathname: '/(app)/live/done', params: { id: call.conversationId ?? '' } }),
      );
    }
  };

  const statusLine = () => {
    if (call.status === 'starting') return t('live.connecting');
    if (call.status === 'ending' || call.status === 'ended') return t('live.ending');
    if (call.status === 'error') {
      return t(
        KNOWN_ERRORS.has(call.errorCode ?? '')
          ? `live.errors.${call.errorCode}`
          : 'live.errors.generic',
      );
    }
    return call.subtitles ? call.caption : '';
  };

  return (
    <Screen
      top={-2}
      bottom={8}
      className="relative px-[22px]"
      style={{ backgroundColor: '#e9ebf9' }}
    >
      <CallBackdrop />
      <View className="h-[40px] flex-row items-center justify-between">
        {hideBack ? (
          <View style={{ width: 40, height: 40 }} />
        ) : (
          <NavCircle icon={<ChevronDown size={18} strokeWidth={2.2} />} size={40} />
        )}
        <CallTimer label={t('live.timer', { time: formatClock(call.elapsed) })} />
        <NavCircle
          icon={<ChecklistIcon />}
          size={40}
          accessibilityLabel={t('live.tasks.cta')}
          onPress={() => router.push(tasksHref)}
        />
      </View>
      <View className="flex-1 items-center justify-center" style={{ minHeight: 0 }}>
        <View className="items-center justify-center" style={{ width: 300, height: 300 }}>
          <Illustration name="pip-mic" size={172} />
        </View>
        <Text
          className="mt-[14px] font-medium text-accent-900"
          style={{ fontSize: 30, lineHeight: 33, letterSpacing: -0.75 }}
        >
          {t('live.name')}
        </Text>
        <Text className="mt-[6px] text-muted" style={{ fontSize: 15 }}>
          {t('live.sub', {
            language: t(`common.language.${session.learningLanguage}`),
            topic: call.title ?? t('speak.free.title'),
            level: session.level,
          })}
        </Text>
        <View className="mt-[18px] h-[52px] justify-center">
          {call.status === 'live' ? <Waveform /> : null}
        </View>
      </View>
      <View className="mb-[18px] items-center" style={{ rowGap: 12 }}>
        <Text
          className="text-center font-medium text-accent-900"
          style={{ fontSize: 26, lineHeight: 32.5, letterSpacing: -0.52 }}
          numberOfLines={3}
        >
          {statusLine()}
        </Text>
      </View>
      {call.status === 'error' ? (
        <View className="mt-[22px] px-[8px]" style={{ rowGap: 6 }}>
          <Button
            height={58}
            size={17}
            label={t('live.retry')}
            onPress={() => void startCall({ kind: callKind, scenarioSlug })}
          />
          <TextButton
            className="h-[48px]"
            label={t('common.close')}
            color="text-sub"
            onPress={() => router.back()}
          />
        </View>
      ) : (
        <CallControls
          className="mt-[22px] px-[8px]"
          sideSize={66}
          endSize={86}
          labelSize={13.5}
          endColor={colors.danger}
          endShadow="0 10px 24px rgba(201,64,63,.32)"
          subtitlesBg={call.subtitles ? colors.neutral[200] : colors.surface}
          onMute={() => setMuted(!call.muted)}
          onSubtitles={() => setSubtitles(!call.subtitles)}
          onEnd={call.status === 'live' || call.status === 'starting' ? finish : undefined}
        />
      )}
    </Screen>
  );
}
