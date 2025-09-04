export const metadata = {
  title: "EarlyBird — AI Voice Receptionist",
  description: "Answer every call. Book more appointments.",
};

import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
