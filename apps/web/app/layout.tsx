import type { Metadata } from "next";
import { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/react";
import AuthModalProvider from "@/components/auth/AuthModalProvider";
import AuthSessionProvider from "@/components/auth/AuthSessionProvider";
import { loadServerSession } from "@/lib/server/loadSession";
import GoogleAnalyticsLoader from "@/components/analytics/GoogleAnalyticsLoader";
import "./globals.css";
import { displayFont, sansFont, stellarFont } from "./fonts";

export const metadata: Metadata = {
  title: "EarlyBird AI",
  description: "AI voice receptionist for your business",
  icons: {
    icon: [
      { url: "/brand/favicon.png", type: "image/png", sizes: "32x32" },
      { url: "/brand/icon.png", type: "image/png", sizes: "192x192" },
    ],
    shortcut: [{ url: "/brand/favicon.png", type: "image/png" }],
    apple: [{ url: "/brand/icon.png", type: "image/png", sizes: "180x180" }],
  },
};

// Ensure header reflects session cookies on every request (no static caching)
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await loadServerSession();

  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${sansFont.variable} ${displayFont.variable} ${stellarFont.variable} min-h-dvh bg-[#05050b] text-white antialiased overflow-x-hidden`}
      >
        <AuthSessionProvider initialStatus={session.status} initialProfile={session.profile}>
          <AuthModalProvider>
            <div className="flex min-h-screen flex-col overflow-hidden supports-[overflow:clip]:overflow-clip">
              {children}
            </div>
            <GoogleAnalyticsLoader />
            <Analytics />
          </AuthModalProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
