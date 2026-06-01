'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Pregunta {
  id: string
  tipo: string
  dificultad: number
  pregunta: string
  opciones: string[]
  respuesta_correcta: string
  explicacion: string
  dato_curioso: string | null
}

const MONEDOKI_IMGS = {
  neutral: '/monedoki-neutral.png',
  feliz: '/monedoki-feliz.png',
  super: '/monedoki-super.png',
  animo: '/monedoki-animo.png',
  triste: '/monedoki-triste.png',
  pensar: '/monedoki-pensar.png',
  sorpresa: '/monedoki-sorpresa.png',
}

const MONEDOKI_MENSAJES = {
  correcto: ['¡Excelente! 🎉', '¡Muy bien! 🌟', '¡Correcto! ¡Sigue así!', '¡Genial! ¡Lo sabías!', '¡Perfecto! 🏆'],
  incorrecto: ['¡Casi! Sigue intentando 💪', '¡No te rindas! 🦊', '¡Eso ya lo sabes para la próxima!', '¡Aprender de los errores es clave!'],
  pensar: ['Piénsalo bien...', 'Tómate tu tiempo 🤔', '¿Recuerdas la lección?', 'Confío en ti 🦊'],
}

function playSound(type: 'correct' | 'incorrect' | 'complete') {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
    if (type === 'correct') {
      osc.frequency.setValueAtTime(523, ctx.currentTime)
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1)
      osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2)
    } else if (type === 'incorrect') {
      osc.frequency.setValueAtTime(300, ctx.currentTime)
      osc.frequency.setValueAtTime(250, ctx.currentTime + 0.15)
    } else {
      osc.frequency.setValueAtTime(523, ctx.currentTime)
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1)
      osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2)
      osc.frequency.setValueAtTime(1047, ctx.currentTime + 0.35)
    }
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.6)
  } catch {}
}

export default function LeccionPage() {
  const params = useParams()
  const router = useRouter()
  const moduloId = params.moduloId as string
  const unidadId = params.unidadId as string

  const [preguntas, setPreguntas] = useState<Pregunta[]>([])
  const [indice, setIndice] = useState(0)
  const [seleccionada, setSeleccionada] = useState<string | null>(null)
  const [confirmada, setConfirmada] = useState(false)
  const [correctas, setCorrectas] = useState(0)
  const [errores, setErrores] = useState(0)
  const [monedoki, setMonedoki] = useState<keyof typeof MONEDOKI_IMGS>('neutral')
  const [mensaje, setMensaje] = useState('')
  const [fase, setFase] = useState<'pregunta' | 'feedback' | 'completado' | 'repaso'>('pregunta')
  const [unidadInfo, setUnidadInfo] = useState<{ nombre: string; modulo: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const audioRef = useRef<boolean>(false)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/registro'); return }
      setUserId(user.id)

      const { data: unidad } = await supabase
        .from('unidades').select('nombre, modulo_id').eq('id', unidadId).single()
      const { data: modulo } = await supabase
        .from('modulos').select('nombre').eq('id', moduloId).single()

      if (unidad && modulo) setUnidadInfo({ nombre: unidad.nombre, modulo: modulo.nombre })

      const { data: progreso } = await supabase
        .from('progreso_unidad').select('nivel_actual').eq('user_id', user.id).eq('unidad_id', unidadId).single()

      const nivel = progreso?.nivel_actual || 1

      const { data: bancoPreguntas } = await supabase
        .from('preguntas')
        .select('*')
        .eq('unidad_id', unidadId)
        .lte('dificultad', Math.min(nivel + 1, 3))
        .order('dificultad')

      if (bancoPreguntas && bancoPreguntas.length > 0) {
        const mezcladas = bancoPreguntas
          .sort(() => Math.random() - 0.5)
          .slice(0, Math.min(7, bancoPreguntas.length))
          .map(p => ({ ...p, opciones: typeof p.opciones === 'string' ? JSON.parse(p.opciones) : p.opciones }))
        setPreguntas(mezcladas)
      }
      setLoading(false)
    }
    init()
  }, [moduloId, unidadId, router])

  const preguntaActual = preguntas[indice]
  const progresoPct = preguntas.length > 0 ? (indice / preguntas.length) * 100 : 0

  const handleSeleccionar = (opcion: string) => {
    if (confirmada) return
    setSeleccionada(opcion)
    setMonedoki('pensar')
    setMensaje(MONEDOKI_MENSAJES.pensar[Math.floor(Math.random() * MONEDOKI_MENSAJES.pensar.length)])
  }

  const handleConfirmar = () => {
    if (!seleccionada || confirmada) return
    setConfirmada(true)
    const esCorrecta = seleccionada === preguntaActual.respuesta_correcta

    if (esCorrecta) {
      setCorrectas(prev => prev + 1)
      setMonedoki('feliz')
      setMensaje(MONEDOKI_MENSAJES.correcto[Math.floor(Math.random() * MONEDOKI_MENSAJES.correcto.length)])
      playSound('correct')
    } else {
      setErrores(prev => prev + 1)
      setMonedoki(errores >= 2 ? 'triste' : 'animo')
      setMensaje(MONEDOKI_MENSAJES.incorrecto[Math.floor(Math.random() * MONEDOKI_MENSAJES.incorrecto.length)])
      playSound('incorrect')
    }
    setFase('feedback')
  }

  const handleSiguiente = async () => {
    if (indice + 1 >= preguntas.length) {
      const puntaje = Math.round((correctas / preguntas.length) * 100)
      const aprobado = puntaje >= 60

      if (aprobado) {
        playSound('complete')
        setMonedoki('super')
        setFase('completado')
        if (userId) {
          const nivelNuevo = puntaje >= 80 ? 2 : 1
          await supabase.from('progreso_unidad').upsert({
            user_id: userId,
            unidad_id: unidadId,
            modulo_id: moduloId,
            completada: true,
            nivel_actual: nivelNuevo,
            ultimo_puntaje: puntaje,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id,unidad_id' })
        }
      } else {
        setMonedoki('animo')
        setFase('repaso')
      }
    } else {
      setIndice(prev => prev + 1)
      setSeleccionada(null)
      setConfirmada(false)
      setFase('pregunta')
      setMonedoki(preguntaActual?.dificultad === 3 ? 'pensar' : 'neutral')
      setMensaje('')
    }
  }

  const handleReintentar = () => {
    const mezcladas = [...preguntas].sort(() => Math.random() - 0.5)
    setPreguntas(mezcladas)
    setIndice(0)
    setSeleccionada(null)
    setConfirmada(false)
    setCorrectas(0)
    setErrores(0)
    setFase('pregunta')
    setMonedoki('neutral')
    setMensaje('')
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FFF8E8', gap: 16 }}>
      <img src={MONEDOKI_IMGS.neutral} alt="Monedoki" style={{ width: 100 }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
      <p style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 20, color: '#6B4520' }}>Preparando tu lección... 🦊</p>
    </div>
  )

  if (preguntas.length === 0) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FFF8E8', gap: 16, padding: 24 }}>
      <img src={MONEDOKI_IMGS.triste} alt="Monedoki" style={{ width: 100 }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
      <p style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 20, color: '#6B4520', textAlign: 'center' }}>No hay preguntas disponibles aún para esta unidad.</p>
      <button onClick={() => router.back()} style={{ padding: '12px 28px', borderRadius: 100, background: '#6B4520', color: '#FCE68B', border: 'none', fontFamily: "'Fredoka',sans-serif", fontSize: 16, cursor: 'pointer' }}>
        Volver
      </button>
    </div>
  )

  return (
    <>
      <style>{`
        .leccion-wrap { min-height: 100vh; background: #FFF8E8; display: flex; flex-direction: column; }
        .leccion-header { background: #FFFDF5; border-bottom: 1px solid #E8D9B8; padding: 16px 24px; display: flex; align-items: center; gap: 16px; position: sticky; top: 0; z-index: 10; }
        .prog-bar-wrap { flex: 1; height: 12px; background: rgba(232,217,184,0.5); border-radius: 100px; overflow: hidden; }
        .prog-bar-fill { height: 100%; background: #6B4520; border-radius: 100px; transition: width 0.4s ease; }
        .leccion-body { flex: 1; max-width: 640px; margin: 0 auto; padding: 32px 24px; width: 100%; }
        .monedoki-row { display: flex; align-items: flex-end; gap: 16px; margin-bottom: 28px; }
        .monedoki-img { width: 80px; height: 80px; object-fit: contain; transition: all 0.3s ease; }
        .monedoki-bubble {
          background: #FFFDF5; border: 1.5px solid #E8D9B8; border-radius: 18px 18px 18px 4px;
          padding: 12px 16px; font-family: 'Nunito',sans-serif; font-size: 15px; color: #6B4520;
          max-width: 340px; line-height: 1.5; position: relative;
        }
        .pregunta-text { font-family: 'Fredoka',sans-serif; font-size: 22px; font-weight: 600; color: #3D2A0E; margin-bottom: 24px; line-height: 1.3; }
        .opciones { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
        .opcion-btn {
          text-align: left; padding: 16px 20px; border-radius: 16px;
          border: 2px solid #E8D9B8; background: #FFFDF5;
          font-family: 'Nunito',sans-serif; font-size: 16px; color: #3D2A0E;
          cursor: pointer; transition: all 0.15s; line-height: 1.4;
        }
        .opcion-btn:hover:not(:disabled) { border-color: #C8934A; background: rgba(252,230,139,0.2); }
        .opcion-btn.seleccionada { border-color: #6B4520; background: rgba(252,230,139,0.3); }
        .opcion-btn.correcta { border-color: #3B6D11; background: #EAF3DE; color: #27500A; }
        .opcion-btn.incorrecta { border-color: #993C1D; background: #FAECE7; color: #712B13; }
        .feedback-box { border-radius: 16px; padding: 16px 20px; margin-bottom: 20px; font-family: 'Nunito',sans-serif; font-size: 15px; line-height: 1.6; }
        .feedback-correcto { background: #EAF3DE; border: 1.5px solid #C0DD97; color: #27500A; }
        .feedback-incorrecto { background: #FAECE7; border: 1.5px solid #F0997B; color: #712B13; }
        .dato-curioso { background: rgba(252,230,139,0.3); border: 1.5px solid rgba(250,191,77,0.5); border-radius: 12px; padding: 12px 16px; font-family: 'Nunito',sans-serif; font-size: 14px; color: #6B4520; margin-top: 10px; }
        .confirmar-btn {
          width: 100%; padding: 16px; border-radius: 100px; border: none;
          font-family: 'Fredoka',sans-serif; font-size: 18px; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
        }
        .confirmar-btn.activo { background: #6B4520; color: #FCE68B; }
        .confirmar-btn.activo:hover { background: #3D2A0E; transform: translateY(-2px); }
        .confirmar-btn.inactivo { background: #E8D9B8; color: #A87840; cursor: default; }
        .confirmar-btn.siguiente { background: #6B4520; color: #FCE68B; }
        .confirmar-btn.siguiente:hover { background: #3D2A0E; }
        /* Completado */
        .completado-wrap { text-align: center; padding: 40px 24px; }
        .completado-stars { font-size: 48px; margin: 20px 0; }
        .completado-h { font-family: 'Fredoka',sans-serif; font-size: 32px; color: #3D2A0E; margin-bottom: 12px; }
        .completado-sub { font-family: 'Nunito',sans-serif; font-size: 16px; color: #8C6D45; margin-bottom: 32px; }
        .stats-row { display: flex; justify-content: center; gap: 24px; margin-bottom: 32px; }
        .stat-badge { background: #FFFDF5; border: 1px solid #E8D9B8; border-radius: 16px; padding: 16px 24px; text-align: center; }
        .stat-n { font-family: 'Fredoka',sans-serif; font-size: 32px; color: #6B4520; }
        .stat-l { font-family: 'Nunito',sans-serif; font-size: 13px; color: #A87840; }
        .btns-row { display: flex; flex-direction: column; gap: 12px; max-width: 360px; margin: 0 auto; }
        @media (max-width: 480px) { .pregunta-text { font-size: 18px; } .opcion-btn { font-size: 15px; } }
      `}</style>

      <div className="leccion-wrap">
        {/* Header */}
        <div className="leccion-header">
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#8C6D45' }}>✕</button>
          <div className="prog-bar-wrap">
            <div className="prog-bar-fill" style={{ width: `${progresoPct}%` }} />
          </div>
          <span style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 15, color: '#8C6D45', whiteSpace: 'nowrap' }}>
            {indice + 1}/{preguntas.length}
          </span>
        </div>

        {/* Completado */}
        {fase === 'completado' && (
          <div className="leccion-body">
            <div className="completado-wrap">
              <img src={MONEDOKI_IMGS.super} alt="Monedoki celebrando" style={{ width: 140, margin: '0 auto 16px' }} onError={e => { (e.target as HTMLImageElement).style.fontSize = '80px'; (e.target as HTMLImageElement).alt = '🦊' }} />
              <div className="completado-stars">⭐⭐⭐</div>
              <h2 className="completado-h">¡Unidad completada!</h2>
              <p className="completado-sub">¡Monedoki está muy orgulloso de ti! Dominaste <strong>{unidadInfo?.nombre}</strong>.</p>
              <div className="stats-row">
                <div className="stat-badge">
                  <div className="stat-n">{correctas}</div>
                  <div className="stat-l">correctas</div>
                </div>
                <div className="stat-badge">
                  <div className="stat-n">{errores}</div>
                  <div className="stat-l">errores</div>
                </div>
                <div className="stat-badge">
                  <div className="stat-n">{Math.round((correctas / preguntas.length) * 100)}%</div>
                  <div className="stat-l">puntaje</div>
                </div>
              </div>
              <div className="btns-row">
                <button className="confirmar-btn activo" onClick={() => router.push(`/dashboard`)}>
                  Ir al inicio 🏠
                </button>
                <button onClick={handleReintentar} style={{ padding: '14px', borderRadius: 100, border: '2px solid #E8D9B8', background: 'transparent', fontFamily: "'Fredoka',sans-serif", fontSize: 16, color: '#8C6D45', cursor: 'pointer' }}>
                  Practicar de nuevo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Repaso (no aprobó) */}
        {fase === 'repaso' && (
          <div className="leccion-body">
            <div className="completado-wrap">
              <img src={MONEDOKI_IMGS.animo} alt="Monedoki animando" style={{ width: 120, margin: '0 auto 16px' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
              <h2 className="completado-h">¡Casi lo logras!</h2>
              <p className="completado-sub">Obtuviste {Math.round((correctas / preguntas.length) * 100)}%. Necesitas al menos 60% para completar la unidad. ¡Monedoki sabe que puedes!</p>
              <div className="stats-row">
                <div className="stat-badge">
                  <div className="stat-n">{correctas}</div>
                  <div className="stat-l">correctas</div>
                </div>
                <div className="stat-badge">
                  <div className="stat-n">{errores}</div>
                  <div className="stat-l">errores</div>
                </div>
              </div>
              <div className="btns-row">
                <button className="confirmar-btn activo" onClick={handleReintentar}>
                  Intentar de nuevo 💪
                </button>
                <button onClick={() => router.push('/dashboard')} style={{ padding: '14px', borderRadius: 100, border: '2px solid #E8D9B8', background: 'transparent', fontFamily: "'Fredoka',sans-serif", fontSize: 16, color: '#8C6D45', cursor: 'pointer' }}>
                  Volver al inicio
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pregunta */}
        {(fase === 'pregunta' || fase === 'feedback') && preguntaActual && (
          <div className="leccion-body">
            {/* Monedoki */}
            <div className="monedoki-row">
              <img
                src={MONEDOKI_IMGS[monedoki]}
                alt="Monedoki"
                className="monedoki-img"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
              {(mensaje || fase === 'pregunta') && (
                <div className="monedoki-bubble">
                  {mensaje || (preguntaActual.dificultad === 3 ? '¡Esta es difícil! Piénsalo bien 🤔' : preguntaActual.dato_curioso ? `💡 ${preguntaActual.dato_curioso}` : '¿Cuál es tu respuesta? 🦊')}
                </div>
              )}
            </div>

            {/* Pregunta */}
            <p className="pregunta-text">{preguntaActual.pregunta}</p>

            {/* Opciones */}
            <div className="opciones">
              {preguntaActual.opciones.map((opcion, i) => {
                let clase = 'opcion-btn'
                if (confirmada) {
                  if (opcion === preguntaActual.respuesta_correcta) clase += ' correcta'
                  else if (opcion === seleccionada) clase += ' incorrecta'
                } else if (opcion === seleccionada) {
                  clase += ' seleccionada'
                }
                return (
                  <button
                    key={i}
                    className={clase}
                    onClick={() => handleSeleccionar(opcion)}
                    disabled={confirmada}
                  >
                    {opcion}
                  </button>
                )
              })}
            </div>

            {/* Feedback */}
            {fase === 'feedback' && (
              <div className={`feedback-box ${seleccionada === preguntaActual.respuesta_correcta ? 'feedback-correcto' : 'feedback-incorrecto'}`}>
                <strong>{seleccionada === preguntaActual.respuesta_correcta ? '✅ ¡Correcto!' : '❌ Respuesta incorrecta'}</strong>
                <br />
                {preguntaActual.explicacion}
                {preguntaActual.dato_curioso && seleccionada === preguntaActual.respuesta_correcta && (
                  <div className="dato-curioso">💡 {preguntaActual.dato_curioso}</div>
                )}
              </div>
            )}

            {/* Botón */}
            {fase === 'pregunta' ? (
              <button
                className={`confirmar-btn ${seleccionada ? 'activo' : 'inactivo'}`}
                onClick={handleConfirmar}
                disabled={!seleccionada}
              >
                Confirmar respuesta
              </button>
            ) : (
              <button className="confirmar-btn siguiente" onClick={handleSiguiente}>
                {indice + 1 >= preguntas.length ? 'Ver resultados →' : 'Siguiente →'}
              </button>
            )}
          </div>
        )}
      </div>
    </>
  )
}
