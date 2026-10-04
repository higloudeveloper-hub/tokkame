import type { Metadata, Viewport } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { getSessionUser, hasAgeCookie, sessionView } from "@/lib/auth";
import { AgeGate } from "@/components/age-gate";
import { AppShell } from "@/components/app-shell";
import { getLang } from "@/lib/lang";
import { activityFeed, creatorCards } from "@/lib/studio";
import { readDb } from "@/lib/store";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return {
    title: lang === "es" ? "TOKKAME — Compra el drop." : "TOKKAME — Buy the drop.",
    description: lang === "es"
      ? "Archivo premium para adultos. Drops y suscripciones. Sin sala en vivo."
      : "A premium archive for adults. Drops and subscriptions. No live room.",
    applicationName: "TOKKAME",
    appleWebApp: { capable: true, title: "TOKKAME", statusBarStyle: "black-translucent" },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0c0c0e",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const lang = await getLang();
  const aged = await hasAgeCookie();
  const user = aged ? await getSessionUser() : null;
  const db = aged ? readDb() : null;
  const activity = db ? activityFeed(db, lang) : [];
  const online = db ? creatorCards(db).filter((creator) => creator.online).map((creator) => ({
    id: creator.id,
    name: creator.name,
    username: creator.username,
    photo: creator.photo,
  })) : [];
  return (
    <html lang={lang} className={`${outfit.variable} ${fraunces.variable}`}>
      <body>
        {aged ? (
          <Suspense>
            <AppShell lang={lang} user={user ? sessionView(user) : null} activity={activity} online={online}>
              {children}
            </AppShell>
          </Suspense>
        ) : (
          <AgeGate lang={lang} />
        )}
      </body>
    </html>
  );
}
