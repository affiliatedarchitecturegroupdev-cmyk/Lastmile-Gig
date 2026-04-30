import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LASTMILE GIG | South Africa\'s Delivery Platform',
  description: 'AI-Powered Last-Mile Delivery Platform for South Africa. Connecting restaurants, drivers, and customers through intelligent dispatch and sustainable logistics.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b">
          <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-emerald-600">
              LASTMILE GIG
            </a>
            <div className="hidden md:flex items-center gap-8">
              <a href="#about" className="text-sm hover:text-emerald-600">About</a>
              <a href="#solutions" className="text-sm hover:text-emerald-600">Solutions</a>
              <a href="#partners" className="text-sm hover:text-emerald-600">Partners</a>
              <a href="#contact" className="text-sm hover:text-emerald-600">Contact</a>
            </div>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="py-8 border-t bg-gray-50">
          <div className="container mx-auto px-4 text-center text-sm text-gray-500">
            © 2024 LASTMILE GIG. South Africa&apos;s AI Delivery Platform.
          </div>
        </footer>
      </body>
    </html>
  )
}