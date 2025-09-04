import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EarlyBird — AI Voice Receptionist",
  description: "Answer every call. Book more appointments. Analytics & billing built-in.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-neutral-950 text-white antialiased">{children}</body>
    </html>
  );
}
