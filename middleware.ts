import { NextRequest, NextResponse } from 'next/server'

// Rate limiting simple en memoria (para producción real, usar Redis o Upstash)
// Este middleware corre en el edge runtime de Vercel — no persiste entre instancias,
// pero sí protege contra ráfagas rápidas de un mismo cliente.
const requestCounts = new Map<string, { count: number; resetAt: number }>()

const LIMITS: Record<string, { max: number; windowMs: number }> = {
  '/api/chat':    { max: 20,  windowMs: 60_000 },   // 20 mensajes por minuto
  '/api/contact': { max: 3,   windowMs: 300_000 },   // 3 mensajes cada 5 minutos
  '/api/cron':    { max: 5,   windowMs: 3_600_000 }, // 5 llamadas por hora
}

function getClientId(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

function checkRateLimit(key: string, limit: { max: number; windowMs: number }): boolean {
  const now = Date.now()
  const entry = requestCounts.get(key)

  if (!entry || now > entry.resetAt) {
    requestCounts.set(key, { count: 1, resetAt: now + limit.windowMs })
    return true
  }

  if (entry.count >= limit.max) return false

  entry.count++
  return true
}

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // Aplicar rate limiting a las API routes
  for (const [route, limit] of Object.entries(LIMITS)) {
    if (pathname.startsWith(route)) {
      const clientId = getClientId(req)
      const key = `${clientId}:${route}`

      if (!checkRateLimit(key, limit)) {
        return NextResponse.json(
          { error: 'Demasiadas solicitudes. Intenta de nuevo más tarde.' },
          {
            status: 429,
            headers: {
              'Retry-After': String(Math.ceil(limit.windowMs / 1000)),
              'Content-Type': 'application/json',
            },
          }
        )
      }
      break
    }
  }

  // Bloquear métodos HTTP no permitidos en las API routes
  if (pathname.startsWith('/api/')) {
    const allowedMethods = ['GET', 'POST', 'OPTIONS']
    if (!allowedMethods.includes(req.method)) {
      return NextResponse.json(
        { error: 'Método no permitido' },
        { status: 405, headers: { Allow: allowedMethods.join(', ') } }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/(.*)',
  ],
}
