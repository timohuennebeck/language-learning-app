import { Link, type Href } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/features/auth/hooks/useSession';
import { Tap } from '@/shared/ui/Tap';
import { Text } from '@/shared/ui/Text';

type Entry = { id: string; label: string; href: Href; onboarded?: boolean };

/** Every screen from the Claude Design canvas, in design order, for quick visual checks. */
export const SCREENS: Entry[] = [
  { id: '10a', label: 'Bewertung', href: '/(app)/rating', onboarded: true },
  { id: '30a', label: 'Gesprächslimit', href: '/(app)/talk-limit', onboarded: true },
  {
    id: '19a2',
    label: 'Lücke mit Optionen · Aufgabe',
    href: '/(app)/exercise?step=3',
    onboarded: true,
  },
  {
    id: '25a',
    label: 'Lücke mit Optionen · richtig',
    href: '/(app)/exercise?step=3&state=correct',
    onboarded: true,
  },
  {
    id: '25b',
    label: 'Lücke mit Optionen · falsch',
    href: '/(app)/exercise?step=3&state=wrong',
    onboarded: true,
  },
  { id: '19b3', label: 'Lücke frei · Aufgabe', href: '/(app)/exercise?step=4', onboarded: true },
  {
    id: '25c',
    label: 'Lücke frei · richtig',
    href: '/(app)/exercise?step=4&state=correct',
    onboarded: true,
  },
  {
    id: '25d',
    label: 'Lücke frei · falsch',
    href: '/(app)/exercise?step=4&state=wrong',
    onboarded: true,
  },
  { id: '19c1', label: 'Bausteine · Aufgabe', href: '/(app)/exercise?step=5', onboarded: true },
  {
    id: '25e',
    label: 'Bausteine · richtig',
    href: '/(app)/exercise?step=5&state=correct',
    onboarded: true,
  },
  {
    id: '25f',
    label: 'Bausteine · falsch',
    href: '/(app)/exercise?step=5&state=wrong',
    onboarded: true,
  },
  {
    id: '19d1',
    label: 'Übersetzen frei · Aufgabe',
    href: '/(app)/exercise?step=6',
    onboarded: true,
  },
  {
    id: '25g',
    label: 'Übersetzen frei · richtig',
    href: '/(app)/exercise?step=6&state=correct',
    onboarded: true,
  },
  {
    id: '25h',
    label: 'Übersetzen frei · falsch',
    href: '/(app)/exercise?step=6&state=wrong',
    onboarded: true,
  },
  { id: '3c', label: 'Kapitel · Lesen', href: '/(app)/chapter/cafe?station=0', onboarded: true },
  {
    id: '3b',
    label: 'Kapitel · Karteikarten',
    href: '/(app)/chapter/cafe?station=1',
    onboarded: true,
  },
  {
    id: '3f',
    label: 'Kapitel · Grammatik',
    href: '/(app)/chapter/cafe?station=2',
    onboarded: true,
  },
  { id: '3d', label: 'Kapitel · Üben', href: '/(app)/chapter/cafe?station=3', onboarded: true },
  {
    id: '3e',
    label: 'Kapitel · Konversation',
    href: '/(app)/chapter/cafe?station=4',
    onboarded: true,
  },
  { id: '16a', label: 'Worterklärung', href: '/(app)/reading/word?seg=creme', onboarded: true },
  { id: '14a', label: 'Lesen · Abschnitt 1', href: '/(app)/reading?section=1', onboarded: true },
  { id: '14b', label: 'Lesen · Abschnitt 2', href: '/(app)/reading?section=2', onboarded: true },
  {
    id: '14e',
    label: 'Lesen · Tauschwörter',
    href: '/(app)/reading?section=2&mode=swap',
    onboarded: true,
  },
  { id: '09e', label: 'Konto löschen', href: '/(app)/profile/delete', onboarded: true },
  { id: '09b', label: 'Profil', href: '/(app)/profile', onboarded: true },
  { id: '09f', label: 'Erinnerung', href: '/(app)/profile/reminder', onboarded: true },
  { id: '09g', label: 'Lernzeit', href: '/(app)/profile/daily-goal', onboarded: true },
  { id: '09c', label: 'Lernsprache', href: '/(app)/profile/learning-language', onboarded: true },
  { id: '09d', label: 'App-Sprache', href: '/(app)/profile/app-language', onboarded: true },
  { id: '08', label: 'Tageslimit', href: '/(app)/daily-limit', onboarded: true },
  { id: '08b', label: 'Serie gestartet', href: '/(app)/streak', onboarded: true },
  { id: '01', label: 'Lektionen', href: '/(app)', onboarded: true },
  { id: '01a', label: 'Sprache wechseln', href: '/(app)/languages', onboarded: true },
  { id: '01b', label: 'Lektion Start', href: '/(app)/lesson/au-cafe', onboarded: true },
  {
    id: '01c',
    label: 'Übung wird vorbereitet',
    href: '/(app)/exercise/preparing',
    onboarded: true,
  },
  { id: '01d-iv', label: 'Fehler', href: '/(app)/exercise/error', onboarded: true },
  { id: '02c', label: 'Live-Konversation', href: '/(app)/live', onboarded: true },
  { id: '3h', label: 'Rückblick', href: '/(app)/review?tab=next', onboarded: true },
  { id: '04', label: 'Karteikarten', href: '/(app)/flashcards', onboarded: true },
  { id: '05', label: 'Grammatik', href: '/(app)/grammar', onboarded: true },
  { id: '01s', label: 'Splash', href: '/' },
  { id: '02b', label: 'Welcome', href: '/(onboarding)/welcome' },
  { id: '02c-t', label: 'Nutzungsbedingungen', href: '/(onboarding)/terms' },
  { id: '02c-ii', label: 'Nutzungsbedingungen · Auswahl', href: '/(onboarding)/terms?open=1' },
  { id: '03', label: 'App-Sprache', href: '/(onboarding)/app-language' },
  { id: '03a', label: 'Lernsprache', href: '/(onboarding)/learning-language' },
  { id: '03b', label: 'Ziel', href: '/(onboarding)/goal' },
  { id: '04n', label: 'Name', href: '/(onboarding)/name' },
  { id: '05n', label: 'Mitteilungen', href: '/(onboarding)/notifications' },
  { id: '05a', label: 'Erinnerungszeit', href: '/(onboarding)/reminder-time' },
  { id: '06', label: 'Einstufung Intro', href: '/(onboarding)/assessment-intro' },
  { id: '06a', label: 'Level selbst', href: '/(onboarding)/level-self' },
  { id: '07', label: 'Einstufung · Konversation', href: '/(onboarding)/assessment-call' },
  { id: '08a', label: 'Auswertung', href: '/(onboarding)/assessment-evaluating' },
  { id: '09', label: 'Level-Ergebnis', href: '/(onboarding)/level-result' },
  { id: '09g2', label: 'Ziel-Level', href: '/(onboarding)/target-level' },
  { id: '09h', label: 'Tägliche Lernzeit', href: '/(onboarding)/daily-goal' },
  { id: '11f', label: 'Paywall', href: '/(onboarding)/paywall' },
  { id: '11b', label: 'Code einlösen', href: '/(onboarding)/redeem-code' },
  { id: '12', label: 'Konto', href: '/(onboarding)/account' },
  { id: '12b', label: 'E-Mail und Passwort', href: '/(onboarding)/account-email' },
  { id: '13', label: 'Plus aktiv', href: '/(onboarding)/plus-active' },
  { id: '13b', label: 'Widget', href: '/(onboarding)/widget' },
  { id: '15', label: 'Code teilen', href: '/(app)/share-code', onboarded: true },
];

export default function DevIndex() {
  const { t } = useTranslation();
  const { session, update } = useSession();
  return (
    <ScrollView
      className="flex-1 bg-bg"
      contentContainerStyle={{ padding: 24, paddingTop: 72, rowGap: 6 }}
    >
      <Text className="font-semibold text-ink" style={{ fontSize: 24 }}>
        {t('dev.title')}
      </Text>
      <Text className="mb-[12px] text-muted" style={{ fontSize: 14 }}>
        {t('dev.sub')}
      </Text>
      {SCREENS.map((s) => (
        <View key={s.id} className="flex-row items-center" style={{ columnGap: 10 }}>
          <Text className="w-[48px] text-faint" style={{ fontSize: 12 }}>
            {s.id}
          </Text>
          <Tap
            haptic="light"
            onPress={() => {
              if (s.onboarded !== undefined && s.onboarded !== session.onboardingComplete)
                update({ onboardingComplete: s.onboarded });
            }}
          >
            <Link href={s.href}>
              <Text className="text-accent-800" style={{ fontSize: 16 }}>
                {s.label}
              </Text>
            </Link>
          </Tap>
        </View>
      ))}
    </ScrollView>
  );
}
