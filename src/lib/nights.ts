const PROMPTS = [
  { es: "¿Qué dejaste a medias hoy?", en: "What did you leave unfinished today?" },
  { es: "¿A quién le debes un mensaje?", en: "Who do you owe a message?" },
  { es: "¿Qué quieres que pase antes de dormir?", en: "What do you want to happen before sleep?" },
  { es: "¿Dónde estabas a esta hora hace un año?", en: "Where were you at this hour a year ago?" },
  { es: "¿Qué mentira pequeña te dijiste hoy?", en: "What small lie did you tell yourself today?" },
  { es: "¿Qué estás evitando nombrar?", en: "What are you avoiding naming?" },
  { es: "¿Con quién te quedarías en silencio?", en: "Who would you sit in silence with?" },
  { es: "¿Qué parte del día borrarías?", en: "Which part of the day would you erase?" },
  { es: "¿Qué promesa sigues sin cumplir?", en: "Which promise are you still breaking?" },
  { es: "¿Qué harías si nadie te preguntara?", en: "What would you do if nobody asked?" },
  { es: "¿Qué extrañas de un lugar?", en: "What do you miss about a place?" },
  { es: "¿Qué te dio risa y no lo dijiste?", en: "What made you laugh and you kept it?" },
  { es: "¿Qué quieres soltar esta semana?", en: "What do you want to put down this week?" },
  { es: "¿Qué noche repetirías?", en: "Which night would you repeat?" },
] as const;

export function nightKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function tonightPrompt(lang: "en" | "es", date = new Date()) {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const day = Math.floor((date.getTime() - start) / 86_400_000);
  const index = ((day % PROMPTS.length) + PROMPTS.length) % PROMPTS.length;
  return PROMPTS[index][lang];
}
