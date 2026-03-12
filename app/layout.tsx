import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Moneduca',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: ['/favicon.ico'],
    apple: ['/favicon.ico'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
        <html lang="es-MX">
      <body>{children}</body>
    </html>
  )
}
