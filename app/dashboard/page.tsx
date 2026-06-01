'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const modulos = [
  { id: 'ahorro', emoji: '🏦', titulo: 'Ahorro inteligente', lecciones: 4, color: 'rgba(252,230,139,0.5)', accent: '#C8934A' },
  { id: 'presupuesto', emoji: '📊', titulo: 'Tu primer presupuesto', lecciones: 5, color: 'rgba(250,191,77,0.25)', accent: '#6B4520' },
  { id: 'deuda', emoji: '💳', titulo: 'Deudas y crédito', lecciones: 5, color: 'rgba(145,99,47,0.1)', accent: '#8C6D45' },
  { id: 'inversion', emoji: '📈', titulo: 'Introducción a invertir', lecciones: 6, color: 'rgba(252,230,139,0.4)', accent: '#C8934A' },
  { id: 'metas', emoji: '🎯', titulo: 'Metas financieras', lecciones: 4, color: 'rgba(145,99,47,0.15)', accent: '#6B4520' },
]

export default function DashboardPage() {
  const [user, setUser] = useState<{ email?: string; user_metadata?: { nombre?: string } } | null>(null)
  const [nombre, setNombre] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/registro'); return }
      setUser(user)

      const { data: profile } = await supabase.from('profiles').select('nombre').eq('id', user.id).single()
      const nombreDetectado = profile?.nombre || user.user_metadata?.nombre || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Estudiante'
      setNombre(nombreDetectado)
      if (!profile && (user.user_metadata?.full_name || user.user_metadata?.name)) {
        await supabase.from('profiles').upsert({ id: user.id, nombre: user.user_metadata.full_name || user.user_metadata.name })
      }
      setLoading(false)
    }
    getUser()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF8E8' }}>
      <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 20, color: '#8C6D45' }}>Cargando... 🦊</div>
    </div>
  )

  return (
    <>
      <style>{`
        .dash-wrap { min-height: 100vh; background: #FFF8E8; padding-top: 68px; }
        .dash-header { background: #FFFDF5; border-bottom: 1px solid #E8D9B8; padding: 32px 0; }
        .dash-header-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; }
        .dash-welcome { font-family: 'Fredoka',sans-serif; font-size: 28px; font-weight: 600; color: #3D2A0E; }
        .dash-welcome span { color: #C8934A; }
        .dash-sub { font-family: 'Nunito',sans-serif; font-size: 15px; color: #8C6D45; margin-top: 4px; }
        .logout-btn { background: none; border: 1.5px solid #E8D9B8; border-radius: 100px; padding: 8px 18px; font-family: 'Nunito',sans-serif; font-size: 14px; color: #8C6D45; cursor: pointer; transition: all 0.2s; }
        .logout-btn:hover { border-color: #C8934A; color: #6B4520; }
        .dash-body { max-width: 1200px; margin: 0 auto; padding: 48px 24px; }
        /* Stats */
        .dash-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 48px; }
        .stat-card { background: #FFFDF5; border-radius: 20px; border: 1px solid #E8D9B8; padding: 24px; text-align: center; }
        .stat-big { font-family: 'Fredoka',sans-serif; font-size: 40px; font-weight: 600; color: #3D2A0E; line-height: 1; margin-bottom: 8px; }
        .stat-lbl { font-family: 'Nunito',sans-serif; font-size: 14px; color: #8C6D45; }
        /* Módulos */
        .dash-section-title { font-family: 'Fredoka',sans-serif; font-size: 22px; font-weight: 600; color: #3D2A0E; margin-bottom: 20px; }
        .modulos-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .modulo-card { background: #FFFDF5; border-radius: 20px; border: 1px solid #E8D9B8; padding: 24px; transition: all 0.3s; display: block; color: inherit; }
        .modulo-card:hover { transform: translateY(-4px); box-shadow: 4px 4px 0px rgba(145,99,47,0.15); border-color: rgba(250,191,77,0.5); }
        .modulo-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 14px; }
        .modulo-titulo { font-family: 'Fredoka',sans-serif; font-size: 17px; font-weight: 600; color: #3D2A0E; margin-bottom: 8px; }
        .modulo-info { font-family: 'Nunito',sans-serif; font-size: 13px; color: #A87840; margin-bottom: 14px; }
        .modulo-prog-bar { height: 8px; background: rgba(232,217,184,0.5); border-radius: 100px; overflow: hidden; margin-bottom: 8px; }
        .modulo-prog-fill { height: 100%; background: rgba(250,191,77,1); border-radius: 100px; width: 0%; }
        .modulo-prog-label { font-family: 'Nunito',sans-serif; font-size: 12px; color: #A87840; }
        .start-btn { display: inline-flex; align-items: center; gap: 6px; margin-top: 14px; font-family: 'Fredoka',sans-serif; font-size: 14px; font-weight: 600; color: #C8934A; }
        /* Monedoki motivacional */
        .monedoki-card { background: rgba(250,191,77,0.15); border-radius: 20px; border: 1px solid rgba(250,191,77,0.4); padding: 24px; display: flex; align-items: center; gap: 20px; margin-bottom: 48px; }
        .monedoki-msg { font-family: 'Nunito',sans-serif; font-size: 16px; color: #6B4520; line-height: 1.6; }
        .monedoki-msg strong { font-family: 'Fredoka',sans-serif; font-size: 18px; display: block; margin-bottom: 4px; color: #3D2A0E; }
        @media (max-width: 768px) {
          .dash-stats { grid-template-columns: 1fr 1fr; }
          .modulos-grid { grid-template-columns: 1fr; }
          .dash-header-inner { flex-direction: column; gap: 16px; align-items: flex-start; }
        }
      `}</style>

      <div className="dash-wrap">
        <div className="dash-header">
          <div className="dash-header-inner">
            <div>
              <div className="dash-welcome">¡Hola, <span>{nombre}</span>! 👋</div>
              <div className="dash-sub">¿Listo para aprender algo nuevo hoy?</div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>Cerrar sesión</button>
          </div>
        </div>

        <div className="dash-body">
          {/* Stats */}
          <div className="dash-stats">
            <div className="stat-card">
              <div className="stat-big">0</div>
              <div className="stat-lbl">Lecciones completadas</div>
            </div>
            <div className="stat-card">
              <div className="stat-big">0</div>
              <div className="stat-lbl">Días seguidos</div>
            </div>
            <div className="stat-card">
              <div className="stat-big">5</div>
              <div className="stat-lbl">Módulos disponibles</div>
            </div>
          </div>

          {/* Monedoki */}
          <div className="monedoki-card">
            <span style={{ fontSize: 48 }}>🦊</span>
            <div className="monedoki-msg">
              <strong>¡Monedoki te da la bienvenida!</strong>
              Elige un módulo para empezar tu aventura financiera. ¡Cada lección te acerca más a dominar tu dinero!
            </div>
          </div>

          {/* Módulos */}
          <div className="dash-section-title">Tus módulos</div>
          <div className="modulos-grid">
            {modulos.map(m => (
              <Link key={m.id} href={`/cursos/${m.id}`} className="modulo-card">
                <div className="modulo-icon" style={{ background: m.color }}>{m.emoji}</div>
                <div className="modulo-titulo">{m.titulo}</div>
                <div className="modulo-info">📖 {m.lecciones} lecciones</div>
                <div className="modulo-prog-bar">
                  <div className="modulo-prog-fill" />
                </div>
                <div className="modulo-prog-label">0% completado</div>
                <div className="start-btn">Empezar →</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
