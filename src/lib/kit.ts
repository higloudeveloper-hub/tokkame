export const TRACKS = [
  { id: "pulso", es: "Pulso", en: "Pulse", notes: [220, 277, 330], rate: 520 },
  { id: "noche", es: "Noche", en: "Night", notes: [174, 220, 262], rate: 740 },
  { id: "brillo", es: "Brillo", en: "Shine", notes: [392, 494, 587], rate: 420 },
  { id: "calle", es: "Calle", en: "Street", notes: [147, 196, 247], rate: 640 },
  { id: "seda", es: "Seda", en: "Silk", notes: [311, 370, 440], rate: 800 },
] as const;

export const RETOS = [
  { id: "luz", es: "Luz de las 9", en: "Light at 9", detail: { es: "Una sola luz en el cuadro.", en: "One light in the frame." } },
  { id: "tres", es: "Tres segundos", en: "Three seconds", detail: { es: "Algo que dure un parpadeo.", en: "Something that lasts a blink." } },
  { id: "calle", es: "Desde la calle", en: "From the street", detail: { es: "Donde estás, sin obligar la cara.", en: "Where you are. The face is optional." } },
  { id: "manos", es: "Solo las manos", en: "Only hands", detail: { es: "El reto es no mostrar la cara.", en: "The challenge is to leave the face out." } },
  { id: "rojo", es: "Algo rojo", en: "Something red", detail: { es: "Un detalle rojo.", en: "One red detail." } },
] as const;

export const FILTERS = [
  { id: "normal", es: "Normal", en: "Normal", css: "none" },
  { id: "calido", es: "Cálido", en: "Warm", css: "sepia(0.35) saturate(1.35) contrast(1.05)" },
  { id: "frio", es: "Frío", en: "Cool", css: "saturate(0.75) hue-rotate(18deg) contrast(1.08)" },
  { id: "noir", es: "Noir", en: "Noir", css: "grayscale(1) contrast(1.25)" },
  { id: "fade", es: "Fade", en: "Fade", css: "contrast(0.9) brightness(1.08) saturate(0.7)" },
  { id: "vivo", es: "Vivo", en: "Vivid", css: "saturate(1.65) contrast(1.12)" },
] as const;

export type Track = (typeof TRACKS)[number];
export type Reto = (typeof RETOS)[number];

function roll(id: string) {
  return [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

export function trackFor(post: { id: string; track?: string | null }) {
  if (post.track) return TRACKS.find((item) => item.id === post.track) ?? TRACKS[0];
  return TRACKS[roll(post.id) % TRACKS.length];
}

export function retoFor(post: { id: string; challenge?: string | null }) {
  if (post.challenge) return RETOS.find((item) => item.id === post.challenge) ?? null;
  const n = roll(post.id);
  if (n % 3 !== 0) return null;
  return RETOS[n % RETOS.length];
}
