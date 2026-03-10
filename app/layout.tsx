import "./globals.css"

export const metadata = {
  title: "Moneduca",
  description: "Aprende educación financiera"
}

export default function RootLayout({
  children
}:{
  children: React.ReactNode
}){

  return(
    <html lang="es">
      <body>

        <header className="header">
          <h1>Moneduca</h1>
        </header>

        <main className="container">
          {children}
        </main>

      </body>
    </html>
  )
}
