'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Modulo { id: string; nombre: string; icono: string; orden: number }
interface Progreso { modulo_id: string; unidad_id: string; completada: boolean; ultimo_puntaje: number }

export default function PerfilPage() {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [racha, setRacha] = useState(0)
  const [loading, setLoading] = useState(true)
  const [modulos, setModulos] = useState<Modulo[]>([])
  const [progreso, setProgreso] = useState<Progreso[]>([])
  const [unidades, setUnidades] = useState<{ id: string; modulo_id: string }[]>([])
  const [certDescarga, setCertDescarga] = useState<string | null>(null)
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/registro'); return }
      setEmail(user.email || '')

      // Obtener nombre real del perfil, con fallback a metadata
      const { data: profile } = await supabase.from('profiles').select('nombre, racha').eq('id', user.id).single()
      const nombreReal = profile?.nombre
        || user.user_metadata?.nombre
        || user.user_metadata?.full_name
        || user.user_metadata?.name
        || user.email?.split('@')[0]
        || 'Estudiante'
      setNombre(nombreReal)
      setRacha(profile?.racha || 0)

      const [{ data: mods }, { data: unis }, { data: prog }] = await Promise.all([
        supabase.from('modulos').select('id, nombre, icono, orden').order('orden'),
        supabase.from('unidades').select('id, modulo_id'),
        supabase.from('progreso_unidad').select('modulo_id, unidad_id, completada, ultimo_puntaje').eq('user_id', user.id),
      ])
      setModulos(mods || [])
      setUnidades(unis || [])
      setProgreso(prog || [])
      setLoading(false)
    }
    init()
  }, [router])

  const isModuloCompleto = (moduloId: string) => {
    const unis = unidades.filter(u => u.modulo_id === moduloId)
    return unis.length > 0 && unis.every(u => progreso.find(p => p.unidad_id === u.id && p.completada))
  }

  const getPromedioModulo = (moduloId: string) => {
    const progs = progreso.filter(p => p.modulo_id === moduloId && p.completada)
    if (progs.length === 0) return 0
    return Math.round(progs.reduce((a, b) => a + b.ultimo_puntaje, 0) / progs.length)
  }

  const totalCompletadas = progreso.filter(p => p.completada).length
  const modulosCompletos = modulos.filter(m => isModuloCompleto(m.id))

  const generarCertificado = async (modulo: Modulo) => {
    setCertDescarga(modulo.id)
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 1200
    canvas.height = 850

    // Fondo crema
    ctx.fillStyle = '#FFF8E8'
    ctx.fillRect(0, 0, 1200, 850)

    // Borde exterior café
    ctx.strokeStyle = '#6B4520'
    ctx.lineWidth = 12
    ctx.strokeRect(20, 20, 1160, 810)

    // Borde interior amarillo
    ctx.strokeStyle = 'rgba(250,191,77,0.6)'
    ctx.lineWidth = 4
    ctx.strokeRect(34, 34, 1132, 782)

    // Esquinas decorativas
    ;[[60,60],[1140,60],[60,790],[1140,790]].forEach(([x,y]) => {
      ctx.fillStyle = 'rgba(250,191,77,0.25)'
      ctx.beginPath(); ctx.arc(x, y, 22, 0, Math.PI * 2); ctx.fill()
    })

    // Ícono del módulo
    ctx.font = '72px serif'
    ctx.textAlign = 'center'
    ctx.fillText(modulo.icono, 600, 135)

    // Moneduca
    ctx.fillStyle = '#C8934A'
    ctx.font = 'bold 18px Georgia, serif'
    ctx.letterSpacing = '6px'
    ctx.fillText('M O N E D U C A', 600, 180)

    // Línea
    ctx.strokeStyle = 'rgba(250,191,77,0.7)'
    ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(280, 198); ctx.lineTo(920, 198); ctx.stroke()

    // Título certificado
    ctx.fillStyle = '#8C6D45'
    ctx.font = 'bold 26px Georgia, serif'
    ctx.letterSpacing = '3px'
    ctx.fillText('CERTIFICADO DE LOGRO', 600, 250)

    // "Se certifica que"
    ctx.fillStyle = '#8C6D45'
    ctx.font = '20px Georgia, serif'
    ctx.letterSpacing = '0px'
    ctx.fillText('Se certifica que', 600, 310)

    // NOMBRE — usar el nombre real, no el email
    ctx.fillStyle = '#3D2A0E'
    ctx.font = 'bold 54px Georgia, serif'
    ctx.fillText(nombre, 600, 390)

    // Línea bajo nombre
    const nameWidth = Math.min(ctx.measureText(nombre).width + 60, 800)
    ctx.strokeStyle = '#C8934A'
    ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(600 - nameWidth/2, 405); ctx.lineTo(600 + nameWidth/2, 405); ctx.stroke()

    // "completó exitosamente"
    ctx.fillStyle = '#8C6D45'
    ctx.font = '20px Georgia, serif'
    ctx.fillText('completó exitosamente el módulo', 600, 460)

    // Nombre del módulo
    ctx.fillStyle = '#6B4520'
    ctx.font = 'bold 32px Georgia, serif'
    ctx.fillText(modulo.nombre, 600, 515)

    // Promedio
    const promedio = getPromedioModulo(modulo.id)
    ctx.fillStyle = '#A87840'
    ctx.font = '18px Georgia, serif'
    ctx.fillText(`con un promedio de ${promedio}%`, 600, 560)

    // Línea divisora
    ctx.strokeStyle = 'rgba(250,191,77,0.4)'
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(200, 620); ctx.lineTo(1000, 620); ctx.stroke()

    // Firma
    ctx.fillStyle = '#3D2A0E'
    ctx.font = 'bold 28px Georgia, serif'
    ctx.fillText('🦊 Moneduca', 600, 685)

    ctx.fillStyle = '#A87840'
    ctx.font = '15px Georgia, serif'
    ctx.fillText('Educación financiera para jóvenes · moneduca.mx', 600, 715)

    // Fecha
    const fecha = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
    ctx.fillStyle = '#C8934A'
    ctx.font = '14px Georgia, serif'
    ctx.fillText(fecha, 600, 755)

    // Descargar
    const link = document.createElement('a')
    link.download = `certificado-${modulo.id}-moneduca.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    setCertDescarga(null)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF8E8' }}>
      <p style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 20, color: '#6B4520' }}>Cargando perfil... 🦊</p>
    </div>
  )

  return (
    <>
      <style>{`
        .perfil-wrap { min-height: 100vh; background: #FFF8E8; padding-top: 68px; }
        .perfil-hero { background: #3D2A0E; padding: 44px 0 36px; }
        .perfil-hero-inner { max-width: 900px; margin: 0 auto; padding: 0 24px; display: flex; align-items: center; gap: 20px; }
        .perfil-avatar { width: 76px; height: 76px; border-radius: 50%; background: rgba(250,191,77,0.15); border: 3px solid rgba(252,230,139,0.3); display: flex; align-items: center; justify-content: center; font-size: 34px; flex-shrink: 0; }
        .perfil-nombre { font-family: 'Fredoka',sans-serif; font-size: 26px; color: #FCE68B; }
        .perfil-email { font-family: 'Nunito',sans-serif; font-size: 13px; color: rgba(252,230,139,0.45); margin-top: 3px; }
        .perfil-back { margin-left: auto; padding: 8px 18px; border-radius: 100px; border: 1.5px solid rgba(252,230,139,0.3); background: transparent; color: rgba(252,230,139,0.7); font-family: 'Fredoka',sans-serif; font-size: 14px; cursor: pointer; transition: all 0.2s; }
        .perfil-back:hover { border-color: rgba(252,230,139,0.7); color: #FCE68B; }
        .perfil-body { max-width: 900px; margin: 0 auto; padding: 36px 24px; display: flex; flex-direction: column; gap: 32px; }
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .stat-card { background: #FFFDF5; border-radius: 20px; border: 1px solid #E8D9B8; padding: 22px; text-align: center; }
        .stat-num { font-family: 'Fredoka',sans-serif; font-size: 38px; color: #6B4520; line-height: 1; margin-bottom: 8px; }
        .stat-lbl { font-family: 'Nunito',sans-serif; font-size: 13px; color: #8C6D45; }
        .seccion-titulo { font-family: 'Fredoka',sans-serif; font-size: 20px; color: #3D2A0E; margin-bottom: 16px; }
        .logros-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .logro-card { background: #FFFDF5; border-radius: 16px; border: 1px solid #E8D9B8; padding: 18px; text-align: center; }
        .logro-card.obtenido { border-color: rgba(250,191,77,0.6); background: rgba(252,230,139,0.08); }
        .logro-card.bloqueado { opacity: 0.4; }
        .logro-icon { font-size: 34px; margin-bottom: 8px; }
        .logro-nombre { font-family: 'Fredoka',sans-serif; font-size: 14px; color: #3D2A0E; margin-bottom: 3px; }
        .logro-desc { font-family: 'Nunito',sans-serif; font-size: 11px; color: #8C6D45; }
        .certs-grid { display: flex; flex-direction: column; gap: 10px; }
        .cert-card { background: #FFFDF5; border-radius: 16px; border: 1px solid #E8D9B8; padding: 18px 22px; display: flex; align-items: center; gap: 14px; }
        .cert-card.completado { border-color: rgba(250,191,77,0.5); background: rgba(252,230,139,0.06); }
        .cert-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; }
        .cert-nombre { font-family: 'Fredoka',sans-serif; font-size: 15px; color: #3D2A0E; }
        .cert-estado { font-family: 'Nunito',sans-serif; font-size: 12px; color: #A87840; margin-top: 2px; }
        .cert-btn { margin-left: auto; padding: 9px 18px; border-radius: 100px; border: none; font-family: 'Fredoka',sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
        .cert-btn.activo { background: #6B4520; color: #FCE68B; }
        .cert-btn.activo:hover { background: #3D2A0E; transform: translateY(-1px); }
        .cert-btn.inactivo { background: #E8D9B8; color: #A87840; cursor: not-allowed; }
        @media (max-width: 600px) { .stats-grid { grid-template-columns: 1fr 1fr; } .logros-grid { grid-template-columns: 1fr 1fr; } }
      `}</style>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div className="perfil-wrap">
        <div className="perfil-hero">
          <div className="perfil-hero-inner">
            <div className="perfil-avatar">🦊</div>
            <div>
              <div className="perfil-nombre">{nombre}</div>
              <div className="perfil-email">{email}</div>
            </div>
            <button className="perfil-back" onClick={() => router.push('/dashboard')}>← Volver</button>
          </div>
        </div>

        <div className="perfil-body">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-num">🔥 {racha}</div>
              <div className="stat-lbl">Días seguidos</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">{totalCompletadas}</div>
              <div className="stat-lbl">Unidades completadas</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">{modulosCompletos.length}</div>
              <div className="stat-lbl">Módulos terminados</div>
            </div>
          </div>

          <div>
            <h2 className="seccion-titulo">🏅 Logros</h2>
            <div className="logros-grid">
              {[
                { icon: '🌱', nombre: 'Primera lección', desc: 'Completa tu primera unidad', obtenido: totalCompletadas >= 1 },
                { icon: '🔥', nombre: 'Racha de 3 días', desc: 'Estudia 3 días seguidos', obtenido: racha >= 3 },
                { icon: '⭐', nombre: 'Perfección', desc: 'Obtén 100% en una unidad', obtenido: progreso.some(p => p.ultimo_puntaje === 100) },
                { icon: '📚', nombre: 'Módulo completo', desc: 'Termina tu primer módulo', obtenido: modulosCompletos.length >= 1 },
                { icon: '🏆', nombre: 'Maestro financiero', desc: 'Completa todos los módulos', obtenido: modulosCompletos.length === modulos.length && modulos.length > 0 },
                { icon: '💪', nombre: 'Persistente', desc: 'Completa 10 unidades', obtenido: totalCompletadas >= 10 },
              ].map((logro, i) => (
                <div key={i} className={`logro-card ${logro.obtenido ? 'obtenido' : 'bloqueado'}`}>
                  <div className="logro-icon">{logro.obtenido ? logro.icon : '🔒'}</div>
                  <div className="logro-nombre">{logro.nombre}</div>
                  <div className="logro-desc">{logro.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="seccion-titulo">📜 Certificados</h2>
            <p style={{ fontFamily: "'Nunito',sans-serif", fontSize: 14, color: '#8C6D45', marginBottom: 16 }}>
              Completa todos las unidades de un módulo para descargar su certificado.
            </p>
            <div className="certs-grid">
              {modulos.map(modulo => {
                const completo = isModuloCompleto(modulo.id)
                const promedio = getPromedioModulo(modulo.id)
                const descargando = certDescarga === modulo.id
                return (
                  <div key={modulo.id} className={`cert-card ${completo ? 'completado' : ''}`}>
                    <div className="cert-icon" style={{ background: completo ? 'rgba(252,230,139,0.4)' : '#F4EDE0' }}>
                      {completo ? modulo.icono : '🔒'}
                    </div>
                    <div>
                      <div className="cert-nombre">{modulo.nombre}</div>
                      <div className="cert-estado">
                        {completo ? `✅ Completado · Promedio ${promedio}%` : '🔒 Completa todas las unidades'}
                      </div>
                    </div>
                    <button
                      className={`cert-btn ${completo ? 'activo' : 'inactivo'}`}
                      disabled={!completo || descargando}
                      onClick={() => completo && generarCertificado(modulo)}
                    >
                      {descargando ? 'Generando...' : '⬇️ Descargar'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
