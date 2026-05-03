import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LASTMILE GIG - Customer App',
  description: 'Order food delivery from your favorite restaurants',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}