import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from './providers';
import { ThemedToaster } from './components/themed-toaster';
import { ThemeController } from './components/ThemeController';

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['400', '500', '700'], // Regular, Medium, Bold
});

export const metadata: Metadata = {
  title: 'E-Rates',
  description: 'Exchange rate management system',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ThemeController />
          {children}
          <ThemedToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
