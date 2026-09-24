import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import type { Metadata } from 'next';
import { DemoAuthProvider } from '@/lib/demo-auth';
import './globals.css';

export const metadata: Metadata = {
  title: 'Safira Admin',
  description: 'Safira admin foundation',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans">
        <DemoAuthProvider>{children}</DemoAuthProvider>
      </body>
    </html>
  );
}
