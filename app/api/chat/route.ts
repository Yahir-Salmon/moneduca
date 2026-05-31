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

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        max_tokens: 600,
        temperature: 0.7,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages.map((m: { role: string; content: string }) => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content,
          })),
        ],
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      console.error('Groq error:', err)
      throw new Error('Groq API error')
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || 'Lo siento, intenta de nuevo.'

    return NextResponse.json({ content })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ content: 'Hubo un error. Por favor intenta de nuevo.' }, { status: 500 })
  }
}
