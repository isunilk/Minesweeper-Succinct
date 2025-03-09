import './globals.css';
import type { Metadata } from 'next';
import { Syne, Urbanist } from 'next/font/google';

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
    <html lang="en" className="light">
      <body className={`${syne.variable} ${urbanist.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}