export const metadata = {
  title: "Moneduca",
  description: "Plataforma de educación financiera",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <header style={{padding:20, background:"#f4f6ff"}}>
          <h2>Moneduca</h2>
        </header>

        <main>{children}</main>

        <footer style={{padding:20}}>
          Proyecto de educación financiera
        </footer>
      </body>
    </html>
  );
}
