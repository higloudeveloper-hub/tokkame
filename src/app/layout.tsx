import type { Metadata, Viewport } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { getSessionUser, hasAgeCookie, sessionView } from "@/lib/auth";
import { AgeGate } from "@/components/age-gate";
import { AppShell } from "@/components/app-shell";
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

export const metadata: Metadata = {
  title: "TOKKAME — Say it. Choose who hears it.",
  description: "Adults talk in private. Infidelity, work, a secret, or whatever it is. You choose the person.",
  applicationName: "TOKKAME",
  appleWebApp: { capable: true, title: "TOKKAME", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0c0c0e",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const aged = await hasAgeCookie();
  const user = aged ? await getSessionUser() : null;
  const db = aged ? readDb() : null;
  const activity = db ? activityFeed(db) : [];
  const online = db ? creatorCards(db).filter((creator) => creator.online).map((creator) => ({
    id: creator.id,
    name: creator.name,
    username: creator.username,
    photo: creator.photo,
  })) : [];
  return (
    <html lang="en" className={`${outfit.variable} ${fraunces.variable}`}>
      <body>
        {aged ? (
          <Suspense>
            <AppShell user={user ? sessionView(user) : null} activity={activity} online={online}>
              {children}
            </AppShell>
          </Suspense>
        ) : (
          <AgeGate />
        )}
      </body>
    </html>
  );
}
