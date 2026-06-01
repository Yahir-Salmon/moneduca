'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        router.push('/registro?error=callback')
        return
      }

      if (data.session) {
        router.push('/dashboard')
      } else {
        // Escuchar cambio de estado de auth (cuando llega el token del link)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' && session) {
            subscription.unsubscribe()
            router.push('/dashboard')
          }
        })
      }
    }

    handleCallback()
  }, [router])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', background: '#FFF8E8', gap: 16
    }}>
      <span style={{ fontSize: 64 }}>🦊</span>
      <p style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 22, color: '#3D2A0E' }}>
        Verificando tu cuenta...
      </p>
      <p style={{ fontFamily: "'Nunito',sans-serif", fontSize: 15, color: '#8C6D45' }}>
        En un momento te llevamos a tu dashboard
      </p>
    </div>
  )
}
