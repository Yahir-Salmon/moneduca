import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Esta ruta es llamada por un cron job externo cada lunes.
// Protegida con CRON_SECRET en los headers.

export async function POST(req: NextRequest) {
  // Verificar autorización
  const authHeader = req.headers.get('authorization')
  const secret = process.env.CRON_SECRET
  console.log('AUTH HEADER:', authHeader)
  console.log('CRON_SECRET defined:', !!secret)
  console.log('CRON_SECRET first8:', secret?.slice(0, 8))
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'No autorizado', debug: { headerReceived: authHeader?.slice(0, 20), secretDefined: !!secret } }, { status: 401 })
  }

  // Cliente con service role para leer datos de usuarios
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // Obtener usuarios que no han estudiado en los últimos 7 días
    // y tienen al menos una unidad completada (usuarios activos, no nuevos)
    const hace7Dias = new Date()
    hace7Dias.setDate(hace7Dias.getDate() - 7)

    const { data: usuarios, error } = await supabase
      .from('profiles')
      .select('id, nombre, email')
      .lt('ultima_actividad', hace7Dias.toISOString())
      .not('ultima_actividad', 'is', null)

    if (error) throw error
    if (!usuarios || usuarios.length === 0) {
      return NextResponse.json({ enviados: 0, mensaje: 'Sin usuarios inactivos esta semana.' })
    }

    // Verificar que tienen al menos una unidad completada
    const { data: progresosActivos } = await supabase
      .from('progreso_unidad')
      .select('user_id')
      .in('user_id', usuarios.map(u => u.id))
      .eq('completada', true)

    const idsConProgreso = new Set(progresosActivos?.map(p => p.user_id) || [])
    const destinatarios = usuarios.filter(u => idsConProgreso.has(u.id))

    if (destinatarios.length === 0) {
      return NextResponse.json({ enviados: 0, mensaje: 'Sin destinatarios con progreso.' })
    }

    // Enviar emails individualmente para personalizar el nombre
    const resultados = await Promise.allSettled(
      destinatarios.map(usuario => enviarRecordatorio(usuario))
    )

    const enviados = resultados.filter(r => r.status === 'fulfilled').length
    const fallidos = resultados.filter(r => r.status === 'rejected').length

    return NextResponse.json({
      enviados,
      fallidos,
      total: destinatarios.length,
    })
  } catch (error) {
    console.error('Error en cron de notificaciones:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

async function enviarRecordatorio(usuario: { id: string; nombre: string; email: string }) {
  const nombre = usuario.nombre || 'Estudiante'
  const dashboardUrl = 'https://moneduca.mx/dashboard'

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
      html: emailTemplate(nombre, dashboardUrl),
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(`Resend error para ${usuario.email}: ${JSON.stringify(err)}`)
  }

  return res.json()
}

function emailTemplate(nombre: string, dashboardUrl: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Te extrañamos en Moneduca</title>
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
                    <span style="font-size:20px;line-height:36px;display:block;">M</span>
                  </td>
                  <td style="padding-left:10px;font-size:20px;font-weight:700;color:#3D2A0E;">
                    Moneduca
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card principal -->
          <tr>
            <td style="background:#FFFDF5;border:1px solid #E8D9B8;border-radius:20px;padding:40px 36px;">

              <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#A87840;">
                Tu aprendizaje
              </p>
              <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#3D2A0E;line-height:1.2;">
                Ha pasado una semana, ${nombre}.
              </h1>
              <p style="margin:0 0 24px;font-size:15px;color:#8C6D45;line-height:1.7;">
                Llevas 7 días sin repasar tus finanzas. No pasa nada, esto sucede.
                Lo que importa es que tu próxima lección sigue ahí, esperándote.
              </p>

              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr><td style="height:1px;background:#E8D9B8;"></td></tr>
              </table>

              <p style="margin:0 0 16px;font-size:14px;color:#6B4520;line-height:1.6;">
                Cada semana que practicas aunque sea 15 minutos construyes un hábito
                que la mayoría de adultos nunca desarrolló.
              </p>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" style="margin-top:28px;">
                <tr>
                  <td style="background:#6B4520;border-radius:100px;">
                    <a href="${dashboardUrl}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#FCE68B;text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
                      Continuar aprendiendo
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:28px;">
              <p style="margin:0;font-size:12px;color:#A87840;line-height:1.6;">
                Recibes este correo porque tienes una cuenta en
                <a href="https://moneduca.mx" style="color:#C8934A;text-decoration:none;">moneduca.mx</a>.
                Si no quieres recibir recordatorios, puedes ajustarlo desde tu
                <a href="https://moneduca.mx/perfil" style="color:#C8934A;text-decoration:none;">perfil</a>.
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
