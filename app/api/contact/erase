import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { nombre, email, mensaje } = await req.json()

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Moneduca <onboarding@resend.dev>',
        to: ['moneduca.finanzas@gmail.com'],
        subject: `Nuevo mensaje de contacto — ${nombre}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0D0D0D;">📬 Nuevo mensaje de Moneduca</h2>
            <div style="background: #F9FAFB; border-radius: 12px; padding: 24px; margin: 20px 0;">
              <p><strong>Nombre:</strong> ${nombre}</p>
              <p style="margin-top:8px"><strong>Email:</strong> ${email}</p>
              <p style="margin-top:8px"><strong>Mensaje:</strong></p>
              <p style="background: white; padding: 16px; border-radius: 8px; border-left: 4px solid #00C896; margin-top: 8px;">${mensaje}</p>
            </div>
            <p style="color: #9CA3AF; font-size: 13px;">Enviado desde el formulario de contacto de moneduca.mx</p>
          </div>
        `,
        reply_to: email,
      }),
    })

    if (!res.ok) throw new Error('Resend error')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact error:', error)
    return NextResponse.json({ error: 'Error al enviar mensaje' }, { status: 500 })
  }
}
