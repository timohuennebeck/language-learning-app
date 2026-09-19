/** The scenario behind the live conversation and what the learner is supposed to get done. */
export const liveScenario = {
  title: 'Im Café',
  intro: 'Pip spielt den Serveur. Die Cappuccino-Maschine ist kaputt.',
  tasks: [
    { text: 'Sprich den Serveur an und bestelle ein Getränk.', done: true },
    { text: 'Frage nach, was es stattdessen gibt.', done: false },
    { text: 'Entscheide dich für eine Alternative und sage sie klar.', done: false },
  ],
} as const;
