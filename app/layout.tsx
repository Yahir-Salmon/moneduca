import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Moneduca — Finanzas para jóvenes',
  description: 'Aprende a manejar tu dinero de forma divertida e inteligente. Cursos de finanzas personales diseñados para jóvenes de secundaria.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
