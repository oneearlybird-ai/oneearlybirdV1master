import type { Metadata } from "next";
import { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/react";
import AuthModalProvider from "@/components/auth/AuthModalProvider";
import { AuthSessionProvider } from "@/components/auth/AuthSessionProvider";
import "./globals.css";
import { displayFont, sansFont, stellarFont } from "./fonts";

const TRANSPARENT_FAVICON =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCA2NCA2NCc+PHJlY3Qgd2lkdGg9JzY0JyBoZWlnaHQ9JzY0JyByeD0nMTYnIGZpbGw9JyMwNTA1MGInLz48dGV4dCB4PSc1MCUnIHk9JzQwJyBmaWxsPScjZmZmZmZmJyBmb250LWZhbWlseT0nSW50ZXIsIEFyaWFsLCBzYW5zLXNlcmlmJyBmb250LXNpemU9JzI4JyBmb250LXdlaWdodD0nNzAwJyB0ZXh0LWFuY2hvcj0nbWlkZGxlJz5FQjwvdGV4dD48dGV4dCB4PSc1MCUnIHk9JzU0JyBmaWxsPScjOGI1Y2Y2JyBmb250LWZhbWlseT0nSW50ZXIsIEFyaWFsLCBzYW5zLXNlcmlmJyBmb250LXNpemU9JzE4JyBmb250LXdlaWdodD0nNjAwJyB0ZXh0LWFuY2hvcj0nbWlkZGxlJz5BSTwvdGV4dD48L3N2Zz4=";

export const metadata: Metadata = {
  title: {
    default: "EarlyBird AI",
    template: "%s – EarlyBird AI",
  },
  description: "AI voice receptionist for your business",
  icons: {
    icon: [{ url: TRANSPARENT_FAVICON, type: "image/png", sizes: "any" }],
    shortcut: [{ url: TRANSPARENT_FAVICON, type: "image/png" }],
    apple: [{ url: TRANSPARENT_FAVICON, type: "image/png" }],
    other: [{ rel: "mask-icon", url: TRANSPARENT_FAVICON }],
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
