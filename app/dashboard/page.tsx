'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Modulo { id: string; nombre: string; descripcion: string; orden: number; icono: string }
interface Unidad { id: string; modulo_id: string; nombre: string; orden: number; descripcion: string }
interface Progreso { unidad_id: string; completada: boolean; ultimo_puntaje: number }

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

  const getProgresoModulo = (moduloId: string) => {
    const unis = unidades.filter(u => u.modulo_id === moduloId)
    const completadas = unis.filter(u => progreso.find(p => p.unidad_id === u.id && p.completada))
    return { total: unis.length, completadas: completadas.length, pct: unis.length > 0 ? (completadas.length / unis.length) * 100 : 0 }
  }

  const getProgresoUnidad = (unidadId: string) => progreso.find(p => p.unidad_id === unidadId)

  // Determina si una unidad está desbloqueada
  const isUnlocked = (unidad: Unidad) => {
    if (unidad.orden === 1) return true
    const unidadesModulo = unidades.filter(u => u.modulo_id === unidad.modulo_id).sort((a, b) => a.orden - b.orden)
    const anterior = unidadesModulo.find(u => u.orden === unidad.orden - 1)
    if (!anterior) return true
    return !!progreso.find(p => p.unidad_id === anterior.id && p.completada)
  }

  const totalCompletadas = progreso.filter(p => p.completada).length
  const totalUnidades = unidades.length

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FFF8E8', gap: 16 }}>
      <img src="/monedoki-neutral.png" alt="" style={{ width: 80 }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
      <p style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 20, color: '#6B4520' }}>Cargando... 🦊</p>
    </div>
  )

  return (
    <>
      <style>{`
        .dash-wrap { min-height: 100vh; background: #FFF8E8; padding-top: 68px; }
        .dash-header { background: #FFFDF5; border-bottom: 1px solid #E8D9B8; padding: 28px 0; }
        .dash-header-inner { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
        .dash-welcome { font-family: 'Fredoka',sans-serif; font-size: 26px; font-weight: 600; color: #3D2A0E; }
        .dash-welcome span { color: #C8934A; }
        .dash-sub { font-family: 'Nunito',sans-serif; font-size: 14px; color: #8C6D45; margin-top: 4px; }
        .dash-body { max-width: 1100px; margin: 0 auto; padding: 40px 24px; display: grid; grid-template-columns: 300px 1fr; gap: 32px; }
        .stats-col { display: flex; flex-direction: column; gap: 16px; }
        .stat-card { background: #FFFDF5; border-radius: 20px; border: 1px solid #E8D9B8; padding: 20px 24px; }
        .stat-big { font-family: 'Fredoka',sans-serif; font-size: 36px; color: #3D2A0E; line-height: 1; margin-bottom: 6px; }
        .stat-lbl { font-family: 'Nunito',sans-serif; font-size: 14px; color: #8C6D45; }
        .mk-card { background: rgba(250,191,77,0.15); border-radius: 20px; border: 1px solid rgba(250,191,77,0.4); padding: 20px; display: flex; align-items: center; gap: 14px; }
        .mk-msg { font-family: 'Nunito',sans-serif; font-size: 14px; color: #6B4520; line-height: 1.6; }
        .mk-msg strong { font-family: 'Fredoka',sans-serif; font-size: 16px; display: block; margin-bottom: 4px; color: #3D2A0E; }
        .modulos-col { display: flex; flex-direction: column; gap: 16px; }
        .modulo-card { background: #FFFDF5; border-radius: 20px; border: 1px solid #E8D9B8; overflow: hidden; }
        .modulo-header { padding: 18px 22px; display: flex; align-items: center; gap: 14px; cursor: pointer; transition: background 0.15s; }
        .modulo-header:hover { background: rgba(252,230,139,0.1); }
        .modulo-icon { width: 46px; height: 46px; border-radius: 14px; background: rgba(252,230,139,0.5); display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
        .modulo-titulo { font-family: 'Fredoka',sans-serif; font-size: 16px; font-weight: 600; color: #3D2A0E; }
        .modulo-info { font-family: 'Nunito',sans-serif; font-size: 12px; color: #A87840; margin-top: 3px; }
        .mod-prog-bar { height: 5px; background: rgba(232,217,184,0.5); border-radius: 100px; overflow: hidden; margin-top: 7px; }
        .mod-prog-fill { height: 100%; background: rgba(250,191,77,1); border-radius: 100px; transition: width 0.5s; }
        .chevron { margin-left: auto; font-size: 16px; color: #A87840; transition: transform 0.2s; flex-shrink: 0; }
        .chevron.open { transform: rotate(180deg); }
        .unidades-list { border-top: 1px solid #E8D9B8; }
        .unidad-row { padding: 14px 22px 14px 32px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid rgba(232,217,184,0.3); text-decoration: none; transition: background 0.15s; }
        .unidad-row:last-child { border-bottom: none; }
        .unidad-row.activa:hover { background: rgba(252,230,139,0.1); }
        .unidad-row.bloqueada { opacity: 0.45; cursor: not-allowed; }
        .u-check { width: 26px; height: 26px; border-radius: 50%; border: 2px solid #E8D9B8; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 13px; }
        .u-check.done { background: #6B4520; border-color: #6B4520; color: #FCE68B; }
        .u-check.lock { background: #F4EDE0; border-color: #E8D9B8; color: #C8934A; }
        .u-nombre { font-family: 'Nunito',sans-serif; font-size: 14px; color: #3D2A0E; font-weight: 600; flex: 1; }
        .u-desc { font-family: 'Nunito',sans-serif; font-size: 12px; color: #A87840; }
        .u-badge { font-family: 'Fredoka',sans-serif; font-size: 13px; padding: 4px 12px; border-radius: 100px; margin-left: auto; white-space: nowrap; flex-shrink: 0; }
        .u-badge.emp { background: #6B4520; color: #FCE68B; }
        .u-badge.pun { color: #C8934A; }
        .u-badge.blk { color: #C8934A; }
        @media (max-width: 768px) { .dash-body { grid-template-columns: 1fr; } }
      `}</style>

      <div className="dash-wrap">
        <div className="dash-header">
          <div className="dash-header-inner">
            <div className="dash-welcome">¡Hola, <span>{nombre}</span>! 👋</div>
            <div className="dash-sub">Elige una unidad para continuar aprendiendo</div>
          </div>
        </div>

        <div className="dash-body">
          <div className="stats-col">
            <div className="mk-card">
              <img src="/monedoki-neutral.png" alt="" style={{ width: 52, flexShrink: 0 }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
              <div className="mk-msg">
                <strong>{totalCompletadas === 0 ? '¡Empecemos!' : '¡Sigue así!'}</strong>
                {totalCompletadas === 0 ? 'Inicia tu primera unidad. ¡Monedoki te acompaña!' : `Llevas ${totalCompletadas} unidades. ¡Vas muy bien!`}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-big">{totalCompletadas}/{totalUnidades}</div>
              <div className="stat-lbl">Unidades completadas</div>
              <div style={{ height: 8, background: 'rgba(232,217,184,0.4)', borderRadius: 100, overflow: 'hidden', marginTop: 12 }}>
                <div style={{ height: '100%', background: '#6B4520', borderRadius: 100, width: `${totalUnidades > 0 ? (totalCompletadas / totalUnidades) * 100 : 0}%`, transition: 'width 0.5s' }} />
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-big">{modulos.length}</div>
              <div className="stat-lbl">Módulos disponibles</div>
            </div>
          </div>

          <div className="modulos-col">
            {modulos.map(modulo => {
              const { total, completadas, pct } = getProgresoModulo(modulo.id)
              const abierto = moduloAbierto === modulo.id
              const unidadesModulo = unidades.filter(u => u.modulo_id === modulo.id).sort((a, b) => a.orden - b.orden)
              return (
                <div key={modulo.id} className="modulo-card">
                  <div className="modulo-header" onClick={() => setModuloAbierto(abierto ? null : modulo.id)}>
                    <div className="modulo-icon">{modulo.icono}</div>
                    <div style={{ flex: 1 }}>
                      <div className="modulo-titulo">{modulo.nombre}</div>
                      <div className="modulo-info">{completadas}/{total} unidades completadas</div>
                      <div className="mod-prog-bar"><div className="mod-prog-fill" style={{ width: `${pct}%` }} /></div>
                    </div>
                    <span className={`chevron ${abierto ? 'open' : ''}`}>▾</span>
                  </div>

                  {abierto && (
                    <div className="unidades-list">
                      {unidadesModulo.map(unidad => {
                        const prog = getProgresoUnidad(unidad.id)
                        const completada = prog?.completada
                        const desbloqueada = isUnlocked(unidad)

                        if (!desbloqueada) return (
                          <div key={unidad.id} className="unidad-row bloqueada">
                            <div className="u-check lock">🔒</div>
                            <div><div className="u-nombre">{unidad.nombre}</div><div className="u-desc">Completa la unidad anterior</div></div>
                            <span className="u-badge blk">Bloqueada</span>
                          </div>
                        )

                        return (
                          <Link key={unidad.id} href={`/aprender/${modulo.id}/${unidad.id}`} className="unidad-row activa">
                            <div className={`u-check ${completada ? 'done' : ''}`}>{completada ? '✓' : unidad.orden}</div>
                            <div><div className="u-nombre">{unidad.nombre}</div><div className="u-desc">{unidad.descripcion}</div></div>
                            {completada
                              ? <span className="u-badge pun">⭐ {prog?.ultimo_puntaje}%</span>
                              : <span className="u-badge emp">Empezar →</span>
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
