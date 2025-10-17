import type { Metadata } from "next";
import { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/react";
import AuthModalProvider from "@/components/auth/AuthModalProvider";
import { AuthSessionProvider } from "@/components/auth/AuthSessionProvider";
import "./globals.css";
import { displayFont, sansFont } from "./fonts";

const TRANSPARENT_FAVICON =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAABw0lEQVR4nO2ZMU4DMRBF/35thytSRiByACRES4E4QG6AItFyLESNEFtQ0SAOQEVLRUnHASjSrJTYux6Pk/1SXht75v+ZWe9Gbo6Oz6AMIQ4hDiEOIQ4hDiFO6x5x+fOQ+LWbr3zTNV7vgbTuek6aQgO5ut2dNGYD5dL7mG1wCupRENDSgcFksXKaN7oZSCjIze0VqhlvIJZyM9/f7/fWlWG2MMcsNTAmU0x32smyzIP9RWaT3l+/trGOY36IR51Cm9FL1G/d2G3Ue6Sl4RFKqDdLj03UMlkpSwd2oB69UIY+DBiIFcBRfSJgN18NdiDvFKpR/q2D5H+M9qmhPvai8P8WqqcepuDy/8g4nfLbUsh3oPUN9/zyent3n15zejL/+vzwyshJzY8h0WGE9t0xQhxCHEKctl7o2IdN9/R4c33llYUQh1U/FW2EnESHY3TfMGv1DqYoZKaQ70CbuyHMFiOHO1HL97eXy4vzrC2eHag0SMEUVn6EGvMNje8pGaxdtXfAcZBCQSiHW8qSVoTiKjg8A2YRLj10uyc2X3BMyIDhimmiBnYJIQ4hDiEOIQ4hDiEOIQ4hDiEOIQ4hDiEO9y2glH9DMaSnHMCLZgAAAABJRU5ErkJggg==";

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
    <html lang="en">
      <body className={`${sansFont.variable} ${displayFont.variable} min-h-dvh bg-[#05050b] text-white antialiased`}>
        <AuthSessionProvider>
          <AuthModalProvider>
            {children}
            <Analytics />
          </AuthModalProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
