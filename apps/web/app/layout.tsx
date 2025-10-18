import type { Metadata } from "next";
import { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/react";
import AuthModalProvider from "@/components/auth/AuthModalProvider";
import { AuthSessionProvider } from "@/components/auth/AuthSessionProvider";
import "./globals.css";
import { displayFont, sansFont, stellarFont } from "./fonts";

export const metadata: Metadata = {
  title: {
    default: "EarlyBird AI",
    template: "%s – EarlyBird AI",
  },
  description: "AI voice receptionist for your business",
  icons: {
    icon: [
      { url: "/brand/favicon.svg", type: "image/svg+xml" },
      { url: "/brand/icon.svg", type: "image/svg+xml", sizes: "any" },
    ],
    shortcut: [{ url: "/brand/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/brand/icon.svg", type: "image/svg+xml" }],
  },
};

// Ensure header reflects session cookies on every request (no static caching)
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${sansFont.variable} ${displayFont.variable} ${stellarFont.variable} min-h-dvh bg-[#05050b] text-white antialiased overflow-x-hidden`}
      >
        <AuthSessionProvider>
          <AuthModalProvider>
            <div className="flex min-h-screen flex-col overflow-hidden supports-[overflow:clip]:overflow-clip">
              {children}
            </div>
            <Analytics />
          </AuthModalProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
