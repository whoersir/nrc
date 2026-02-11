import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AudioPlayerProvider } from '@/contexts/AudioPlayerContext';
import { MiniPlayer } from '@/components/MiniPlayer';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'NRC的温馨小屋',
    template: '%s | NRC的温馨小屋',
  },
  description: 'NRC团队的温馨小屋，这里有属于你的个人空间、团队的AI-agent、聆听美妙音乐缓解你的工作压力，闲暇时光跟朋友来一把小游戏增进友谊。',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <html lang="zh-CN">
      <body className="antialiased flex min-h-screen flex-col">
        <AudioPlayerProvider>
          {isDev && <Inspector />}
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <MiniPlayer />
        </AudioPlayerProvider>
      </body>
    </html>
  );
}
