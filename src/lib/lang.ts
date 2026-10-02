import { cookies } from "next/headers";

export type Lang = "en" | "es";

export async function getLang(): Promise<Lang> {
  const jar = await cookies();
  return jar.get("tokkame_lang")?.value === "es" ? "es" : "en";
}
