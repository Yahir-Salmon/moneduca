/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Evita que el sitio se embeba en iframes de otros dominios (clickjacking)
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Impide que el navegador adivine el tipo de contenido (MIME sniffing)
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Controla qué información de referrer se comparte
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Fuerza HTTPS por 1 año (incluye subdominios)
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          // Desactiva funcionalidades del navegador que no se usan
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // Content Security Policy: restringe de dónde se puede cargar contenido
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Scripts: solo el propio dominio + inline/eval para Next.js
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              // Estilos: solo el propio dominio + inline (necesario para styled-components/CSS-in-JS)
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Fuentes
              "font-src 'self' https://fonts.gstatic.com",
              // Imágenes: propio dominio + data URIs + Supabase Storage
              `img-src 'self' data: blob: https://*.supabase.co`,
              // APIs externas permitidas
              [
                "connect-src 'self'",
                process.env.NEXT_PUBLIC_SUPABASE_URL,
                'https://api.groq.com',
                'https://api.resend.com',
                'wss://*.supabase.co',
              ].filter(Boolean).join(' '),
              // Frames: solo Supabase Auth
              "frame-src 'self' https://*.supabase.co",
              // Base URI: solo el propio dominio
              "base-uri 'self'",
              // Form action: solo el propio dominio
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
      // Headers para archivos estáticos (caché más largo)
      {
        source: '/(.*)\\.(ico|png|jpg|jpeg|svg|webp|woff|woff2)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },

  // Limitar el tamaño máximo del cuerpo de las peticiones a las API routes
  experimental: {
    serverActions: {
      bodySizeLimit: '1mb',
    },
  },
}

module.exports = nextConfig
