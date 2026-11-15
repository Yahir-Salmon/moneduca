import { NextRequest, NextResponse } from 'next/server'

function escapeHtml(str: string): string {
  return str.trim().replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[char] || char))
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254
}

export async function POST(req: NextRequest) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'El formulario no está disponible por el momento.' }, { status: 503 })
  }

  try {
    const body = await req.json()

    // Validar que el cuerpo sea un objeto simple
    if (typeof body !== 'object' || Array.isArray(body) || body === null) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }

    const { nombre, email, mensaje } = body

    // Validaciones estrictas
    if (typeof nombre !== 'string' || nombre.trim().length < 2 || nombre.length > 100) {
      return NextResponse.json({ error: 'Nombre inválido' }, { status: 400 })
    }
    if (typeof email !== 'string' || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }
    if (typeof mensaje !== 'string' || mensaje.trim().length < 10 || mensaje.length > 2000) {
      return NextResponse.json({ error: 'Mensaje inválido (entre 10 y 2000 caracteres)' }, { status: 400 })
    }

    const nombreLimpio = escapeHtml(nombre)
    const mensajeLimpio = escapeHtml(mensaje)
    const emailLimpio = escapeHtml(email)

    const remitente = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
    const destino = process.env.CONTACT_EMAIL || 'moneduca.finanzas@gmail.com'

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `Moneduca <${remitente}>`,
        to: [destino],
        subject: `Mensaje de contacto — ${nombreLimpio}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
            <h2 style="color: #3D2A0E; margin-bottom: 20px;">Nuevo mensaje de contacto</h2>
            <div style="background: #FFF8E8; border-radius: 12px; padding: 24px; margin: 20px 0; border: 1px solid #E8D9B8;">
              <p style="margin: 0 0 8px;"><strong>Nombre:</strong> ${nombreLimpio}</p>
              <p style="margin: 8px 0;"><strong>Email:</strong> ${emailLimpio}</p>
              <p style="margin: 8px 0;"><strong>Mensaje:</strong></p>
              <p style="background: white; padding: 16px; border-radius: 8px; border-left: 3px solid #C8934A; margin-top: 8px; white-space: pre-wrap;">${mensajeLimpio}</p>
            </div>
            <p style="color: #A87840; font-size: 12px;">Enviado desde Moneduca</p>
          </div>
        `,
        reply_to: email.trim(),
      }),
    })

    if (!res.ok) {
      console.error('Resend request failed with status:', res.status)
      return NextResponse.json({ error: 'No se pudo enviar el mensaje. Intenta de nuevo más tarde.' }, { status: 502 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact error:', error)
    return NextResponse.json({ error: 'Error al enviar mensaje' }, { status: 500 })
  }
}
