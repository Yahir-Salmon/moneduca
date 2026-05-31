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

    // Convertir historial al formato de Gemini
    const history = messages.slice(0, -1).map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

    const lastMessage = messages[messages.length - 1]

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: SYSTEM_PROMPT }],
          },
          contents: [
            ...history,
            {
              role: 'user',
              parts: [{ text: lastMessage.content }],
            },
          ],
          generationConfig: {
            maxOutputTokens: 600,
            temperature: 0.7,
          },
        }),
      }
    )

    if (!response.ok) {
      const err = await response.json()
      console.error('Gemini error:', err)
      throw new Error('Gemini API error')
    }

    const data = await response.json()
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Lo siento, intenta de nuevo.'

    return NextResponse.json({ content })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ content: 'Hubo un error. Por favor intenta de nuevo.' }, { status: 500 })
  }
}
