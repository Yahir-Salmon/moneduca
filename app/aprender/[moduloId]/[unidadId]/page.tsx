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

interface Contenido {
  titulo: string
  texto: string
  tipo: 'intro' | 'dato' | 'consejo'
}

const MONEDOKI_POSES: Record<string, string> = {
  neutral: '/monedoki-neutral.png',
  feliz: '/monedoki-feliz.png',
  super: '/monedoki-super.png',
  animo: '/monedoki-animo.png',
  triste: '/monedoki-triste.png',
  pensar: '/monedoki-pensar.png',
  sorpresa: '/monedoki-sorpresa.png',
}

const POSES_PREGUNTA: (keyof typeof MONEDOKI_POSES)[] = ['neutral', 'pensar', 'sorpresa', 'neutral', 'pensar', 'sorpresa', 'neutral']

function playSound(type: 'correct' | 'incorrect' | 'complete') {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
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
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.6)
  } catch {}
}

// Contenido de plantilla — reemplazar con contenido real
function getContenidoPlantilla(unidadId: string, indice: number): Contenido | null {
  const contenidos: Record<string, Contenido[]> = {
    'bases-1': [
      { tipo: 'intro', titulo: '¿Qué es el dinero?', texto: 'El dinero es una herramienta que los seres humanos inventamos para facilitar el intercambio de bienes y servicios. Antes de que existiera, las personas usaban el trueque: intercambiaban directamente lo que tenían por lo que necesitaban. Imagina que eres agricultor y tienes manzanas, pero necesitas zapatos. Con el trueque, tendrías que encontrar a un zapatero que quisiera manzanas exactamente cuando tú necesitas zapatos. ¡Complicado!\n\nEl dinero resolvió ese problema al crear un intermediario universal que todos aceptamos como forma de pago.' },
      { tipo: 'dato', titulo: '💡 Dato curioso', texto: 'Las primeras formas de dinero no eran monedas ni billetes. En diferentes culturas se usaron conchas marinas, dientes de ballena, piedras enormes, sal (de ahí viene la palabra "salario") e incluso ganado. Lo importante no era el material, sino que todos en esa comunidad acordaban que ese objeto tenía valor.' },
    ],
    'bases-2': [
      { tipo: 'intro', titulo: 'El trueque y sus problemas', texto: 'Antes del dinero, las sociedades usaban el trueque: intercambiar bienes directamente. Si tenías pescado y querías pan, necesitabas encontrar a alguien con pan que quisiera pescado. Este sistema tenía un problema enorme llamado "doble coincidencia de necesidades": ambas personas debían querer lo que la otra ofrecía, al mismo tiempo y en cantidades equivalentes.\n\nAdemás, ¿cómo guardarías riqueza si lo que tienes es pescado fresco? El dinero resolvió también ese problema.' },
    ],
    'presupuesto-1': [
      { tipo: 'intro', titulo: '¿Qué es un presupuesto?', texto: 'Un presupuesto es simplemente un plan para tu dinero. Es decidir de antemano a dónde va a ir cada peso que recibes. Sin un presupuesto, el dinero simplemente "desaparece" sin que sepas exactamente en qué se fue.\n\nHacer un presupuesto tiene tres pasos básicos: primero conocer tus ingresos (todo el dinero que entra), luego identificar tus gastos (todo el dinero que sale) y finalmente asegurarte de que lo que entra sea mayor que lo que sale.' },
      { tipo: 'consejo', titulo: '✅ Consejo práctico', texto: 'Para hacer tu primer presupuesto, lleva un registro de todo lo que gastas durante una semana. Anota cada compra, por pequeña que sea: el chicle de $5, el transporte, la comida. Al final de la semana te sorprenderá ver a dónde fue tu dinero. Ese es el primer paso para controlarlo.' },
    ],
  }
  const plantilla: Contenido[] = contenidos[unidadId] || [
    { tipo: 'intro', titulo: 'Introducción al tema', texto: 'En esta unidad exploraremos conceptos fundamentales de finanzas personales. El conocimiento financiero es una habilidad para toda la vida — no importa cuánto dinero tengas ahora, entender cómo funciona te dará ventajas enormes en el futuro.\n\nLee con atención y reflexiona cómo estos conceptos aplican a tu vida diaria. Las preguntas que siguen te ayudarán a verificar que lo entendiste.' },
    { tipo: 'dato', titulo: '💡 ¿Sabías que...?', texto: 'La mayoría de los adultos nunca recibió educación financiera formal. Aprender estas habilidades ahora te pone en una posición privilegiada. Estudios muestran que las personas con conocimientos financieros básicos toman mejores decisiones, tienen menos deudas y logran sus metas más rápido.' },
  ]
  return indice < plantilla.length ? plantilla[indice] : null
}

export default function LeccionPage() {
  const params = useParams()
  const router = useRouter()
  const moduloId = params.moduloId as string
  const unidadId = params.unidadId as string

  const [preguntas, setPreguntas] = useState<Pregunta[]>([])
  const [indice, setIndice] = useState(0)
  const [fase, setFase] = useState<'contenido' | 'pregunta' | 'feedback' | 'completado' | 'repaso'>('contenido')
  const [seleccionada, setSeleccionada] = useState<string | null>(null)
  const [confirmada, setConfirmada] = useState(false)
  const [correctas, setCorrectas] = useState(0)
  const [errores, setErrores] = useState(0)
  const [monedokiPose, setMonedokiPose] = useState<keyof typeof MONEDOKI_POSES>('neutral')
  const [unidadNombre, setUnidadNombre] = useState('')
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [guardado, setGuardado] = useState(false)
  const [contenidoIdx, setContenidoIdx] = useState(0)

  const contenidoActual = getContenidoPlantilla(unidadId, contenidoIdx)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/registro'); return }
      setUserId(user.id)
      const { data: unidad } = await supabase.from('unidades').select('nombre').eq('id', unidadId).single()
      if (unidad) setUnidadNombre(unidad.nombre)
      const { data: progreso } = await supabase.from('progreso_unidad').select('nivel_actual').eq('user_id', user.id).eq('unidad_id', unidadId).single()
      const nivel = progreso?.nivel_actual || 1
      const { data: banco } = await supabase.from('preguntas').select('*').eq('unidad_id', unidadId).lte('dificultad', Math.min(nivel + 1, 3))
      if (banco && banco.length > 0) {
        const mezcladas = banco.sort(() => Math.random() - 0.5).slice(0, Math.min(7, banco.length))
          .map(p => ({ ...p, opciones: typeof p.opciones === 'string' ? JSON.parse(p.opciones) : p.opciones }))
        setPreguntas(mezcladas)
      }
      setLoading(false)
    }
    init()
  }, [moduloId, unidadId, router])

  const preguntaActual = preguntas[indice]
  const totalPasos = preguntas.length
  const progresoPct = totalPasos > 0 ? ((indice + (confirmada ? 1 : 0)) / totalPasos) * 100 : 0

  const handleConfirmar = () => {
    if (!seleccionada || confirmada) return
    setConfirmada(true)
    const esCorrecta = seleccionada === preguntaActual.respuesta_correcta
    if (esCorrecta) {
      setCorrectas(prev => prev + 1)
      setMonedokiPose('feliz')
      playSound('correct')
    } else {
      setErrores(prev => prev + 1)
      setMonedokiPose(errores >= 2 ? 'triste' : 'animo')
      playSound('incorrect')
    }
    setFase('feedback')
  }

  const guardarProgreso = async (puntaje: number, aprobado: boolean) => {
    if (!userId || guardado) return
    setGuardado(true)
    await supabase.from('progreso_unidad').upsert({
      user_id: userId, unidad_id: unidadId, modulo_id: moduloId,
      completada: aprobado, nivel_actual: aprobado ? (puntaje >= 80 ? 2 : 1) : 1,
      sesiones: 1, ultimo_puntaje: puntaje, updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,unidad_id' })
  }

  const handleSiguiente = async () => {
    if (indice + 1 >= preguntas.length) {
      const puntaje = Math.round((correctas / preguntas.length) * 100)
      const aprobado = puntaje >= 60
      await guardarProgreso(puntaje, aprobado)
      if (aprobado) { playSound('complete'); setMonedokiPose('super'); setFase('completado') }
      else { setMonedokiPose('animo'); setFase('repaso') }
    } else {
      const nextIdx = indice + 1
      setIndice(nextIdx)
      setSeleccionada(null); setConfirmada(false)
      // Mostrar contenido intermedio cada 2 preguntas
      const nextContenido = getContenidoPlantilla(unidadId, contenidoIdx + 1)
      if (nextIdx % 3 === 0 && nextContenido) {
        setContenidoIdx(prev => prev + 1)
        setFase('contenido')
      } else {
        setFase('pregunta')
        setMonedokiPose(POSES_PREGUNTA[nextIdx % POSES_PREGUNTA.length])
      }
    }
  }

  const handleReintentar = () => {
    setPreguntas(prev => [...prev].sort(() => Math.random() - 0.5))
    setIndice(0); setSeleccionada(null); setConfirmada(false)
    setCorrectas(0); setErrores(0); setFase('contenido')
    setMonedokiPose('neutral'); setGuardado(false); setContenidoIdx(0)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FFF8E8', gap: 16 }}>
      <img src={MONEDOKI_POSES.neutral} alt="" style={{ width: 90 }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
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
        .lec-titulo { font-family: 'Fredoka',sans-serif; font-size: 15px; font-weight: 600; color: #3D2A0E; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }
        .prog-wrap { flex: 1; height: 10px; background: rgba(232,217,184,0.5); border-radius: 100px; overflow: hidden; }
        .prog-fill { height: 100%; background: #6B4520; border-radius: 100px; transition: width 0.4s ease; }
        .prog-label { font-family: 'Fredoka',sans-serif; font-size: 13px; color: #8C6D45; white-space: nowrap; }
        .lec-body { flex: 1; max-width: 860px; margin: 0 auto; padding: 36px 24px; width: 100%; }
        /* Layout pregunta: izquierda texto, derecha monedoki */
        .preg-layout { display: grid; grid-template-columns: 1fr 200px; gap: 32px; align-items: start; }
        .preg-left { display: flex; flex-direction: column; }
        .preg-right { display: flex; flex-direction: column; align-items: center; padding-top: 16px; position: sticky; top: 120px; }
        .mk-side-img { width: 160px; height: 160px; object-fit: contain; transition: all 0.4s ease; }
        .mk-side-fallback { font-size: 80px; text-align: center; }
        .preg-text { font-family: 'Fredoka',sans-serif; font-size: 22px; font-weight: 600; color: #3D2A0E; margin-bottom: 24px; line-height: 1.3; }
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
        /* Contenido (tipo Khan Academy) */
        .contenido-wrap { max-width: 680px; }
        .contenido-tipo-badge { display: inline-block; font-family: 'Nunito',sans-serif; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; padding: 4px 12px; border-radius: 100px; margin-bottom: 16px; }
        .badge-intro { background: rgba(252,230,139,0.5); color: #6B4520; }
        .badge-dato { background: rgba(145,99,47,0.1); color: #8C6D45; }
        .badge-consejo { background: #EAF3DE; color: #3B6D11; }
        .contenido-titulo { font-family: 'Fredoka',sans-serif; font-size: 26px; font-weight: 600; color: #3D2A0E; margin-bottom: 16px; }
        .contenido-texto { font-family: 'Nunito',sans-serif; font-size: 16px; color: #5A3E1B; line-height: 1.85; white-space: pre-line; }
        .contenido-continuar { margin-top: 32px; display: flex; justify-content: flex-start; }
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
        @media (max-width: 640px) {
          .preg-layout { grid-template-columns: 1fr; }
          .preg-right { display: none; }
          .preg-text { font-size: 18px; }
        }
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

        {/* CONTENIDO (tipo Khan Academy) */}
        {fase === 'contenido' && contenidoActual && (
          <div className="lec-body">
            <div className="contenido-wrap">
              <span className={`contenido-tipo-badge badge-${contenidoActual.tipo}`}>
                {contenidoActual.tipo === 'intro' ? 'Introducción' : contenidoActual.tipo === 'dato' ? '💡 Dato' : '✅ Consejo'}
              </span>
              <h2 className="contenido-titulo">{contenidoActual.titulo}</h2>
              <p className="contenido-texto">{contenidoActual.texto}</p>
              <div className="contenido-continuar">
                <button className="accion-btn on" style={{ width: 'auto', padding: '14px 36px' }}
                  onClick={() => { setFase('pregunta'); setMonedokiPose(POSES_PREGUNTA[indice % POSES_PREGUNTA.length]) }}>
                  Continuar →
                </button>
              </div>
            </div>
          </div>
        )}

        {fase === 'contenido' && !contenidoActual && (() => {
          setFase('pregunta')
          setMonedokiPose(POSES_PREGUNTA[indice % POSES_PREGUNTA.length])
          return null
        })()}

        {/* COMPLETADO */}
        {fase === 'completado' && (
          <div className="lec-body">
            <div className="result-wrap">
              <img src={MONEDOKI_POSES.super} alt="" style={{ width: 120, margin: '0 auto 8px' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
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
              <img src={MONEDOKI_POSES.animo} alt="" style={{ width: 100, margin: '0 auto 8px' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
              <h2 className="result-h">¡Casi lo logras!</h2>
              <p className="result-sub">Obtuviste {Math.round((correctas / preguntas.length) * 100)}%. Necesitas al menos 60%. ¡Monedoki sabe que puedes!</p>
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
            <div className="preg-layout">
              <div className="preg-left">
                <p className="preg-text">{preguntaActual.pregunta}</p>
                <div className="opciones">
                  {preguntaActual.opciones.map((op, i) => {
                    let cls = 'op-btn'
                    if (confirmada) {
                      if (op === preguntaActual.respuesta_correcta) cls += ' ok'
                      else if (op === seleccionada) cls += ' mal'
                    } else if (op === seleccionada) cls += ' sel'
                    return (
                      <button key={i} className={cls} onClick={() => { if (!confirmada) setSeleccionada(op) }} disabled={confirmada}>
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
              <div className="preg-right">
                <img
                  src={MONEDOKI_POSES[monedokiPose]}
                  alt="Monedoki"
                  className="mk-side-img"
                  onError={e => {
                    const el = e.target as HTMLImageElement
                    el.style.display = 'none'
                    el.parentElement!.innerHTML = '<div class="mk-side-fallback">🦊</div>'
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

// =============================================
// COMPONENTES DE TIPOS DE PREGUNTA ADICIONALES
// =============================================

// Estos se importan dinámicamente según el tipo de pregunta

export function PreguntaOrdenar({ pregunta, opciones, respuestaCorrecta, onConfirm }: {
  pregunta: string
  opciones: string[]
  respuestaCorrecta: string
  onConfirm: (correcto: boolean, seleccion: string) => void
}) {
  const [items, setItems] = useState([...opciones].sort(() => Math.random() - 0.5))
  const [confirmado, setConfirmado] = useState(false)
  const [correcto, setCorrecto] = useState(false)
  const [dragIdx, setDragIdx] = useState<number | null>(null)

  const correctos = respuestaCorrecta.split('|')

  const handleDragStart = (i: number) => setDragIdx(i)
  const handleDrop = (i: number) => {
    if (dragIdx === null || dragIdx === i) return
    const newItems = [...items]
    const [moved] = newItems.splice(dragIdx, 1)
    newItems.splice(i, 0, moved)
    setItems(newItems)
    setDragIdx(null)
  }

  const handleConfirm = () => {
    const esCorrecta = items.every((item, i) => item === correctos[i])
    setCorrecto(esCorrecta)
    setConfirmado(true)
    onConfirm(esCorrecta, items.join('|'))
  }

  return (
    <div>
      <style>{`
        .orden-item { padding: 13px 18px; border-radius: 12px; border: 2px solid #E8D9B8; background: #FFFDF5; font-family: 'Nunito',sans-serif; font-size: 15px; color: #3D2A0E; margin-bottom: 8px; cursor: grab; display: flex; align-items: center; gap: 10px; transition: all 0.15s; user-select: none; }
        .orden-item:hover { border-color: #C8934A; }
        .orden-item.dragging { opacity: 0.5; }
        .orden-item.correcto { border-color: #3B6D11; background: #EAF3DE; }
        .orden-item.incorrecto { border-color: #993C1D; background: #FAECE7; }
        .orden-num { width: 24px; height: 24px; border-radius: 50%; background: rgba(252,230,139,0.5); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #6B4520; flex-shrink: 0; }
      `}</style>
      <p style={{ fontFamily: "'Nunito',sans-serif", fontSize: 13, color: '#A87840', marginBottom: 12 }}>
        🖱️ Arrastra los elementos para ordenarlos correctamente
      </p>
      {items.map((item, i) => (
        <div
          key={item}
          className={`orden-item ${confirmado ? (item === correctos[i] ? 'correcto' : 'incorrecto') : ''}`}
          draggable={!confirmado}
          onDragStart={() => handleDragStart(i)}
          onDragOver={e => e.preventDefault()}
          onDrop={() => handleDrop(i)}
        >
          <span className="orden-num">{i + 1}</span>
          {item}
        </div>
      ))}
      {!confirmado && (
        <button className="accion-btn on" style={{ marginTop: 16 }} onClick={handleConfirm}>
          Confirmar orden
        </button>
      )}
    </div>
  )
}

export function PreguntaDragDrop({ pregunta, opciones, respuestaCorrecta, onConfirm }: {
  pregunta: string
  opciones: { items: string[]; definitions: string[] }
  respuestaCorrecta: string
  onConfirm: (correcto: boolean, seleccion: string) => void
}) {
  const correctMap: Record<string, string> = {}
  respuestaCorrecta.split('|').forEach(pair => {
    const [item, def] = pair.split(':')
    correctMap[item] = def
  })

  const [assignments, setAssignments] = useState<Record<string, string>>({})
  const [dragging, setDragging] = useState<string | null>(null)
  const [confirmado, setConfirmado] = useState(false)

  const handleDrop = (def: string) => {
    if (!dragging) return
    setAssignments(prev => {
      const newA = { ...prev }
      // Remove from previous definition if assigned
      Object.keys(newA).forEach(k => { if (newA[k] === def) delete newA[k] })
      newA[dragging] = def
      return newA
    })
    setDragging(null)
  }

  const allAssigned = opciones.items.every(item => assignments[item])

  const handleConfirm = () => {
    const esCorrecta = opciones.items.every(item => assignments[item] === correctMap[item])
    setConfirmado(true)
    onConfirm(esCorrecta, JSON.stringify(assignments))
  }

  return (
    <div>
      <style>{`
        .dd-wrap { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 16px; }
        .dd-items { display: flex; flex-direction: column; gap: 8px; }
        .dd-item { padding: 10px 16px; border-radius: 10px; border: 2px solid #E8D9B8; background: #FFFDF5; font-family: 'Nunito',sans-serif; font-size: 14px; color: #3D2A0E; cursor: grab; transition: all 0.15s; font-weight: 600; }
        .dd-item:hover { border-color: #C8934A; transform: translateY(-1px); }
        .dd-item.asignado { opacity: 0.4; cursor: default; }
        .dd-defs { display: flex; flex-direction: column; gap: 8px; }
        .dd-def { min-height: 52px; padding: 10px 14px; border-radius: 10px; border: 2px dashed #E8D9B8; background: rgba(232,217,184,0.1); font-family: 'Nunito',sans-serif; font-size: 13px; color: #A87840; transition: all 0.15s; }
        .dd-def.over { border-color: #C8934A; background: rgba(252,230,139,0.1); }
        .dd-def.filled { border-style: solid; border-color: #6B4520; background: rgba(252,230,139,0.2); }
        .dd-def.correcto { border-color: #3B6D11; background: #EAF3DE; }
        .dd-def.incorrecto { border-color: #993C1D; background: #FAECE7; }
        .dd-chip { display: inline-block; background: #6B4520; color: #FCE68B; padding: 3px 10px; border-radius: 100px; font-size: 13px; font-weight: 600; margin-bottom: 4px; }
        .dd-label { color: #6B4520; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; font-family: 'Nunito',sans-serif; }
      `}</style>
      <p style={{ fontFamily: "'Nunito',sans-serif", fontSize: 13, color: '#A87840', marginBottom: 12 }}>
        🖱️ Arrastra cada concepto a su definición correcta
      </p>
      <div className="dd-wrap">
        <div>
          <p className="dd-label">Conceptos</p>
          <div className="dd-items">
            {opciones.items.map(item => (
              <div
                key={item}
                className={`dd-item ${assignments[item] ? 'asignado' : ''}`}
                draggable={!assignments[item] && !confirmado}
                onDragStart={() => setDragging(item)}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="dd-label">Definiciones</p>
          <div className="dd-defs">
            {opciones.definitions.map(def => {
              const assignedItem = Object.keys(assignments).find(k => assignments[k] === def)
              const isCorrect = confirmado && assignedItem && correctMap[assignedItem] === def
              const isWrong = confirmado && assignedItem && correctMap[assignedItem] !== def
              return (
                <div
                  key={def}
                  className={`dd-def ${assignedItem ? 'filled' : ''} ${isCorrect ? 'correcto' : ''} ${isWrong ? 'incorrecto' : ''}`}
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => !confirmado && handleDrop(def)}
                >
                  {assignedItem && <div className="dd-chip">{assignedItem}</div>}
                  <div>{def}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      {!confirmado && (
        <button
          className={`accion-btn ${allAssigned ? 'on' : 'off'}`}
          onClick={handleConfirm}
          disabled={!allAssigned}
        >
          Confirmar
        </button>
      )}
    </div>
  )
}
