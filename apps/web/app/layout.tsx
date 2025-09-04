
import './globals.css';
import { ReactNode } from 'react';
import Link from 'next/link';
export const metadata = { title: 'EarlyBird — AI Voice Receptionist' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b p-4 flex gap-6">
          <Link href="/">Home</Link>
          <Link href="/assistants">Assistants</Link>
          <Link href="/docs">Docs</Link>
          <Link href="/changelog">Changelog</Link>
          <Link href="/support">Support</Link>
        </header>
        {children}
      </body>
    </html>
  );
}
