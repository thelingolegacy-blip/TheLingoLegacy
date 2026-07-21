import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';
import AudioController from '@/components/AudioController';
import AIHelper from '@/components/AIHelper';
import SeasonalTheme from '@/components/SeasonalTheme';
import { Analytics } from '@vercel/analytics/next';

export const metadata: Metadata = {
  title: 'The Lingo Legacy HQ',
  description: 'The command center for The Lingo Legacy digital ecosystem: games, apparel, books, media, rewards, AI Lab, and Lingo ID.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SeasonalTheme />
        <ParticleBackground />
        <Navigation />
        <main>{children}</main>
        <Footer />
        <AudioController />
        <AIHelper />
        <Analytics />
      </body>
    </html>
  );
}
