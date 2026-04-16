import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Card Payment',
  description: 'Mocked card payment page with iframe-based PCI-scoped card form',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
