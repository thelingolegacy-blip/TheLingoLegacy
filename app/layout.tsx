import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Lingo Legacy OS',
  description: 'The live operating layer for The Lingo Legacy.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
