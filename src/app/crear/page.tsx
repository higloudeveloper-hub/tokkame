import { redirect } from "next/navigation";
import { CameraStudio } from "@/components/camera-studio";
import { getSessionUser } from "@/lib/auth";
import { getLang } from "@/lib/lang";

export default async function CrearPage() {
  const me = await getSessionUser();
  if (!me) redirect("/signup?next=/crear");
  const lang = await getLang();
  return <CameraStudio canCharge={me.verified === "verified" || me.role === "admin"} lang={lang} />;
}
