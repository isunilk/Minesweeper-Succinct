// Updated: Added Syne and Urbanist fonts, updated ThemeProvider
import './globals.css';
import type { Metadata } from 'next';
import { Syne, Urbanist } from 'next/font/google';
import { ThemeProvider } from '@/components/ThemeProvider';

const syne = Syne({ 
  subsets: ['latin'],
  variable: '--font-syne'
});

const urbanist = Urbanist({ 
  subsets: ['latin'],
  variable: '--font-urbanist'
});

export const metadata: Metadata = {
  title: 'Succinct Minesweeper',
  description: 'Minesweeper game with verifiable scores using zero-knowledge proofs',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${syne.variable} ${urbanist.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}