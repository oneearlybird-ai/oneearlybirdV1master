import './globals.css';

export const metadata = {
  title: 'EarlyBird – AI Receptionist',
  description: 'PolyAI-style AI voice receptionist for business calls.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
