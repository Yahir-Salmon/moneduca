import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `Eres el asistente de finanzas personales de Moneduca, una plataforma educativa para jóvenes de secundaria en México.

Tu misión es explicar conceptos financieros de manera simple, divertida y accesible para adolescentes de 12 a 15 años.

REGLAS:
- Usa lenguaje casual y amigable, como si hablaras con un amigo
- Usa ejemplos con situaciones cotidianas mexicanas (tacos, tiendita, útiles escolares, etc.)
- Explica todo como si el usuario nunca ha escuchado el término antes
- Mantén las respuestas concisas (máximo 3 párrafos)
- Usa emojis con moderación
- SOLO responde preguntas relacionadas con finanzas personales
- Si te preguntan algo que no es finanzas, redirige amablemente al tema

TEMAS: Ahorro, presupuesto, crédito y deudas, inversión básica, metas financieras, conceptos como inflación e interés compuesto.`

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        system: SYSTEM_PROMPT,
        messages: messages.map((m: { role: string; content: string }) => ({ role: m.role, content: m.content })),
      }),
    })
    if (!response.ok) throw new Error(`API error: ${response.status}`)
    const data = await response.json()
    return NextResponse.json({ content: data.content?.[0]?.text || 'Lo siento, intenta de nuevo.' })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ content: 'Hubo un error. Por favor intenta de nuevo.' }, { status: 500 })
  }
}
