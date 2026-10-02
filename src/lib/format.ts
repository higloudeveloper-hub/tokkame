export function money(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

export function compact(n: number) {
  return new Intl.NumberFormat("es", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

export function cents(n: number) {
  return Math.round(n * 100) / 100;
}

export function ago(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "ahora";
  if (s < 3600) return `hace ${Math.floor(s / 60)} min`;
  if (s < 86400) return `hace ${Math.floor(s / 3600)} h`;
  return `hace ${Math.floor(s / 86400)} d`;
}

export function until(iso: string) {
  const s = new Date(iso).getTime() - Date.now();
  if (s <= 0) return "disponible";
  const h = Math.floor(s / 3600000);
  const d = Math.floor(h / 24);
  if (d > 0) return `en ${d} d`;
  if (h > 0) return `en ${h} h`;
  const m = Math.max(1, Math.floor(s / 60000));
  return `en ${m} min`;
}

export function when(iso: string) {
  return new Intl.DateTimeFormat("es", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export const CATEGORIES = [
  "Fotografía",
  "Moda",
  "Fitness",
  "Música",
  "Arte",
  "Conversación",
  "Estilo de vida",
] as const;

export const REGIONS = [
  "Ciudad de México",
  "Madrid",
  "Miami",
  "Buenos Aires",
  "Barcelona",
  "Bogotá",
  "Lima",
  "Santiago",
] as const;

export const TIER_RANK: Record<string, number> = {
  inner: 1,
  vip: 2,
  elite: 3,
};
