import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { FeedbackCard } from '@/features/exercises/components/FeedbackCard';
import { cafeExercise } from '@/features/exercises/data/content';
import type { ExerciseStep } from '@/features/exercises/data/schemas';
import { useExerciseSession, type Phase } from '@/features/exercises/hooks/useExerciseSession';
import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/theme/tokens';
import { Caret } from '@/shared/ui/Caret';
import { CheckIcon, CloseIcon, DragHandle, ResetGlyph } from '@/shared/ui/icons';
import { Screen } from '@/shared/ui/Screen';
import { Tap } from '@/shared/ui/Tap';
import { Text } from '@/shared/ui/Text';
import { ProgressTopBar } from '@/shared/ui/TopBar';

const INK = colors.ink;

function Kicker({ children, mt }: { children: ReactNode; mt: number }) {
  return (
    <Text
      className="uppercase text-accent-800"
      style={{ fontSize: 12, letterSpacing: 1.44, marginTop: mt }}
    >
      {children}
    </Text>
  );
}

function Hint({ text, mt = 22, glyph = '?' }: { text: string; mt?: number; glyph?: string }) {
  return (
    <View className="flex-row items-center" style={{ columnGap: 10, marginTop: mt }}>
      <View className="h-[20px] w-[20px] items-center justify-center rounded-full bg-surface">
        <Text className="text-accent-800" style={{ fontSize: 12 }}>
          {glyph}
        </Text>
      </View>
      <Text className="text-muted" style={{ fontSize: 14 }}>
        {text}
      </Text>
    </View>
  );
}

/** Inline answer chip inside a sentence (green when correct, red + strikethrough when wrong). */
function AnswerChip({ text, ok, size }: { text: string; ok: boolean; size: number }) {
  return (
    <Text
      className={cn(!ok && 'line-through')}
      style={{
        fontSize: size,
        lineHeight: size * 1.4,
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 2,
        backgroundColor: ok ? colors.ok.chip : colors.err.chip,
        color: ok ? colors.ok.text : colors.err.text,
      }}
    >
      {text}
    </Text>
  );
}

/** Text input whose width follows its content (an invisible twin Text measures it). */
function AutoWidthInput({
  value,
  onChangeText,
  fontSize,
  lineHeight,
  color = colors.accent[900],
  autoCapitalize = 'none',
}: {
  value: string;
  onChangeText: (v: string) => void;
  fontSize: number;
  lineHeight: number;
  color?: string;
  autoCapitalize?: 'none' | 'sentences';
}) {
  const [w, setW] = useState(20);
  return (
    <View>
      <Text
        className="font-regular"
        style={{ fontSize, lineHeight, position: 'absolute', opacity: 0 }}
        onLayout={(e) => setW(Math.max(20, Math.ceil(e.nativeEvent.layout.width) + 2))}
      >
        {value || ' '}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        className="font-regular"
        style={{ fontSize, lineHeight, padding: 0, width: w, color }}
      />
    </View>
  );
}

function PrimaryCta({
  label,
  enabled,
  onPress,
  height = 58,
  className,
}: {
  label: string;
  enabled: boolean;
  onPress: () => void;
  height?: number;
  className?: string;
}) {
  return (
    <Tap
      haptic={enabled ? 'medium' : 'none'}
      onPress={enabled ? onPress : undefined}
      className={cn(
        'items-center justify-center rounded-pill',
        enabled ? 'bg-accent-700' : 'bg-surface2',
        className,
      )}
      style={{ height }}
    >
      <Text
        className={cn('font-semibold', enabled ? 'text-[#f7f6ff]' : 'text-faint')}
        style={{ fontSize: 17 }}
      >
        {label}
      </Text>
    </Tap>
  );
}

function NextCta({ onPress, label }: { onPress: () => void; label: string }) {
  return (
    <Tap
      haptic="medium"
      onPress={onPress}
      className="h-[56px] items-center justify-center rounded-pill bg-accent-800 active:opacity-90"
    >
      <Text className="font-semibold text-accent-100" style={{ fontSize: 17 }}>
        {label}
      </Text>
    </Tap>
  );
}

/** 19a2 / 25a / 25b · Lücke mit Optionen. */
function FillOptions({
  step,
  phase,
  answer,
  setAnswer,
}: {
  step: Extract<ExerciseStep, { kind: 'fill-options' }>;
  phase: Phase;
  answer: string;
  setAnswer: (a: string) => void;
}) {
  const { t } = useTranslation();
  const task = phase === 'task';
  const size = task ? 31 : 26;
  return (
    <>
      <Kicker mt={task ? 34 : 26}>{t('exercise.fill')}</Kicker>
      <Text
        style={{
          fontSize: size,
          lineHeight: size * 1.4,
          letterSpacing: -0.02 * size,
          color: INK,
          marginTop: task ? 14 : 12,
        }}
      >
        {step.pre}
        {task ? (
          <View
            style={{
              minWidth: 130,
              height: 44,
              borderRadius: 14,
              backgroundColor: answer ? colors.surface : '#e9ebf9',
              boxShadow: `inset 0 0 0 1.5px ${colors.accent[500]}`,
              transform: [{ translateY: 10 }],
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 12,
            }}
          >
            {answer ? (
              <Text className="text-accent-900" style={{ fontSize: 26 }}>
                {answer}
              </Text>
            ) : null}
          </View>
        ) : (
          <AnswerChip text={answer} ok={phase === 'correct'} size={size} />
        )}
        {step.post}
      </Text>
      {task ? (
        <Text className="text-muted" style={{ fontSize: 15, marginTop: 14 }}>
          {step.translation}
        </Text>
      ) : null}
      <View className="flex-row flex-wrap" style={{ gap: 10, marginTop: task ? 30 : 22 }}>
        {step.options.map((o) => {
          const isAnswer = o === step.answer;
          const isPicked = o === answer;
          let bg: string = colors.surface;
          let color: string = colors.accent[900];
          let ring: string | undefined;
          let icon: ReactNode = null;
          if (!task) {
            if (isAnswer) {
              bg = colors.ok.chip;
              color = colors.ok.text;
              ring = `inset 0 0 0 2px ${colors.ok.ring}`;
              icon = <CheckIcon size={16} color={colors.ok.icon} strokeWidth={2.6} />;
            } else if (isPicked) {
              bg = colors.err.chip;
              color = colors.err.text;
              icon = <CloseIcon size={14} color="#a8544c" strokeWidth={2.6} />;
            } else {
              bg = colors.surface2;
              color = colors.dim7;
            }
          } else if (isPicked) {
            ring = `inset 0 0 0 2px ${colors.accent[600]}`;
          }
          return (
            <Tap
              key={o}
              haptic="selection"
              disabled={!task}
              onPress={() => setAnswer(o)}
              className="h-[56px] flex-row items-center rounded-[14px] px-[16px]"
              style={{
                width: '48%',
                flexGrow: 1,
                backgroundColor: bg,
                boxShadow: ring,
                columnGap: 10,
                justifyContent: task ? 'flex-start' : 'space-between',
              }}
            >
              {task ? <DragHandle /> : null}
              <Text style={{ fontSize: 18, color }}>{o}</Text>
              {icon}
            </Tap>
          );
        })}
      </View>
    </>
  );
}

/** 19b3 / 25c / 25d · Lücke frei getippt. */
function FillFree({
  step,
  phase,
  answer,
  setAnswer,
}: {
  step: Extract<ExerciseStep, { kind: 'fill-free' }>;
  phase: Phase;
  answer: string;
  setAnswer: (a: string) => void;
}) {
  const { t } = useTranslation();
  const task = phase === 'task';
  const size = task ? 29 : 26;
  return (
    <>
      <Kicker mt={task ? 28 : 26}>{t('exercise.fillFree')}</Kicker>
      <Text
        style={{
          fontSize: size,
          lineHeight: task ? 49.3 : 41.6,
          letterSpacing: -0.01 * size,
          color: INK,
          marginTop: task ? 16 : 14,
        }}
      >
        {step.pre}
        {task ? (
          <View
            style={{
              minWidth: 130,
              flexDirection: 'row',
              alignItems: 'center',
              borderRadius: 14,
              backgroundColor: '#fff',
              boxShadow: `0 0 0 2px ${colors.accent[500]}`,
              paddingHorizontal: 12,
              paddingVertical: 2,
              transform: [{ translateY: 8 }],
            }}
          >
            <AutoWidthInput value={answer} onChangeText={setAnswer} fontSize={29} lineHeight={36} />
            <Caret height={26} style={{ marginLeft: 2 }} />
          </View>
        ) : (
          <AnswerChip text={answer} ok={phase === 'correct'} size={size} />
        )}
        {step.post}
      </Text>
      <Text className="text-muted" style={{ fontSize: 15, marginTop: task ? 14 : 10 }}>
        {step.translation}
      </Text>
      {task ? <Hint text={step.hint} /> : null}
    </>
  );
}

/** 19c1 / 25e / 25f · Übersetzen mit Bausteinen. */
function Build({
  step,
  phase,
  answer,
  setAnswer,
}: {
  step: Extract<ExerciseStep, { kind: 'build' }>;
  phase: Phase;
  answer: string[];
  setAnswer: (a: string[]) => void;
}) {
  const { t } = useTranslation();
  const task = phase === 'task';
  const slots = [104, 138, 126];
  return (
    <>
      <Kicker mt={task ? 28 : 26}>{t('exercise.translate')}</Kicker>
      <Text
        style={{
          fontSize: task ? 24 : 21,
          lineHeight: (task ? 24 : 21) * 1.4,
          letterSpacing: task ? -0.24 : 0,
          color: INK,
          marginTop: 12,
        }}
      >
        {step.prompt}
      </Text>
      <View className="flex-row flex-wrap" style={{ gap: 8, marginTop: task ? 24 : 16 }}>
        {answer.map((piece, i) => {
          if (!task) {
            const wrong = piece === step.wrongPiece && phase === 'wrong';
            return (
              <View
                key={piece + i}
                className="rounded-[14px] px-[13px] py-[9px]"
                style={{
                  backgroundColor: wrong ? colors.err.chip : colors.ok.chip,
                  boxShadow: wrong ? `inset 0 0 0 2px ${colors.err.ring}` : undefined,
                }}
              >
                <Text style={{ fontSize: 17, color: wrong ? colors.err.text : colors.ok.text }}>
                  {piece}
                </Text>
              </View>
            );
          }
          return (
            <Tap
              key={piece + i}
              haptic="selection"
              onPress={() => setAnswer(answer.filter((_, j) => j !== i))}
              className="flex-row items-center rounded-[14px] bg-white px-[14px] py-[10px]"
              style={{ columnGap: 8, boxShadow: '0 0 0 1px #e4e7f5' }}
            >
              <DragHandle color={colors.dim5} />
              <Text className="text-accent-900" style={{ fontSize: 18 }}>
                {piece}
              </Text>
            </Tap>
          );
        })}
        {task
          ? slots.slice(0, Math.max(0, step.answer.length - answer.length)).map((w, i) => (
              <View
                key={w}
                className="rounded-[14px]"
                style={{
                  width: w,
                  height: 44,
                  backgroundColor: '#e9ebf9',
                  boxShadow: i === 0 ? `inset 0 0 0 1.5px ${colors.accent[500]}` : undefined,
                }}
              />
            ))
          : null}
      </View>
      {task ? (
        <>
          <Hint text={t('exercise.hintDrop')} mt={12} />
          <View className="flex-row flex-wrap" style={{ gap: 10, marginTop: 26 }}>
            {step.pool.map((piece) => {
              const used = answer.includes(piece);
              return (
                <Tap
                  key={piece}
                  haptic="selection"
                  disabled={used}
                  onPress={() => setAnswer([...answer, piece])}
                  className="flex-row items-center rounded-[14px] px-[16px] py-[11px]"
                  style={{ columnGap: 8, backgroundColor: used ? colors.surface2 : colors.surface }}
                >
                  <DragHandle color={used ? colors.track2 : colors.dim4} />
                  <Text style={{ fontSize: 18, color: used ? colors.dim6 : colors.accent[900] }}>
                    {piece}
                  </Text>
                </Tap>
              );
            })}
          </View>
        </>
      ) : null}
    </>
  );
}

/** 19d1 / 25g / 25h · Übersetzen frei getippt. */
function TranslateFree({
  step,
  phase,
  answer,
  setAnswer,
}: {
  step: Extract<ExerciseStep, { kind: 'translate-free' }>;
  phase: Phase;
  answer: string;
  setAnswer: (a: string) => void;
}) {
  const { t } = useTranslation();
  const task = phase === 'task';
  const ok = phase === 'correct';
  return (
    <>
      <Kicker mt={26}>{t('exercise.translateFree')}</Kicker>
      <Text
        style={{
          fontSize: task ? 23 : 21,
          lineHeight: (task ? 23 : 21) * 1.4,
          color: INK,
          marginTop: 12,
        }}
      >
        {step.prompt}
      </Text>
      {task ? (
        <View
          className="rounded-[22px] bg-white p-[18px]"
          style={{ marginTop: 20, minHeight: 130, boxShadow: `0 0 0 2px ${colors.accent[500]}` }}
        >
          <Text className="text-faint" style={{ fontSize: 12 }}>
            {t('exercise.inFrench')}
          </Text>
          <View className="mt-[10px] flex-row items-center">
            <AutoWidthInput
              value={answer}
              onChangeText={setAnswer}
              fontSize={21}
              lineHeight={30.45}
              color={colors.ink}
              autoCapitalize="sentences"
            />
            <Caret height={21} style={{ marginLeft: 2 }} />
          </View>
        </View>
      ) : (
        <View
          className="rounded-[22px] bg-white p-[16px]"
          style={{ marginTop: 14, boxShadow: `0 0 0 2px ${ok ? colors.ok.ring : colors.err.ring}` }}
        >
          <Text style={{ fontSize: 12, color: ok ? colors.ok.label : colors.err.label2 }}>
            {t('exercise.yourAnswer')}
          </Text>
          <Text className="mt-[8px] text-ink" style={{ fontSize: 19, lineHeight: 27.55 }}>
            {ok
              ? answer
              : answer.split(step.wrongTypedMark).map((part, i, arr) => (
                  <Text key={i} className="text-ink" style={{ fontSize: 19 }}>
                    {part}
                    {i < arr.length - 1 ? (
                      <Text
                        style={{
                          fontSize: 19,
                          backgroundColor: colors.err.chip,
                          borderRadius: 6,
                          paddingHorizontal: 3,
                          color: colors.ink,
                        }}
                      >
                        {step.wrongTypedMark}
                      </Text>
                    ) : null}
                  </Text>
                ))}
          </Text>
        </View>
      )}
      {task ? <Hint text={step.hint} mt={12} /> : null}
    </>
  );
}

/** Exercise flow. Dev/verification params: `?step=3&state=correct|wrong`. */
export function ExerciseScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ step?: string; state?: string }>();
  const s = useExerciseSession(cafeExercise, {
    initialIndex: params.step ? Number(params.step) - 1 : 0,
    initialPhase: params.state === 'correct' || params.state === 'wrong' ? params.state : 'task',
  });
  const [checked, setChecked] = useState(false);
  const task = s.phase === 'task';
  const keyboard = task && (s.step.kind === 'fill-free' || s.step.kind === 'translate-free');
  const canCheck =
    s.step.kind === 'build'
      ? (s.answer as string[]).length >= 1
      : String(s.answer).trim().length > 0;
  const px = task && s.step.kind === 'fill-options' ? 26 : 22;

  const onNext = () => {
    setChecked(false);
    if (!s.next()) router.replace('/(app)/daily-limit');
  };

  return (
    <Screen top={0} bottom={keyboard ? -34 : 0} style={{ paddingHorizontal: px }}>
      <ProgressTopBar
        height={32}
        progress={(s.index + 1) / s.total}
        label={`${s.index + 1} / ${s.total}`}
        labelSize={13}
        trackColor={colors.track2}
      />
      {s.step.kind === 'fill-options' ? (
        <FillOptions
          step={s.step}
          phase={s.phase}
          answer={s.answer as string}
          setAnswer={s.setAnswer}
        />
      ) : s.step.kind === 'fill-free' ? (
        <FillFree
          step={s.step}
          phase={s.phase}
          answer={s.answer as string}
          setAnswer={s.setAnswer}
        />
      ) : s.step.kind === 'build' ? (
        <Build
          step={s.step}
          phase={s.phase}
          answer={s.answer as string[]}
          setAnswer={s.setAnswer}
        />
      ) : (
        <TranslateFree
          step={s.step}
          phase={s.phase}
          answer={s.answer as string}
          setAnswer={s.setAnswer}
        />
      )}
      <View className="flex-1" style={{ minHeight: task ? 0 : 20 }} />
      {task ? (
        s.step.kind === 'build' ? (
          <View className="flex-row items-center" style={{ columnGap: 10 }}>
            <Tap
              haptic="light"
              onPress={s.reset}
              className="h-[58px] w-[58px] items-center justify-center rounded-full bg-surface2"
            >
              <ResetGlyph />
            </Tap>
            <PrimaryCta
              className="flex-1"
              label={t('common.check')}
              enabled={canCheck}
              onPress={() => {
                setChecked(true);
                s.check();
              }}
            />
          </View>
        ) : (
          <View style={{ paddingBottom: keyboard ? 14 : 0 }}>
            <PrimaryCta
              height={s.step.kind === 'fill-options' ? 58 : 56}
              label={t('common.check')}
              enabled={canCheck || checked}
              onPress={() => {
                setChecked(true);
                s.check();
              }}
            />
          </View>
        )
      ) : (
        <>
          <FeedbackCard
            correct={s.phase === 'correct'}
            why={s.step.correctWhy}
            wrongWhy={s.step.wrongWhy}
            youLine={s.step.youLine}
            rightLine={s.step.rightLine}
          />
          <View style={{ height: 14 }} />
          <NextCta label={t('common.next')} onPress={onNext} />
        </>
      )}
    </Screen>
  );
}
