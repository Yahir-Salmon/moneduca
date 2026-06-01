'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Modulo {
  id: string
  nombre: string
  descripcion: string
  orden: number
  icono: string
}

interface Unidad {
  id: string
  modulo_id: string
  nombre: string
  orden: number
  descripcion: string
}

interface Progreso {
  unidad_id: string
  completada: boolean
  ultimo_puntaje: number
}

export default function DashboardPage() {
  const [nombre, setNombre] = useState('')
  const [loading, setLoading] = useState(true)
  const [modulos, setModulos] = useState<Modulo[]>([])
  const [unidades, setUnidades] = useState<Unidad[]>([])
  const [progreso, setProgreso] = useState<Progreso[]>([])
  const [moduloAbierto, setModuloAbierto] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/registro'); return }

      const n = user.user_metadata?.nombre || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Estudiante'
      setNombre(n)

      const { data: profile } = await supabase.from('profiles').select('nombre').eq('id', user.id).single()
      if (profile?.nombre) setNombre(profile.nombre)
      if (!profile) await supabase.from('profiles').upsert({ id: user.id, nombre: n })

      const [{ data: mods }, { data: unis }, { data: prog }] = await Promise.all([
        supabase.from('modulos').select('*').order('orden'),
        supabase.from('unidades').select('*').order('orden'),
        supabase.from('progreso_unidad').select('unidad_id, completada, ultimo_puntaje').eq('user_id', user.id),
      ])

      setModulos(mods || [])
      setUnidades(unis || [])
      setProgreso(prog || [])
      if (mods && mods.length > 0) setModuloAbierto(mods[0].id)
      setLoading(false)
    }
    init()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const getProgresoModulo = (moduloId: string) => {
    const unidadesModulo = unidades.filter(u => u.modulo_id === moduloId)
    const completadas = unidadesModulo.filter(u => progreso.find(p => p.unidad_id === u.id && p.completada))
    return { total: unidadesModulo.length, completadas: completadas.length }
  }

  const getProgresoUnidad = (unidadId: string) => progreso.find(p => p.unidad_id === unidadId)

  const totalCompletadas = progreso.filter(p => p.completada).length
  const totalUnidades = unidades.length

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FFF8E8', gap: 16 }}>
      <img src="/monedoki-neutral.png" alt="Monedoki" style={{ width: 80 }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
      <p style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 20, color: '#6B4520' }}>Cargando... 🦊</p>
    </div>
  )

  return (
    <>
      <style>{`
        .dash-wrap { min-height: 100vh; background: #FFF8E8; padding-top: 68px; }
        .dash-header { background: #FFFDF5; border-bottom: 1px solid #E8D9B8; padding: 28px 0; }
        .dash-header-inner { max-width: 1100px; margin: 0 auto; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; }
        .dash-welcome { font-family: 'Fredoka',sans-serif; font-size: 26px; font-weight: 600; color: #3D2A0E; }
        .dash-welcome span { color: #C8934A; }
        .dash-sub { font-family: 'Nunito',sans-serif; font-size: 14px; color: #8C6D45; margin-top: 4px; }
        .logout-btn { background: none; border: 1.5px solid #E8D9B8; border-radius: 100px; padding: 8px 18px; font-family: 'Nunito',sans-serif; font-size: 14px; color: #8C6D45; cursor: pointer; transition: all 0.2s; }
        .logout-btn:hover { border-color: #C8934A; color: #6B4520; }
        .dash-body { max-width: 1100px; margin: 0 auto; padding: 40px 24px; display: grid; grid-template-columns: 320px 1fr; gap: 32px; }
        /* Stats */
        .stats-col { display: flex; flex-direction: column; gap: 16px; }
        .stat-card { background: #FFFDF5; border-radius: 20px; border: 1px solid #E8D9B8; padding: 20px 24px; }
        .stat-big { font-family: 'Fredoka',sans-serif; font-size: 36px; font-weight: 600; color: #3D2A0E; line-height: 1; margin-bottom: 6px; }
        .stat-lbl { font-family: 'Nunito',sans-serif; font-size: 14px; color: #8C6D45; }
        .monedoki-card { background: rgba(250,191,77,0.15); border-radius: 20px; border: 1px solid rgba(250,191,77,0.4); padding: 20px; display: flex; align-items: center; gap: 16px; }
        .monedoki-msg { font-family: 'Nunito',sans-serif; font-size: 14px; color: #6B4520; line-height: 1.6; }
        .monedoki-msg strong { font-family: 'Fredoka',sans-serif; font-size: 16px; display: block; margin-bottom: 4px; color: #3D2A0E; }
        /* Módulos */
        .modulos-col { display: flex; flex-direction: column; gap: 16px; }
        .modulo-card { background: #FFFDF5; border-radius: 20px; border: 1px solid #E8D9B8; overflow: hidden; transition: all 0.2s; }
        .modulo-header { padding: 20px 24px; display: flex; align-items: center; gap: 16px; cursor: pointer; }
        .modulo-header:hover { background: rgba(252,230,139,0.1); }
        .modulo-icon { width: 48px; height: 48px; border-radius: 14px; background: rgba(252,230,139,0.5); display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; }
        .modulo-titulo { font-family: 'Fredoka',sans-serif; font-size: 17px; font-weight: 600; color: #3D2A0E; }
        .modulo-prog-info { font-family: 'Nunito',sans-serif; font-size: 13px; color: #A87840; margin-top: 4px; }
        .modulo-prog-bar { height: 6px; background: rgba(232,217,184,0.5); border-radius: 100px; overflow: hidden; margin-top: 8px; }
        .modulo-prog-fill { height: 100%; background: rgba(250,191,77,1); border-radius: 100px; transition: width 0.5s ease; }
        .modulo-chevron { margin-left: auto; font-size: 18px; color: #A87840; transition: transform 0.2s; }
        .modulo-chevron.open { transform: rotate(180deg); }
        .unidades-list { border-top: 1px solid #E8D9B8; }
        .unidad-row { padding: 16px 24px 16px 36px; display: flex; align-items: center; gap: 14px; border-bottom: 1px solid rgba(232,217,184,0.3); text-decoration: none; transition: background 0.15s; }
        .unidad-row:hover { background: rgba(252,230,139,0.1); }
        .unidad-row:last-child { border-bottom: none; }
        .unidad-check { width: 28px; height: 28px; border-radius: 50%; border: 2px solid #E8D9B8; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 14px; }
        .unidad-check.done { background: #6B4520; border-color: #6B4520; color: #FCE68B; }
        .unidad-nombre { font-family: 'Nunito',sans-serif; font-size: 15px; color: #3D2A0E; font-weight: 600; flex: 1; }
        .unidad-desc { font-family: 'Nunito',sans-serif; font-size: 12px; color: #A87840; }
        .unidad-puntaje { font-family: 'Fredoka',sans-serif; font-size: 14px; color: #C8934A; margin-left: auto; white-space: nowrap; }
        .empezar-badge { background: #6B4520; color: #FCE68B; font-family: 'Fredoka',sans-serif; font-size: 13px; padding: 4px 12px; border-radius: 100px; margin-left: auto; white-space: nowrap; }
        @media (max-width: 768px) {
          .dash-body { grid-template-columns: 1fr; }
          .dash-header-inner { flex-direction: column; gap: 12px; align-items: flex-start; }
        }
      `}</style>

      <div className="dash-wrap">
        <div className="dash-header">
          <div className="dash-header-inner">
            <div>
              <div className="dash-welcome">¡Hola, <span>{nombre}</span>! 👋</div>
              <div className="dash-sub">Elige una unidad para continuar aprendiendo</div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>Cerrar sesión</button>
          </div>
        </div>

        <div className="dash-body">
          {/* Columna izquierda: stats */}
          <div className="stats-col">
            <div className="monedoki-card">
              <img src="/monedoki-neutral.png" alt="Monedoki" style={{ width: 56, flexShrink: 0 }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
              <div className="monedoki-msg">
                <strong>¡Sigue así!</strong>
                {totalCompletadas === 0
                  ? 'Empieza tu primera unidad. ¡Monedoki te acompaña!'
                  : `Llevas ${totalCompletadas} unidades completadas. ¡Vas muy bien!`}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-big">{totalCompletadas}/{totalUnidades}</div>
              <div className="stat-lbl">Unidades completadas</div>
              <div style={{ height: 8, background: 'rgba(232,217,184,0.5)', borderRadius: 100, overflow: 'hidden', marginTop: 12 }}>
                <div style={{ height: '100%', background: '#6B4520', borderRadius: 100, width: `${totalUnidades > 0 ? (totalCompletadas / totalUnidades) * 100 : 0}%`, transition: 'width 0.5s' }} />
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-big">{modulos.length}</div>
              <div className="stat-lbl">Módulos disponibles</div>
            </div>
          </div>

          {/* Columna derecha: módulos */}
          <div className="modulos-col">
            {modulos.map(modulo => {
              const { total, completadas } = getProgresoModulo(modulo.id)
              const pct = total > 0 ? (completadas / total) * 100 : 0
              const abierto = moduloAbierto === modulo.id
              const unidadesModulo = unidades.filter(u => u.modulo_id === modulo.id)

              return (
                <div key={modulo.id} className="modulo-card">
                  <div className="modulo-header" onClick={() => setModuloAbierto(abierto ? null : modulo.id)}>
                    <div className="modulo-icon">{modulo.icono}</div>
                    <div style={{ flex: 1 }}>
                      <div className="modulo-titulo">{modulo.nombre}</div>
                      <div className="modulo-prog-info">{completadas}/{total} unidades completadas</div>
                      <div className="modulo-prog-bar">
                        <div className="modulo-prog-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <span className={`modulo-chevron ${abierto ? 'open' : ''}`}>▾</span>
                  </div>

                  {abierto && (
                    <div className="unidades-list">
                      {unidadesModulo.map(unidad => {
                        const prog = getProgresoUnidad(unidad.id)
                        const completada = prog?.completada
                        return (
                          <Link
                            key={unidad.id}
                            href={`/aprender/${modulo.id}/${unidad.id}`}
                            className="unidad-row"
                          >
                            <div className={`unidad-check ${completada ? 'done' : ''}`}>
                              {completada ? '✓' : unidad.orden}
                            </div>
                            <div>
                              <div className="unidad-nombre">{unidad.nombre}</div>
                              <div className="unidad-desc">{unidad.descripcion}</div>
                            </div>
                            {completada
                              ? <div className="unidad-puntaje">⭐ {prog?.ultimo_puntaje}%</div>
                              : <div className="empezar-badge">Empezar →</div>
                            }
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
