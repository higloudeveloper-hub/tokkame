const BLOCKED = [
  /\bminors?\b/i,
  /\bunderage\b/i,
  /\bchildren?\b/i,
  /\bkids?\b/i,
  /\blolis?\b/i,
  /\blolita\b/i,
  /\bshota\b/i,
  /\bpedo\w*/i,
  /\bpedofil\w*/i,
  /\bpedófil\w*/i,
  /\bpreteen\b/i,
  /\bjailbait\b/i,
  /\bcsam\b/i,
  /\bteen(s|ager|agers)?\b/i,
  /\badolescent\w*/i,
  /\bmenor(es)?\b/i,
  /\bniñ[oa]s?\b/i,
  /\bbeb[eé]s?\b/i,
  /\binfantil\b/i,
  /\bpreadolescent\w*/i,
  /\bhigh\s*school\b/i,
  /\bsecundaria\b/i,
  /\bschoolgirl\b/i,
  /\bschoolboy\b/i,
];

const AGE = /\b(\d{1,2})\s*(años|yo\b|years?\s*old)/gi;

export function violatesSafety(text: string) {
  if (BLOCKED.some((re) => re.test(text))) return true;
  for (const match of text.matchAll(AGE)) {
    const age = Number(match[1]);
    if (age > 0 && age < 18) return true;
  }
  return false;
}

export function cleanText(input: string, max: number) {
  return input.replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, max);
}

export const SAFETY_ERROR =
  "Ese texto no se puede publicar. Tokkame no permite contenido ni cuentas que involucren a menores.";
