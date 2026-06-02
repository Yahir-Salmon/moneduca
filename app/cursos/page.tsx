'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Modulo { id: string; nombre: string; descripcion: string; orden: number; icono: string }
interface Unidad { id: string; modulo_id: string; nombre: string; orden: number; descripcion: string }
interface Progreso { unidad_id: string; completada: boolean }

export default function CursosPage() {
  const [modulos, setModulos] = useState<Modulo[]>([])
  const [unidades, setUnidades] = useState<Unidad[]>([])
  const [progreso, setProgreso] = useState<Progreso[]>([])
  const [session, setSession] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(!!session)
      const [{ data: mods }, { data: unis }] = await Promise.all([
        supabase.from('modulos').select('*').order('orden'),
        supabase.from('unidades').select('*').order('orden'),
      ])
      setModulos(mods || [])
      setUnidades(unis || [])
      if (session?.user) {
        const { data: prog } = await supabase.from('progreso_unidad').select('unidad_id, completada').eq('user_id', session.user.id)
        setProgreso(prog || [])
      }
      setLoading(false)
    }
    init()
  }, [])

  const isUnlocked = (unidad: Unidad) => {
    if (!session) return false
    if (unidad.orden === 1) return true
    const unidadesModulo = unidades.filter(u => u.modulo_id === unidad.modulo_id).sort((a, b) => a.orden - b.orden)
    const anterior = unidadesModulo.find(u => u.orden === unidad.orden - 1)
    if (!anterior) return true
    return !!progreso.find(p => p.unidad_id === anterior.id && p.completada)
  }

  const handleEmpezar = (moduloId: string, unidadId: string, desbloqueada: boolean) => {
    if (!session) { router.push('/registro'); return }
    if (!desbloqueada) return
    router.push(`/aprender/${moduloId}/${unidadId}`)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF8E8' }}>
      <p style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 20, color: '#6B4520' }}>Cargando cursos... 🦊</p>
    </div>
  )

  return (
    <>
      <style>{`
        .cursos-hero { padding: 140px 0 64px; background: #FFF8E8; text-align: center; }
        .cursos-h1 { font-size: clamp(32px,5vw,54px); font-weight: 700; color: #3D2A0E; margin-bottom: 14px; }
        .cursos-desc { font-size: 17px; color: #8C6D45; max-width: 500px; margin: 0 auto; font-family: 'Nunito',sans-serif; }
        .cursos-body { max-width: 1100px; margin: 0 auto; padding: 64px 24px; display: flex; flex-direction: column; gap: 48px; }
        .modulo-section { background: #FFFDF5; border-radius: 24px; border: 1px solid #E8D9B8; overflow: hidden; }
        .modulo-section-header { padding: 28px 32px; background: #3D2A0E; display: flex; align-items: center; gap: 16px; }
        .mod-icon-big { width: 52px; height: 52px; background: rgba(250,191,77,0.2); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 26px; flex-shrink: 0; }
        .mod-nombre { font-family: 'Fredoka',sans-serif; font-size: 20px; font-weight: 600; color: #FCE68B; }
        .mod-desc { font-family: 'Nunito',sans-serif; font-size: 14px; color: rgba(252,230,139,0.6); margin-top: 4px; }
        .unidades-grid { display: grid; grid-template-columns: repeat(2, 1fr); }
        .unidad-card { padding: 24px 28px; border-right: 1px solid #E8D9B8; border-bottom: 1px solid #E8D9B8; display: flex; flex-direction: column; gap: 8px; }
        .unidad-card:nth-child(even) { border-right: none; }
        .unidad-card.bloqueada { opacity: 0.5; }
        .unidad-orden { font-family: 'Nunito',sans-serif; font-size: 12px; color: #A87840; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
        .unidad-nombre { font-family: 'Fredoka',sans-serif; font-size: 17px; font-weight: 600; color: #3D2A0E; }
        .unidad-desc { font-family: 'Nunito',sans-serif; font-size: 13px; color: #8C6D45; flex: 1; }
        .empezar-btn { display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px; border-radius: 100px; border: none; font-family: 'Fredoka',sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; width: fit-content; margin-top: 6px; }
        .empezar-btn.activo { background: #6B4520; color: #FCE68B; }
        .empezar-btn.activo:hover { background: #3D2A0E; transform: translateY(-1px); }
        .empezar-btn.bloqueado { background: #E8D9B8; color: #A87840; cursor: not-allowed; }
        .empezar-btn.sin-sesion { background: rgba(252,230,139,0.5); color: #6B4520; }
        @media (max-width: 600px) { .unidades-grid { grid-template-columns: 1fr; } .unidad-card { border-right: none; } }
      `}</style>

      <div className="cursos-hero">
        <div className="container-md">
          <span className="tag-deco">Biblioteca de cursos</span>
          <h1 className="cursos-h1">Todo lo que necesitas<br />para manejar tu dinero</h1>
          <p className="cursos-desc">{modulos.length} módulos, {unidades.length} unidades. Aprende a tu ritmo.</p>
        </div>
      </div>

      <div className="cursos-body">
        {modulos.map((modulo, mi) => {
          const unidadesModulo = unidades.filter(u => u.modulo_id === modulo.id).sort((a, b) => a.orden - b.orden)
          return (
            <div key={modulo.id} className="modulo-section">
              <div className="modulo-section-header">
                <div className="mod-icon-big">{modulo.icono}</div>
                <div>
                  <div className="mod-nombre">Módulo {mi + 1}: {modulo.nombre}</div>
                  <div className="mod-desc">{modulo.descripcion}</div>
                </div>
              </div>
              <div className="unidades-grid">
                {unidadesModulo.map(unidad => {
                  const desbloqueada = isUnlocked(unidad)
                  return (
                    <div key={unidad.id} className={`unidad-card ${!session || !desbloqueada ? 'bloqueada' : ''}`}>
                      <div className="unidad-orden">Unidad {unidad.orden}</div>
                      <div className="unidad-nombre">{unidad.nombre}</div>
                      <div className="unidad-desc">{unidad.descripcion}</div>
                      {!session ? (
                        <button className="empezar-btn sin-sesion" onClick={() => router.push('/registro')}>
                          Inicia sesión para empezar →
                        </button>
                      ) : !desbloqueada ? (
                        <button className="empezar-btn bloqueado" disabled>🔒 Completa la anterior</button>
                      ) : (
                        <button className="empezar-btn activo" onClick={() => handleEmpezar(modulo.id, unidad.id, true)}>
                          Empezar →
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
