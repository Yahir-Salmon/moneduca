import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

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
  url: 'https://www.moneduca.mx',
  siteName: 'Moneduca',
  images: [{ url: 'https://www.moneduca.mx/monedoki.png', width: 400, height: 400 }],
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
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
