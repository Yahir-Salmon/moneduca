import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')

  if (!id || typeof id !== 'string' || id.length < 10) {
    return new NextResponse('Enlace inválido.', { status: 400, headers: { 'Content-Type': 'text/html' } })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabase
    .from('profiles')
    .update({ recibir_correos: false })
    .eq('id', id)

  if (error) {
    return new NextResponse(paginaResultado(false), { status: 500, headers: { 'Content-Type': 'text/html' } })
  }

  return new NextResponse(paginaResultado(true), { status: 200, headers: { 'Content-Type': 'text/html' } })
}

function paginaResultado(exito: boolean): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${exito ? 'Cancelado' : 'Error'} — Moneduca</title>
  <style>
    body { margin: 0; background: #FFF8E8; font-family: 'Helvetica Neue', sans-serif;
      display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .card { background: #FFFDF5; border: 1px solid #E8D9B8; border-radius: 20px;
      padding: 48px 40px; max-width: 440px; text-align: center; }
    .logo { background: #FAC94D; border-radius: 10px; width: 40px; height: 40px;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 24px; font-size: 22px; font-weight: 700; color: #3D2A0E; }
    h1 { font-size: 22px; color: #3D2A0E; margin: 0 0 12px; }
    p { font-size: 14px; color: #8C6D45; line-height: 1.7; margin: 0 0 28px; }
    a { display: inline-block; padding: 12px 28px; background: #6B4520; color: #FCE68B;
      border-radius: 100px; text-decoration: none; font-size: 14px; font-weight: 700; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">M</div>
    ${exito
      ? `<h1>Listo</h1>
         <p>Ya no recibirás recordatorios semanales de Moneduca. Puedes reactivarlos desde tu perfil cuando quieras.</p>
         <a href="https://moneduca.mx">Volver al inicio</a>`
      : `<h1>Algo salió mal</h1>
         <p>No pudimos procesar tu solicitud. Intenta de nuevo desde tu perfil.</p>
         <a href="https://moneduca.mx/perfil">Ir a mi perfil</a>`
    }
  </div>
</body>
</html>`
}
