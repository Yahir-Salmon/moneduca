'use client'
import { useState, useEffect } from 'react'
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

const MENSAJES_CORRECTO = ['¡Excelente! 🎉', '¡Muy bien! 🌟', '¡Correcto! ¡Sigue así!', '¡Genial!', '¡Perfecto! 🏆']
const MENSAJES_INCORRECTO = ['¡Casi! Sigue intentando 💪', '¡No te rindas! 🦊', '¡Aprendes de los errores!', '¡Tú puedes!']
const MENSAJES_PENSAR = ['Piénsalo bien...', 'Tómate tu tiempo 🤔', '¿Recuerdas la lección?', 'Confío en ti 🦊']

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
  const [unidadNombre, setUnidadNombre] = useState('')
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [guardado, setGuardado] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/registro'); return }
      setUserId(user.id)

      const { data: unidad } = await supabase.from('unidades').select('nombre, orden, modulo_id').eq('id', unidadId).single()
      if (unidad) setUnidadNombre(unidad.nombre)

      // Guardar inicio de sesión (progreso parcial)
      await supabase.from('progreso_unidad').upsert({
        user_id: user.id,
        unidad_id: unidadId,
        modulo_id: moduloId,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,unidad_id', ignoreDuplicates: true })

      const { data: progreso } = await supabase
        .from('progreso_unidad').select('nivel_actual').eq('user_id', user.id).eq('unidad_id', unidadId).single()

      const nivel = progreso?.nivel_actual || 1
      const { data: banco } = await supabase
        .from('preguntas').select('*').eq('unidad_id', unidadId).lte('dificultad', Math.min(nivel + 1, 3))

      if (banco && banco.length > 0) {
        const mezcladas = banco
          .sort(() => Math.random() - 0.5)
          .slice(0, Math.min(7, banco.length))
          .map(p => ({ ...p, opciones: typeof p.opciones === 'string' ? JSON.parse(p.opciones) : p.opciones }))
        setPreguntas(mezcladas)
      }
      setLoading(false)
    }
    init()
  }, [moduloId, unidadId, router])

  const preguntaActual = preguntas[indice]
  const progresoPct = preguntas.length > 0 ? ((indice + (confirmada ? 1 : 0)) / preguntas.length) * 100 : 0

  const handleSeleccionar = (opcion: string) => {
    if (confirmada) return
    setSeleccionada(opcion)
    setMonedoki('pensar')
    setMensaje(MENSAJES_PENSAR[Math.floor(Math.random() * MENSAJES_PENSAR.length)])
  }

  const handleConfirmar = () => {
    if (!seleccionada || confirmada) return
    setConfirmada(true)
    const esCorrecta = seleccionada === preguntaActual.respuesta_correcta
    if (esCorrecta) {
      setCorrectas(prev => prev + 1)
      setMonedoki('feliz')
      setMensaje(MENSAJES_CORRECTO[Math.floor(Math.random() * MENSAJES_CORRECTO.length)])
      playSound('correct')
    } else {
      setErrores(prev => prev + 1)
      setMonedoki(errores >= 2 ? 'triste' : 'animo')
      setMensaje(MENSAJES_INCORRECTO[Math.floor(Math.random() * MENSAJES_INCORRECTO.length)])
      playSound('incorrect')
    }
    setFase('feedback')
  }

  const guardarProgreso = async (puntaje: number, aprobado: boolean) => {
    if (!userId || guardado) return
    setGuardado(true)
    const nivelNuevo = puntaje >= 80 ? 2 : 1
    await supabase.from('progreso_unidad').upsert({
      user_id: userId,
      unidad_id: unidadId,
      modulo_id: moduloId,
      completada: aprobado,
      nivel_actual: aprobado ? nivelNuevo : 1,
      sesiones: 1,
      ultimo_puntaje: puntaje,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,unidad_id' })
  }

  const handleSiguiente = async () => {
    if (indice + 1 >= preguntas.length) {
      const totalCorrectas = correctas + (seleccionada === preguntaActual?.respuesta_correcta ? 0 : 0)
      const puntaje = Math.round((correctas / preguntas.length) * 100)
      const aprobado = puntaje >= 60
      await guardarProgreso(puntaje, aprobado)
      if (aprobado) {
        playSound('complete')
        setMonedoki('super')
        setFase('completado')
      } else {
        setMonedoki('animo')
        setFase('repaso')
      }
    } else {
      setIndice(prev => prev + 1)
      setSeleccionada(null)
      setConfirmada(false)
      setFase('pregunta')
      setMonedoki('neutral')
      setMensaje('')
    }
  }

  const handleReintentar = () => {
    setPreguntas(prev => [...prev].sort(() => Math.random() - 0.5))
    setIndice(0); setSeleccionada(null); setConfirmada(false)
    setCorrectas(0); setErrores(0); setFase('pregunta')
    setMonedoki('neutral'); setMensaje(''); setGuardado(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FFF8E8', gap: 16 }}>
      <img src={MONEDOKI_IMGS.neutral} alt="" style={{ width: 90 }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
      <p style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 20, color: '#6B4520' }}>Preparando tu lección... 🦊</p>
    </div>
  )

  if (preguntas.length === 0) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FFF8E8', gap: 16, padding: 24 }}>
      <p style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 20, color: '#6B4520', textAlign: 'center' }}>No hay preguntas disponibles aún.</p>
      <button onClick={() => router.back()} style={{ padding: '12px 28px', borderRadius: 100, background: '#6B4520', color: '#FCE68B', border: 'none', fontFamily: "'Fredoka',sans-serif", fontSize: 16, cursor: 'pointer' }}>Volver</button>
    </div>
  )

  return (
    <>
      <style>{`
        .lec-wrap { min-height: 100vh; background: #FFF8E8; display: flex; flex-direction: column; }
        .lec-header { background: #FFFDF5; border-bottom: 1px solid #E8D9B8; padding: 14px 24px; display: flex; align-items: center; gap: 14px; position: sticky; top: 68px; z-index: 10; }
        .lec-titulo { font-family: 'Fredoka',sans-serif; font-size: 16px; font-weight: 600; color: #3D2A0E; white-space: nowrap; }
        .prog-wrap { flex: 1; height: 12px; background: rgba(232,217,184,0.5); border-radius: 100px; overflow: hidden; }
        .prog-fill { height: 100%; background: #6B4520; border-radius: 100px; transition: width 0.4s ease; }
        .prog-label { font-family: 'Fredoka',sans-serif; font-size: 14px; color: #8C6D45; white-space: nowrap; }
        .lec-body { flex: 1; max-width: 620px; margin: 0 auto; padding: 28px 24px; width: 100%; }
        .monedoki-row { display: flex; align-items: flex-end; gap: 14px; margin-bottom: 24px; }
        .mk-img { width: 72px; height: 72px; object-fit: contain; transition: all 0.3s; }
        .mk-bubble { background: #FFFDF5; border: 1.5px solid #E8D9B8; border-radius: 16px 16px 16px 4px; padding: 10px 14px; font-family: 'Nunito',sans-serif; font-size: 14px; color: #6B4520; max-width: 300px; line-height: 1.5; }
        .preg-text { font-family: 'Fredoka',sans-serif; font-size: 21px; font-weight: 600; color: #3D2A0E; margin-bottom: 20px; line-height: 1.3; }
        .opciones { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
        .op-btn { text-align: left; padding: 15px 18px; border-radius: 14px; border: 2px solid #E8D9B8; background: #FFFDF5; font-family: 'Nunito',sans-serif; font-size: 15px; color: #3D2A0E; cursor: pointer; transition: all 0.15s; line-height: 1.4; }
        .op-btn:hover:not(:disabled) { border-color: #C8934A; background: rgba(252,230,139,0.15); }
        .op-btn.sel { border-color: #6B4520; background: rgba(252,230,139,0.25); }
        .op-btn.ok { border-color: #3B6D11; background: #EAF3DE; color: #27500A; }
        .op-btn.mal { border-color: #993C1D; background: #FAECE7; color: #712B13; }
        .feedback { border-radius: 14px; padding: 14px 18px; margin-bottom: 18px; font-family: 'Nunito',sans-serif; font-size: 14px; line-height: 1.6; }
        .fb-ok { background: #EAF3DE; border: 1.5px solid #C0DD97; color: #27500A; }
        .fb-mal { background: #FAECE7; border: 1.5px solid #F0997B; color: #712B13; }
        .accion-btn { width: 100%; padding: 15px; border-radius: 100px; border: none; font-family: 'Fredoka',sans-serif; font-size: 17px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .accion-btn.on { background: #6B4520; color: #FCE68B; }
        .accion-btn.on:hover { background: #3D2A0E; transform: translateY(-1px); }
        .accion-btn.off { background: #E8D9B8; color: #A87840; cursor: default; }
        .accion-btn.next { background: #6B4520; color: #FCE68B; }
        /* Completado / Repaso */
        .result-wrap { text-align: center; padding: 32px 16px; }
        .result-stars { font-size: 44px; margin: 12px 0; }
        .result-h { font-family: 'Fredoka',sans-serif; font-size: 28px; color: #3D2A0E; margin-bottom: 10px; }
        .result-sub { font-family: 'Nunito',sans-serif; font-size: 15px; color: #8C6D45; margin-bottom: 28px; }
        .stats-row { display: flex; justify-content: center; gap: 16px; margin-bottom: 28px; flex-wrap: wrap; }
        .stat-b { background: #FFFDF5; border: 1px solid #E8D9B8; border-radius: 14px; padding: 14px 20px; text-align: center; }
        .stat-n { font-family: 'Fredoka',sans-serif; font-size: 28px; color: #6B4520; }
        .stat-l { font-family: 'Nunito',sans-serif; font-size: 12px; color: #A87840; }
        .btns-col { display: flex; flex-direction: column; gap: 10px; max-width: 340px; margin: 0 auto; }
        .sec-btn { padding: 13px; border-radius: 100px; border: 2px solid #E8D9B8; background: transparent; font-family: 'Fredoka',sans-serif; font-size: 15px; color: #8C6D45; cursor: pointer; }
      `}</style>

      <div className="lec-wrap">
        <div className="lec-header">
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#8C6D45', flexShrink: 0 }}>✕</button>
          <span className="lec-titulo">{unidadNombre}</span>
          <div className="prog-wrap">
            <div className="prog-fill" style={{ width: `${progresoPct}%` }} />
          </div>
          <span className="prog-label">{indice + 1}/{preguntas.length}</span>
        </div>

        {/* COMPLETADO */}
        {fase === 'completado' && (
          <div className="lec-body">
            <div className="result-wrap">
              <img src={MONEDOKI_IMGS.super} alt="" style={{ width: 120, margin: '0 auto 8px' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
              <div className="result-stars">⭐⭐⭐</div>
              <h2 className="result-h">¡Unidad completada!</h2>
              <p className="result-sub">¡Monedoki está muy orgulloso! Dominaste <strong>{unidadNombre}</strong>.</p>
              <div className="stats-row">
                <div className="stat-b"><div className="stat-n">{correctas}</div><div className="stat-l">correctas</div></div>
                <div className="stat-b"><div className="stat-n">{errores}</div><div className="stat-l">errores</div></div>
                <div className="stat-b"><div className="stat-n">{Math.round((correctas / preguntas.length) * 100)}%</div><div className="stat-l">puntaje</div></div>
              </div>
              <div className="btns-col">
                <button className="accion-btn on" onClick={() => router.push('/dashboard')}>Ir al inicio 🏠</button>
                <button className="sec-btn" onClick={handleReintentar}>Practicar de nuevo</button>
              </div>
            </div>
          </div>
        )}

        {/* REPASO */}
        {fase === 'repaso' && (
          <div className="lec-body">
            <div className="result-wrap">
              <img src={MONEDOKI_IMGS.animo} alt="" style={{ width: 100, margin: '0 auto 8px' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
              <h2 className="result-h">¡Casi lo logras!</h2>
              <p className="result-sub">Obtuviste {Math.round((correctas / preguntas.length) * 100)}%. Necesitas al menos 60% para completar. ¡Monedoki sabe que puedes!</p>
              <div className="stats-row">
                <div className="stat-b"><div className="stat-n">{correctas}</div><div className="stat-l">correctas</div></div>
                <div className="stat-b"><div className="stat-n">{errores}</div><div className="stat-l">errores</div></div>
              </div>
              <div className="btns-col">
                <button className="accion-btn on" onClick={handleReintentar}>Intentar de nuevo 💪</button>
                <button className="sec-btn" onClick={() => router.push('/dashboard')}>Volver al inicio</button>
              </div>
            </div>
          </div>
        )}

        {/* PREGUNTA */}
        {(fase === 'pregunta' || fase === 'feedback') && preguntaActual && (
          <div className="lec-body">
            <div className="monedoki-row">
              <img src={MONEDOKI_IMGS[monedoki]} alt="Monedoki" className="mk-img" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
              <div className="mk-bubble">
                {mensaje || (fase === 'pregunta' ? '¿Cuál es tu respuesta? 🦊' : '')}
              </div>
            </div>

            <p className="preg-text">{preguntaActual.pregunta}</p>

            <div className="opciones">
              {preguntaActual.opciones.map((op, i) => {
                let cls = 'op-btn'
                if (confirmada) {
                  if (op === preguntaActual.respuesta_correcta) cls += ' ok'
                  else if (op === seleccionada) cls += ' mal'
                } else if (op === seleccionada) cls += ' sel'
                return (
                  <button key={i} className={cls} onClick={() => handleSeleccionar(op)} disabled={confirmada}>
                    {op}
                  </button>
                )
              })}
            </div>

            {fase === 'feedback' && (
              <div className={`feedback ${seleccionada === preguntaActual.respuesta_correcta ? 'fb-ok' : 'fb-mal'}`}>
                <strong>{seleccionada === preguntaActual.respuesta_correcta ? '✅ ¡Correcto!' : '❌ Respuesta incorrecta'}</strong>
                <br />{preguntaActual.explicacion}
              </div>
            )}

            {fase === 'pregunta'
              ? <button className={`accion-btn ${seleccionada ? 'on' : 'off'}`} onClick={handleConfirmar} disabled={!seleccionada}>Confirmar respuesta</button>
              : <button className="accion-btn next" onClick={handleSiguiente}>{indice + 1 >= preguntas.length ? 'Ver resultados →' : 'Siguiente →'}</button>
            }
          </div>
        )}
      </div>
    </>
  )
}
