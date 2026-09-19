#!/usr/bin/env python3
"""Writes supabase/seed/scenarios.sql from the example catalogue below (docs/sprechen-plan.md §3).
The hosted table is the source of truth once content is authored in Studio; this file only holds
the four design scenarios so `db reset` and the hosted project start from the same rows."""
import json, pathlib

L = ["de", "en", "es", "fr", "it", "pt"]           # app locales
def i18n(de, en, es, fr, it, pt): return dict(zip(L, [de, en, es, fr, it, pt]))

# key, theme, level window, minutes, sort, subtitle, brief, tasks (text i18n + hint per learning language), title + pip_prompt per learning language
SCENARIOS = [
  dict(key="introduce", theme="social", level=("A1", "A2"), minutes=6, sort=1,
    subtitle=i18n("Kennenlernen", "Getting to know", "Conocerse", "Faire connaissance", "Conoscersi", "Conhecer-se"),
    brief=i18n("Du triffst jemanden zum ersten Mal auf einer kleinen Feier. Stell dich vor und finde etwas über die andere Person heraus.",
               "You meet someone for the first time at a small party. Introduce yourself and find out something about them.",
               "Conoces a alguien por primera vez en una pequeña fiesta. Preséntate y averigua algo sobre esa persona.",
               "Tu rencontres quelqu’un pour la première fois à une petite fête. Présente-toi et apprends quelque chose sur cette personne.",
               "Incontri qualcuno per la prima volta a una piccola festa. Presentati e scopri qualcosa su questa persona.",
               "Conheces alguém pela primeira vez numa pequena festa. Apresenta-te e descobre algo sobre essa pessoa."),
    tasks=[
      dict(id="greet", level="A1", text=i18n("Begrüße die Person und sag deinen Namen", "Greet the person and say your name", "Saluda a la persona y di tu nombre", "Salue la personne et dis ton nom", "Saluta la persona e di’ il tuo nome", "Cumprimenta a pessoa e diz o teu nome"),
           hint=dict(fr="Bonjour, je m’appelle …", en="Hi, my name is …", es="Hola, me llamo …")),
      dict(id="origin", level="A1", text=i18n("Sag, woher du kommst und wo du wohnst", "Say where you are from and where you live", "Di de dónde eres y dónde vives", "Dis d’où tu viens et où tu habites", "Di’ da dove vieni e dove abiti", "Diz de onde és e onde moras"),
           hint=dict(fr="Je viens de … / J’habite à …", en="I’m from … / I live in …", es="Soy de … / Vivo en …")),
      dict(id="ask", level="A2", text=i18n("Frag die Person nach ihrem Beruf oder Hobby", "Ask the person about their job or a hobby", "Pregunta a la persona por su trabajo o una afición", "Demande à la personne son métier ou un loisir", "Chiedi alla persona che lavoro fa o un hobby", "Pergunta à pessoa sobre o trabalho ou um passatempo"),
           hint=dict(fr="Qu’est-ce que tu fais dans la vie ?", en="What do you do?", es="¿A qué te dedicas?")),
    ],
    fr=("Se présenter", "Tu es un invité sympathique à une petite fête. Tu rencontres l’apprenant pour la première fois. Pose des questions simples, réponds brièvement et laisse-le parler."),
    en=("Introducing yourself", "You are a friendly guest at a small party meeting the learner for the first time. Ask simple questions, answer briefly and let them do most of the talking."),
    es=("Presentarse", "Eres un invitado simpático en una pequeña fiesta y conoces al estudiante por primera vez. Haz preguntas sencillas, responde brevemente y deja que hable."),
  ),
  dict(key="directions", theme="travel", level=("A1", "B1"), minutes=5, sort=2,
    subtitle=i18n("Weg finden", "Finding your way", "Orientarse", "Trouver son chemin", "Orientarsi", "Encontrar o caminho"),
    brief=i18n("Du bist neu in der Stadt und suchst den Bahnhof. Sprich eine Passantin an und lass dir den Weg erklären.",
               "You are new in town and looking for the station. Stop a passer-by and get directions.",
               "Eres nuevo en la ciudad y buscas la estación. Para a una transeúnte y pide indicaciones.",
               "Tu es nouveau en ville et tu cherches la gare. Aborde une passante et fais-toi expliquer le chemin.",
               "Sei nuovo in città e cerchi la stazione. Ferma una passante e fatti spiegare la strada.",
               "És novo na cidade e procuras a estação. Aborda uma transeunte e pede indicações."),
    tasks=[
      dict(id="ask", level="A1", text=i18n("Frag höflich nach dem Weg zum Bahnhof", "Politely ask the way to the station", "Pregunta amablemente cómo llegar a la estación", "Demande poliment le chemin de la gare", "Chiedi gentilmente la strada per la stazione", "Pergunta com educação o caminho para a estação"),
           hint=dict(fr="Excusez-moi, où est la gare ?", en="Excuse me, where is the station?", es="Perdone, ¿dónde está la estación?")),
      dict(id="repeat", level="A2", text=i18n("Bitte darum, es langsamer zu wiederholen", "Ask them to repeat more slowly", "Pide que lo repita más despacio", "Demande de répéter plus lentement", "Chiedi di ripetere più lentamente", "Pede para repetir mais devagar"),
           hint=dict(fr="Pourriez-vous répéter plus lentement ?", en="Could you say that more slowly?", es="¿Podría repetirlo más despacio?")),
      dict(id="confirm", level="B1", text=i18n("Fasse den Weg mit eigenen Worten zusammen", "Sum up the directions in your own words", "Resume el camino con tus palabras", "Résume le chemin avec tes mots", "Riassumi la strada con parole tue", "Resume o caminho por palavras tuas"),
           hint=dict(fr="Donc je prends à gauche, puis …", en="So I turn left, then …", es="Entonces giro a la izquierda y luego …")),
    ],
    fr=("Demander son chemin", "Tu es une passante serviable dans une ville française. L’apprenant cherche la gare. Explique le chemin en deux ou trois étapes simples, puis vérifie qu’il a compris."),
    en=("Asking for directions", "You are a helpful passer-by in an English town. The learner is looking for the station. Give the way in two or three simple steps, then check they understood."),
    es=("Preguntar el camino", "Eres una transeúnte amable en una ciudad española. El estudiante busca la estación. Explica el camino en dos o tres pasos sencillos y comprueba que lo ha entendido."),
  ),
  dict(key="restaurant", theme="food", level=("A1", "B1"), minutes=7, sort=3,
    subtitle=i18n("Abendessen", "Dinner out", "Cena fuera", "Dîner au restaurant", "Cena fuori", "Jantar fora"),
    brief=i18n("Du sitzt in einem kleinen Restaurant. Bestell etwas zu essen und zu trinken und bitte am Ende um die Rechnung.",
               "You are sitting in a small restaurant. Order something to eat and drink, and ask for the bill at the end.",
               "Estás en un pequeño restaurante. Pide algo de comer y de beber y, al final, pide la cuenta.",
               "Tu es dans un petit restaurant. Commande à manger et à boire, puis demande l’addition.",
               "Sei in un piccolo ristorante. Ordina da mangiare e da bere e alla fine chiedi il conto.",
               "Estás num pequeno restaurante. Pede algo para comer e beber e, no fim, pede a conta."),
    tasks=[
      dict(id="drink", level="A1", text=i18n("Bestell ein Getränk", "Order a drink", "Pide una bebida", "Commande une boisson", "Ordina da bere", "Pede uma bebida"),
           hint=dict(fr="Je voudrais un verre d’eau, s’il vous plaît.", en="I’d like a glass of water, please.", es="Quería un vaso de agua, por favor.")),
      dict(id="dish", level="A2", text=i18n("Frag nach einer Empfehlung und bestell ein Gericht", "Ask for a recommendation and order a dish", "Pide una recomendación y un plato", "Demande une recommandation et commande un plat", "Chiedi un consiglio e ordina un piatto", "Pede uma recomendação e um prato"),
           hint=dict(fr="Qu’est-ce que vous me conseillez ?", en="What do you recommend?", es="¿Qué me recomienda?")),
      dict(id="bill", level="A1", text=i18n("Bitte um die Rechnung", "Ask for the bill", "Pide la cuenta", "Demande l’addition", "Chiedi il conto", "Pede a conta"),
           hint=dict(fr="L’addition, s’il vous plaît.", en="Could I have the bill, please?", es="La cuenta, por favor.")),
    ],
    fr=("Au restaurant", "Tu es serveur dans un petit restaurant français. Accueille l’apprenant, prends sa commande, propose une spécialité et apporte l’addition quand il la demande."),
    en=("At the restaurant", "You are a waiter in a small restaurant. Welcome the learner, take their order, suggest a special and bring the bill when asked."),
    es=("En el restaurante", "Eres camarero en un pequeño restaurante español. Recibe al estudiante, toma nota, recomienda un plato y trae la cuenta cuando la pida."),
  ),
  dict(key="hotel", theme="travel", level=("A2", "B2"), minutes=6, sort=4,
    subtitle=i18n("Einchecken", "Checking in", "Registrarse", "Arriver à l’hôtel", "Fare il check-in", "Fazer o check-in"),
    brief=i18n("Du kommst abends im Hotel an. Check ein, frag nach dem Frühstück und melde ein Problem mit dem Zimmer.",
               "You arrive at the hotel in the evening. Check in, ask about breakfast and report a problem with the room.",
               "Llegas al hotel por la noche. Regístrate, pregunta por el desayuno y comunica un problema con la habitación.",
               "Tu arrives à l’hôtel le soir. Fais ton check-in, renseigne-toi sur le petit-déjeuner et signale un problème dans la chambre.",
               "Arrivi in hotel di sera. Fai il check-in, chiedi della colazione e segnala un problema in camera.",
               "Chegas ao hotel à noite. Faz o check-in, pergunta pelo pequeno-almoço e comunica um problema no quarto."),
    tasks=[
      dict(id="checkin", level="A2", text=i18n("Nenne deine Reservierung und check ein", "Give your booking and check in", "Indica tu reserva y regístrate", "Donne ta réservation et fais ton check-in", "Indica la prenotazione e fai il check-in", "Indica a tua reserva e faz o check-in"),
           hint=dict(fr="J’ai une réservation au nom de …", en="I have a booking under the name …", es="Tengo una reserva a nombre de …")),
      dict(id="breakfast", level="A2", text=i18n("Frag, wann und wo es Frühstück gibt", "Ask when and where breakfast is served", "Pregunta cuándo y dónde es el desayuno", "Demande où et à quelle heure est le petit-déjeuner", "Chiedi a che ora e dove c’è la colazione", "Pergunta a que horas e onde é o pequeno-almoço"),
           hint=dict(fr="Le petit-déjeuner est à quelle heure ?", en="What time is breakfast?", es="¿A qué hora es el desayuno?")),
      dict(id="problem", level="B1", text=i18n("Beschwer dich höflich über ein Problem im Zimmer", "Politely complain about a problem in the room", "Quéjate con educación de un problema en la habitación", "Signale poliment un problème dans la chambre", "Lamentati gentilmente di un problema in camera", "Queixa-te com educação de um problema no quarto"),
           hint=dict(fr="Excusez-moi, la douche ne fonctionne pas.", en="Sorry, the shower isn’t working.", es="Disculpe, la ducha no funciona.")),
    ],
    fr=("À la réception", "Tu es réceptionniste dans un hôtel en France. L’apprenant arrive le soir. Fais le check-in, réponds à ses questions et propose une solution s’il signale un problème."),
    en=("At the reception", "You are the receptionist at a hotel. The learner arrives in the evening. Check them in, answer their questions and offer a solution if they report a problem."),
    es=("En la recepción", "Eres recepcionista de un hotel en España. El estudiante llega por la noche. Haz el check-in, responde a sus preguntas y ofrece una solución si comunica un problema."),
  ),
]

def q(v): return "'" + str(v).replace("'", "''") + "'"
def j(v): return q(json.dumps(v, ensure_ascii=False))

rows = []
for s in SCENARIOS:
    for lang in ("fr", "en", "es"):
        title, prompt = s[lang]
        tasks = [dict(id=t["id"], level=t["level"], text=t["text"], hint=t["hint"][lang]) for t in s["tasks"]]
        rows.append(f"  ({q(s['key'])}, {q(lang)}, {q(title)}, {q(s['theme'])}, {q(s['level'][0])}, {q(s['level'][1])}, {s['minutes']}, "
                    f"{q('scenarios/' + s['key'] + '.webp')}, {j(s['subtitle'])}, {j(s['brief'])}, {j(tasks)}, {q(prompt)}, {s['sort']})")

sql = ("-- Generated by scripts/gen-seed-scenarios.py · the four design scenarios in fr / en / es.\n"
       "insert into public.scenarios (key, language, title, theme, level_min, level_max, minutes, illustration_storage_path, subtitle, brief, tasks, pip_prompt, sort_order) values\n"
       + ",\n".join(rows) + "\n"
       "on conflict (key, language) do update set\n"
       "  title = excluded.title, theme = excluded.theme, level_min = excluded.level_min, level_max = excluded.level_max,\n"
       "  minutes = excluded.minutes, illustration_storage_path = excluded.illustration_storage_path, subtitle = excluded.subtitle,\n"
       "  brief = excluded.brief, tasks = excluded.tasks, pip_prompt = excluded.pip_prompt, sort_order = excluded.sort_order;\n")
out = pathlib.Path(__file__).resolve().parent.parent / "supabase" / "seed" / "scenarios.sql"
out.write_text(sql, encoding="utf-8")
print(f"wrote {out} ({len(rows)} rows)")
