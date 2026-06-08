import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // Todos los usuarios que no han desactivado correos
    const { data: usuarios, error } = await supabase
      .from('profiles')
      .select('id, nombre, email')
      .eq('recibir_correos', true)

    if (error) throw error
    if (!usuarios || usuarios.length === 0) {
      return NextResponse.json({ enviados: 0, mensaje: 'Sin destinatarios.' })
    }

    const resultados = await Promise.allSettled(
      usuarios.map(u => enviarRecordatorio(u))
    )

    const enviados = resultados.filter(r => r.status === 'fulfilled').length
    const fallidos = resultados.filter(r => r.status === 'rejected').length

    return NextResponse.json({ enviados, fallidos, total: usuarios.length })
  } catch (error) {
    console.error('Error en cron:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

async function enviarRecordatorio(usuario: { id: string; nombre: string; email: string }) {
  const nombre = usuario.nombre || 'Estudiante'
  const dashboardUrl = 'https://moneduca.mx/dashboard'
  const cancelUrl = `https://moneduca.mx/api/cancelar-correos?id=${usuario.id}`

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'Moneduca <hola@moneduca.mx>',
      to: [usuario.email],
      subject: `${nombre}, tu aprendizaje te espera`,
      html: emailTemplate(nombre, dashboardUrl, cancelUrl),
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(`Resend error: ${JSON.stringify(err)}`)
  }

  return res.json()
}

function emailTemplate(nombre: string, dashboardUrl: string, cancelUrl: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Tu aprendizaje te espera</title>
</head>
<body style="margin:0;padding:0;background:#FFF8E8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF8E8;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Logo -->
          <tr>
            <td style="padding-bottom:32px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#FAC94D;border-radius:10px;width:36px;height:36px;text-align:center;vertical-align:middle;">
                    <span style="font-size:20px;font-weight:700;line-height:36px;display:block;color:#3D2A0E;">M</span>
                  </td>
                  <td style="padding-left:10px;font-size:20px;font-weight:700;color:#3D2A0E;">
                    Moneduca
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#FFFDF5;border:1px solid #E8D9B8;border-radius:20px;padding:40px 36px;">
              <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#A87840;">
                Tu aprendizaje
              </p>
              <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#3D2A0E;line-height:1.2;">
                Esta semana puedes aprender algo nuevo, ${nombre}.
              </h1>
              <p style="margin:0 0 24px;font-size:15px;color:#8C6D45;line-height:1.7;">
                Dedicar 15 minutos a la semana a tus finanzas es suficiente para construir un hábito
                que la mayoría de adultos nunca desarrolló.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr><td style="height:1px;background:#E8D9B8;"></td></tr>
              </table>
              <p style="margin:0;font-size:14px;color:#6B4520;line-height:1.6;">
                Tu próxima lección te espera en el dashboard.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin-top:28px;">
                <tr>
                  <td style="background:#6B4520;border-radius:100px;">
                    <a href="${dashboardUrl}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#FCE68B;text-decoration:none;">
                      Continuar aprendiendo
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:24px;">
              <p style="margin:0;font-size:12px;color:#A87840;line-height:1.6;">
                Recibes este correo porque tienes una cuenta en
                <a href="https://moneduca.mx" style="color:#C8934A;text-decoration:none;">moneduca.mx</a>.
              </p>
              <p style="margin:8px 0 0;">
                <a href="${cancelUrl}" style="font-size:10px;color:#C8B89A;text-decoration:none;">dejar de recibir recordatorios</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
