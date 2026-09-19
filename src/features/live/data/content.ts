/** The scenario behind the live conversation, what the learner is supposed to get done and what they said. */
export const liveScenario = {
  title: 'Im Café',
  intro: 'Pip spielt den Serveur. Die Cappuccino-Maschine ist kaputt.',
  tasks: [
    {
      text: 'Sprich den Serveur an und bestelle ein Getränk.',
      done: true,
      said: 'Bonjour, un cappuccino, s’il vous plaît.',
    },
    {
      text: 'Frage nach, was es stattdessen gibt.',
      done: false,
      said: 'Qu’est-ce que vous avez d’autre ?',
    },
    {
      text: 'Entscheide dich für eine Alternative und sage sie klar.',
      done: false,
      said: 'Alors je prends un thé.',
    },
  ],
} as const;
