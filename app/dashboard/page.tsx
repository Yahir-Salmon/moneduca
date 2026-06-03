'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Modulo { id: string; nombre: string; descripcion: string; orden: number; icono: string }
interface Unidad { id: string; modulo_id: string; nombre: string; orden: number; descripcion: string }
interface Progreso { unidad_id: string; completada: boolean; ultimo_puntaje: number; modulo_id: string }

const COLORES_MODULO = [
  { bg: '#6B4520', light: 'rgba(252,230,139,0.3)', accent: '#FCE68B' },
  { bg: '#8B5A2B', light: 'rgba(250,191,77,0.2)', accent: '#FCE68B' },
  { bg: '#5C3317', light: 'rgba(252,230,139,0.2)', accent: '#FCE68B' },
  { bg: '#7A4A1E', light: 'rgba(250,191,77,0.25)', accent: '#FCE68B' },
  { bg: '#4A2E10', light: 'rgba(252,230,139,0.15)', accent: '#FCE68B' },
  { bg: '#9C6B3C', light: 'rgba(250,191,77,0.3)', accent: '#FCE68B' },
]

export default function DashboardPage() {
  const [nombre, setNombre] = useState('')
  const [loading, setLoading] = useState(true)
  const [modulos, setModulos] = useState<Modulo[]>([])
  const [unidades, setUnidades] = useState<Unidad[]>([])
  const [progreso, setProgreso] = useState<Progreso[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [racha, setRacha] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/registro'); return }
      setUserId(user.id)
      const n = user.user_metadata?.nombre || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Estudiante'
      const { data: profile } = await supabase.from('profiles').select('nombre, racha').eq('id', user.id).single()
      setNombre(profile?.nombre || n)
      setRacha(profile?.racha || 0)
      const [{ data: mods }, { data: unis }, { data: prog }] = await Promise.all([
        supabase.from('modulos').select('*').order('orden'),
        supabase.from('unidades').select('*').order('orden'),
        supabase.from('progreso_unidad').select('unidad_id, completada, ultimo_puntaje, modulo_id').eq('user_id', user.id),
      ])
      setModulos(mods || [])
      setUnidades(unis || [])
      setProgreso(prog || [])
      setLoading(false)
    }
    init()
  }, [router])

  const isUnlocked = (unidad: Unidad) => {
    if (unidad.orden === 1) return true
    const unidadesModulo = unidades.filter(u => u.modulo_id === unidad.modulo_id).sort((a, b) => a.orden - b.orden)
    const anterior = unidadesModulo.find(u => u.orden === unidad.orden - 1)
    if (!anterior) return true
    return !!progreso.find(p => p.unidad_id === anterior.id && p.completada)
  }

  const isModuloCompleto = (moduloId: string) => {
    const unis = unidades.filter(u => u.modulo_id === moduloId)
    return unis.length > 0 && unis.every(u => progreso.find(p => p.unidad_id === u.id && p.completada))
  }

  const getProgresoUnidad = (unidadId: string) => progreso.find(p => p.unidad_id === unidadId)
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
        /* Header */
        .dash-top { background: #FFFDF5; border-bottom: 1px solid #E8D9B8; padding: 20px 0; }
        .dash-top-inner { max-width: 700px; margin: 0 auto; padding: 0 24px; display: flex; align-items: center; justify-content: space-between; }
        .dash-welcome { font-family: 'Fredoka',sans-serif; font-size: 22px; color: #3D2A0E; }
        .dash-welcome span { color: #C8934A; }
        .dash-stats-row { display: flex; align-items: center; gap: 16px; }
        .dash-stat-pill { display: flex; align-items: center; gap: 6px; background: rgba(252,230,139,0.4); padding: 6px 14px; border-radius: 100px; font-family: 'Fredoka',sans-serif; font-size: 14px; color: #6B4520; }
        .profile-link { display: flex; align-items: center; gap: 6px; background: #6B4520; color: #FCE68B; padding: 8px 16px; border-radius: 100px; font-family: 'Fredoka',sans-serif; font-size: 14px; text-decoration: none; transition: all 0.2s; }
        .profile-link:hover { background: #3D2A0E; }
        /* Camino */
        .camino-wrap { max-width: 560px; margin: 0 auto; padding: 40px 24px 80px; }
        /* Módulo section */
        .modulo-banner { border-radius: 20px; padding: 20px 24px; margin-bottom: 8px; display: flex; align-items: center; gap: 14px; }
        .modulo-banner-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; }
        .modulo-banner-nombre { font-family: 'Fredoka',sans-serif; font-size: 17px; font-weight: 600; }
        .modulo-banner-info { font-family: 'Nunito',sans-serif; font-size: 13px; opacity: 0.7; margin-top: 2px; }
        .modulo-completo-badge { margin-left: auto; font-size: 20px; }
        /* Unidades en camino */
        .unidades-camino { display: flex; flex-direction: column; align-items: center; gap: 0; margin-bottom: 16px; }
        .unidad-nodo-wrap { display: flex; flex-direction: column; align-items: center; width: 100%; }
        .linea-conector { width: 3px; height: 24px; background: #E8D9B8; }
        .linea-conector.activa { background: #6B4520; }
        .unidad-nodo { display: flex; align-items: center; gap: 16px; width: 100%; padding: 0 20px; }
        /* Nodo circular */
        .nodo-circulo {
          width: 64px; height: 64px; border-radius: 50%; border: 3px solid #E8D9B8;
          display: flex; align-items: center; justify-content: center;
          font-size: 24px; flex-shrink: 0; cursor: pointer;
          transition: all 0.2s; position: relative; background: #FFFDF5;
        }
        .nodo-circulo.completado { background: #6B4520; border-color: #6B4520; }
        .nodo-circulo.activo { background: #FFFDF5; border-color: #C8934A; border-width: 3px; box-shadow: 0 0 0 4px rgba(252,230,139,0.4); animation: pulse-nodo 2s infinite; }
        .nodo-circulo.bloqueado { background: #F4EDE0; border-color: #E8D9B8; cursor: not-allowed; opacity: 0.6; }
        @keyframes pulse-nodo { 0%,100%{box-shadow:0 0 0 4px rgba(252,230,139,0.4)} 50%{box-shadow:0 0 0 8px rgba(252,230,139,0.15)} }
        .nodo-check { color: #FCE68B; font-size: 26px; }
        .nodo-lock { font-size: 22px; }
        .nodo-num { font-family: 'Fredoka',sans-serif; font-size: 20px; color: #C8934A; font-weight: 600; }
        /* Info de unidad */
        .unidad-info { flex: 1; }
        .unidad-nombre-nodo { font-family: 'Fredoka',sans-serif; font-size: 16px; color: #3D2A0E; font-weight: 600; }
        .unidad-desc-nodo { font-family: 'Nunito',sans-serif; font-size: 12px; color: #A87840; margin-top: 2px; }
        .unidad-puntaje { font-family: 'Fredoka',sans-serif; font-size: 14px; color: #C8934A; }
        /* Botón empezar grande */
        .btn-empezar-grande {
          display: block; text-align: center; padding: 14px 28px; border-radius: 100px;
          background: #6B4520; color: #FCE68B;
          font-family: 'Fredoka',sans-serif; font-size: 16px; font-weight: 600;
          text-decoration: none; transition: all 0.2s; margin-left: auto; white-space: nowrap;
        }
        .btn-empezar-grande:hover { background: #3D2A0E; transform: translateY(-1px); }
        .btn-repasar { background: rgba(252,230,139,0.4); color: #6B4520; }
        .btn-repasar:hover { background: rgba(250,191,77,0.5); }
        /* Prueba de módulo */
        .prueba-modulo {
          background: #3D2A0E; border-radius: 20px; padding: 20px 24px;
          display: flex; align-items: center; gap: 16px; margin: 8px 0 32px;
          text-decoration: none; transition: all 0.2s;
        }
        .prueba-modulo:hover { background: #2A1E0A; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(61,42,14,0.2); }
        .prueba-icon { width: 56px; height: 56px; background: rgba(252,230,139,0.15); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 28px; flex-shrink: 0; }
        .prueba-titulo { font-family: 'Fredoka',sans-serif; font-size: 17px; color: #FCE68B; }
        .prueba-desc { font-family: 'Nunito',sans-serif; font-size: 13px; color: rgba(252,230,139,0.5); margin-top: 3px; }
        .prueba-arrow { margin-left: auto; font-size: 22px; color: rgba(252,230,139,0.5); }
        .prueba-bloqueada { opacity: 0.4; cursor: not-allowed; }
        .prueba-bloqueada:hover { transform: none; box-shadow: none; }
        /* Monedoki motivacional */
        .mk-motivacion { display: flex; align-items: center; gap: 14px; background: rgba(250,191,77,0.12); border-radius: 16px; border: 1px solid rgba(250,191,77,0.3); padding: 16px 20px; margin-bottom: 32px; }
        .mk-mot-msg { font-family: 'Nunito',sans-serif; font-size: 14px; color: #6B4520; line-height: 1.6; }
        .mk-mot-msg strong { font-family: 'Fredoka',sans-serif; font-size: 16px; display: block; color: #3D2A0E; margin-bottom: 2px; }
        @media (max-width: 600px) {
          .dash-top-inner { flex-direction: column; gap: 12px; align-items: flex-start; }
          .btn-empezar-grande { padding: 12px 20px; font-size: 14px; }
        }
      `}</style>

      <div className="dash-wrap">
        <div className="dash-top">
          <div className="dash-top-inner">
            <div className="dash-welcome">¡Hola, <span>{nombre}</span>! 👋</div>
            <div className="dash-stats-row">
              {racha > 0 && <div className="dash-stat-pill">🔥 {racha} días</div>}
              <div className="dash-stat-pill">⭐ {totalCompletadas}/{totalUnidades}</div>
              <Link href="/perfil" className="profile-link">👤 Mi perfil</Link>
            </div>
          </div>
        </div>

        <div className="camino-wrap">
          {/* Monedoki mensaje */}
          <div className="mk-motivacion">
            <img src="/monedoki-neutral.png" alt="" style={{ width: 48, flexShrink: 0 }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
            <div className="mk-mot-msg">
              <strong>{totalCompletadas === 0 ? '¡Empieza tu aventura!' : totalCompletadas === totalUnidades ? '¡Lo lograste todo! 🏆' : '¡Sigue el camino!'}</strong>
              {totalCompletadas === 0 ? 'Tu primera lección te espera. ¡Dale clic al primer círculo!' : totalCompletadas === totalUnidades ? 'Completaste todos los módulos. ¡Eres un experto financiero!' : `Llevas ${totalCompletadas} unidades. ¡${totalUnidades - totalCompletadas} más para terminar!`}
            </div>
          </div>

          {/* Camino por módulos */}
          {modulos.map((modulo, mi) => {
            const color = COLORES_MODULO[mi % COLORES_MODULO.length]
            const unidadesModulo = unidades.filter(u => u.modulo_id === modulo.id).sort((a, b) => a.orden - b.orden)
            const completado = isModuloCompleto(modulo.id)
            const completadasModulo = unidadesModulo.filter(u => progreso.find(p => p.unidad_id === u.id && p.completada)).length

            return (
              <div key={modulo.id}>
                {/* Banner del módulo */}
                <div className="modulo-banner" style={{ background: color.bg }}>
                  <div className="modulo-banner-icon" style={{ background: color.light }}>{modulo.icono}</div>
                  <div>
                    <div className="modulo-banner-nombre" style={{ color: color.accent }}>Módulo {mi + 1}: {modulo.nombre}</div>
                    <div className="modulo-banner-info" style={{ color: color.accent }}>{completadasModulo}/{unidadesModulo.length} unidades</div>
                  </div>
                  {completado && <div className="modulo-completo-badge">🏆</div>}
                </div>

                {/* Unidades como nodos */}
                <div className="unidades-camino">
                  {unidadesModulo.map((unidad, ui) => {
                    const prog = getProgresoUnidad(unidad.id)
                    const completada = prog?.completada
                    const desbloqueada = isUnlocked(unidad)
                    const esActiva = desbloqueada && !completada

                    return (
                      <div key={unidad.id} className="unidad-nodo-wrap">
                        {ui > 0 && <div className={`linea-conector ${completada || (ui > 0 && getProgresoUnidad(unidadesModulo[ui-1].id)?.completada) ? 'activa' : ''}`} />}
                        <div className="unidad-nodo">
                          <div
                            className={`nodo-circulo ${completada ? 'completado' : esActiva ? 'activo' : 'bloqueado'}`}
                            onClick={() => desbloqueada && router.push(`/aprender/${modulo.id}/${unidad.id}`)}
                          >
                            {completada ? <span className="nodo-check">✓</span> : !desbloqueada ? <span className="nodo-lock">🔒</span> : <span className="nodo-num">{unidad.orden}</span>}
                          </div>
                          <div className="unidad-info">
                            <div className="unidad-nombre-nodo">{unidad.nombre}</div>
                            <div className="unidad-desc-nodo">{unidad.descripcion}</div>
                            {completada && <div className="unidad-puntaje">⭐ {prog?.ultimo_puntaje}%</div>}
                          </div>
                          {desbloqueada && (
                            <Link
                              href={`/aprender/${modulo.id}/${unidad.id}`}
                              className={`btn-empezar-grande ${completada ? 'btn-repasar' : ''}`}
                            >
                              {completada ? 'Repasar' : 'Empezar →'}
                            </Link>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Prueba del módulo */}
                <div
                  className={`prueba-modulo ${!completado ? 'prueba-bloqueada' : ''}`}
                  onClick={() => completado && router.push(`/aprender/${modulo.id}/prueba`)}
                  style={{ cursor: completado ? 'pointer' : 'not-allowed' }}
                >
                  <div className="prueba-icon">{completado ? '🏆' : '🔒'}</div>
                  <div>
                    <div className="prueba-titulo">Prueba del módulo</div>
                    <div className="prueba-desc">{completado ? 'Demuestra que dominaste todo el módulo' : 'Completa todas las unidades para desbloquear'}</div>
                  </div>
                  <div className="prueba-arrow">{completado ? '→' : '🔒'}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
