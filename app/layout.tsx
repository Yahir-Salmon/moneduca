import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { LanguageProvider } from '@/lib/language'

export const metadata: Metadata = {
  title: 'Moneduca — Finanzas para jóvenes',
  description:
    'Aprende a manejar tu dinero de forma divertida e inteligente. Cursos de finanzas personales diseñados para jóvenes de secundaria.',
icons: {
  icon: '/favicon.ico',
  shortcut: '/favicon.ico',
  apple: '/favicon.ico',
},
openGraph: {
  title: 'Moneduca — Finanzas para jóvenes',
  description: 'Aprende a manejar tu dinero de forma divertida e inteligente.',
  url: process.env.NEXT_PUBLIC_SITE_URL || undefined,
  siteName: 'Moneduca',
  images: [{ url: '/monedoki.png', width: 400, height: 400 }],
  type: 'website',
},
  verification: {
    google: 'opKmUQFTcZgh9jGOWGulYZDJ8AgQcDHcx32uupzAyc4',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>
        <LanguageProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  )
}
