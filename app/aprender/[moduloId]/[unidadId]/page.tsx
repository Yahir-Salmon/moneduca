'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { PreguntaOrdenar } from '@/components/leccion/PreguntaOrdenar'
import { PreguntaDragDrop } from '@/components/leccion/PreguntaDragDrop'

interface Pregunta {
  id: string
  tipo: string
  dificultad: number
  pregunta: string
  opciones: string[] | { items: string[]; definitions: string[] }
  respuesta_correcta: string
  explicacion: string
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

const POSES_ROTACION: (keyof typeof MONEDOKI_POSES)[] = ['neutral', 'pensar', 'sorpresa', 'neutral', 'pensar', 'sorpresa', 'neutral']

function shuffleOpciones(opciones: string[], respuestaCorrecta: string): { opciones: string[]; respuesta: string } {
  const mezcladas = [...opciones].sort(() => Math.random() - 0.5)
  return { opciones: mezcladas, respuesta: respuestaCorrecta }
}

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

function getContenidoPlantilla(unidadId: string, idx: number): Contenido | null {
  const contenidos: Record<string, Contenido[]> = {
    'bases-1': [
      { tipo: 'intro', titulo: '¿Qué es el dinero?', texto: 'El dinero es una herramienta que los seres humanos inventamos para facilitar el intercambio de bienes y servicios. Antes de que existiera, las personas usaban el trueque: intercambiaban directamente lo que tenían por lo que necesitaban.\n\nImagina que eres agricultor y tienes manzanas, pero necesitas zapatos. Con el trueque, tendrías que encontrar a un zapatero que quisiera manzanas exactamente cuando tú necesitas zapatos. El dinero resolvió ese problema al crear un intermediario universal que todos aceptamos como forma de pago.' },
      { tipo: 'dato', titulo: 'Contexto histórico', texto: 'Las primeras formas de dinero no eran monedas ni billetes. En diferentes culturas se usaron conchas marinas, dientes de ballena, piedras enormes y sal. De ahí viene la palabra "salario".\n\nLo importante no era el material, sino que todos en esa comunidad acordaban que ese objeto tenía valor.' },
    ],
    'bases-2': [
      { tipo: 'intro', titulo: 'El trueque y sus problemas', texto: 'Antes del dinero, las sociedades usaban el trueque: intercambiar bienes directamente. Si tenías pescado y querías pan, necesitabas encontrar a alguien con pan que quisiera tu pescado.\n\nEste sistema tenía un problema enorme llamado "doble coincidencia de necesidades": ambas personas debían querer lo que la otra ofrecía, al mismo tiempo y en cantidades equivalentes.' },
    ],
    'presupuesto-1': [
      { tipo: 'intro', titulo: '¿Qué es un presupuesto?', texto: 'Un presupuesto es simplemente un plan para tu dinero. Es decidir de antemano a dónde va a ir cada peso que recibes. Sin un presupuesto, el dinero simplemente desaparece sin que sepas en qué se fue.\n\nHacer un presupuesto tiene tres pasos básicos: primero conocer tus ingresos, luego identificar tus gastos y finalmente asegurarte de que lo que entra sea mayor que lo que sale.' },
      { tipo: 'consejo', titulo: 'Consejo práctico', texto: 'Para hacer tu primer presupuesto, lleva un registro de todo lo que gastas durante una semana. Anota cada compra, por pequeña que sea: el transporte, la comida, el antojo.\n\nAl final de la semana te sorprenderá ver a dónde fue tu dinero. Ese es el primer paso para controlarlo.' },
    ],
  }
  const plantilla: Contenido[] = contenidos[unidadId] || [
    { tipo: 'intro', titulo: 'Introducción al tema', texto: 'En esta unidad exploraremos conceptos fundamentales de finanzas personales. El conocimiento financiero es una habilidad para toda la vida — no importa cuánto dinero tengas ahora, entender cómo funciona te dará ventajas enormes en el futuro.\n\nLee con atención y reflexiona cómo estos conceptos aplican a tu vida diaria.' },
    { tipo: 'dato', titulo: 'Contexto importante', texto: 'La mayoría de los adultos nunca recibió educación financiera formal. Aprender estas habilidades ahora te pone en una posición privilegiada.\n\nEstudios muestran que las personas con conocimientos financieros básicos toman mejores decisiones, tienen menos deudas y logran sus metas más rápido.' },
  ]
  return idx < plantilla.length ? plantilla[idx] : null
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
  const [esCorrecta, setEsCorrecta] = useState(false)
  const [correctas, setCorrectas] = useState(0)
  const [errores, setErrores] = useState(0)
  const [monedokiPose, setMonedokiPose] = useState<keyof typeof MONEDOKI_POSES>('neutral')
  const [unidadNombre, setUnidadNombre] = useState('')
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [guardado, setGuardado] = useState(false)
  const [contenidoIdx, setContenidoIdx] = useState(0)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/registro'); return }
      setUserId(user.id)

      const { data: unidad } = await supabase.from('unidades').select('nombre').eq('id', unidadId).single()
      if (unidad) setUnidadNombre(unidad.nombre)

      const { data: prog } = await supabase.from('progreso_unidad').select('nivel_actual').eq('user_id', user.id).eq('unidad_id', unidadId).single()
      const nivel = prog?.nivel_actual || 1

      const { data: banco } = await supabase.from('preguntas').select('*').eq('unidad_id', unidadId).lte('dificultad', Math.min(nivel + 1, 3))

      if (banco && banco.length > 0) {
        const porTipo: Record<string, typeof banco> = {}
        banco.forEach(p => {
          if (!porTipo[p.tipo]) porTipo[p.tipo] = []
          porTipo[p.tipo].push(p)
        })
        let seleccionadas: typeof banco = []
        Object.values(porTipo).forEach(grupo => {
          const rand = grupo[Math.floor(Math.random() * grupo.length)]
          seleccionadas.push(rand)
        })
        const restantes = banco.filter(p => !seleccionadas.find(s => s.id === p.id)).sort(() => Math.random() - 0.5)
        seleccionadas = [...seleccionadas, ...restantes].slice(0, 7).sort(() => Math.random() - 0.5)

        const procesadas = seleccionadas.map(p => {
          const opciones = typeof p.opciones === 'string' ? JSON.parse(p.opciones) : p.opciones
          if (['multiple', 'completar', 'verdadero_falso'].includes(p.tipo) && Array.isArray(opciones)) {
            const { opciones: mezcladas } = shuffleOpciones(opciones, p.respuesta_correcta)
            return { ...p, opciones: mezcladas }
          }
          return { ...p, opciones }
        })
        setPreguntas(procesadas)
      }
      setLoading(false)
    }
    init()
  }, [moduloId, unidadId, router])

  const preguntaActual = preguntas[indice]
  const progresoPct = preguntas.length > 0 ? ((indice + (confirmada ? 1 : 0)) / preguntas.length) * 100 : 0

  const handleConfirmarMultiple = () => {
    if (!seleccionada || confirmada) return
    setConfirmada(true)
    const correcto = seleccionada === preguntaActual.respuesta_correcta
    setEsCorrecta(correcto)
    if (correcto) { setCorrectas(prev => prev + 1); setMonedokiPose('feliz'); playSound('correct') }
    else { setErrores(prev => prev + 1); setMonedokiPose(errores >= 2 ? 'triste' : 'animo'); playSound('incorrect') }
    setFase('feedback')
  }

  const handleConfirmarTipo = (correcto: boolean) => {
    setConfirmada(true); setEsCorrecta(correcto)
    if (correcto) { setCorrectas(prev => prev + 1); setMonedokiPose('feliz'); playSound('correct') }
    else { setErrores(prev => prev + 1); setMonedokiPose(errores >= 2 ? 'triste' : 'animo'); playSound('incorrect') }
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

    // Actualizar racha al completar una unidad
    if (aprobado) {
      await supabase.rpc('actualizar_racha', { p_user_id: userId })
    }
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
      setIndice(nextIdx); setSeleccionada(null); setConfirmada(false); setEsCorrecta(false)
      const nextContenido = getContenidoPlantilla(unidadId, contenidoIdx + 1)
      if (nextIdx % 3 === 0 && nextContenido) {
        setContenidoIdx(prev => prev + 1); setFase('contenido')
      } else {
        setFase('pregunta'); setMonedokiPose(POSES_ROTACION[nextIdx % POSES_ROTACION.length])
      }
    }
  }

  const handleReintentar = () => {
    setPreguntas(prev => [...prev].sort(() => Math.random() - 0.5).map(p => {
      if (['multiple', 'completar', 'verdadero_falso'].includes(p.tipo) && Array.isArray(p.opciones)) {
        const { opciones } = shuffleOpciones(p.opciones as string[], p.respuesta_correcta)
        return { ...p, opciones }
      }
      return p
    }))
    setIndice(0); setSeleccionada(null); setConfirmada(false); setEsCorrecta(false)
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

  const contenidoActual = getContenidoPlantilla(unidadId, contenidoIdx)

  return (
    <>
      <style>{`
        /* Wrapper ocupa toda la pantalla después del navbar */
        .lec-wrap {
          position: fixed;
          top: 68px;
          left: 0; right: 0; bottom: 0;
          background: #FFF8E8;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        /* Header pegado arriba dentro del wrapper */
        .lec-header {
          background: #FFFDF5;
          border-bottom: 1px solid #E8D9B8;
          padding: 12px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }
        .lec-titulo { font-family: 'Fredoka',sans-serif; font-size: 14px; font-weight: 600; color: #3D2A0E; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px; flex-shrink: 0; }
        .prog-wrap { flex: 1; height: 10px; background: rgba(232,217,184,0.5); border-radius: 100px; overflow: hidden; }
        .prog-fill { height: 100%; background: #6B4520; border-radius: 100px; transition: width 0.4s ease; }
        .prog-label { font-family: 'Fredoka',sans-serif; font-size: 13px; color: #8C6D45; white-space: nowrap; flex-shrink: 0; }
        /* Área scrollable */
        .lec-body {
          flex: 1;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }
        .lec-inner { max-width: 860px; margin: 0 auto; padding: 28px 24px 60px; }
        /* Layout pregunta */
        .preg-layout { display: grid; grid-template-columns: 1fr 160px; gap: 28px; align-items: start; }
        .preg-right { display: flex; justify-content: center; padding-top: 8px; }
        .mk-side { width: 140px; height: 140px; object-fit: contain; transition: all 0.4s ease; }
        .preg-text { font-family: 'Fredoka',sans-serif; font-size: 20px; font-weight: 600; color: #3D2A0E; margin-bottom: 20px; line-height: 1.3; }
        .opciones { display: flex; flex-direction: column; gap: 9px; margin-bottom: 16px; }
        .op-btn { text-align: left; padding: 13px 16px; border-radius: 14px; border: 2px solid #E8D9B8; background: #FFFDF5; font-family: 'Nunito',sans-serif; font-size: 15px; color: #3D2A0E; cursor: pointer; transition: all 0.15s; line-height: 1.4; }
        .op-btn:hover:not(:disabled) { border-color: #C8934A; background: rgba(252,230,139,0.15); }
        .op-btn.sel { border-color: #6B4520; background: rgba(252,230,139,0.25); }
        .op-btn.ok { border-color: #3B6D11; background: #EAF3DE; color: #27500A; }
        .op-btn.mal { border-color: #993C1D; background: #FAECE7; color: #712B13; }
        .feedback { border-radius: 14px; padding: 13px 16px; margin-bottom: 16px; font-family: 'Nunito',sans-serif; font-size: 14px; line-height: 1.6; }
        .fb-ok { background: #EAF3DE; border: 1.5px solid #C0DD97; color: #27500A; }
        .fb-mal { background: #FAECE7; border: 1.5px solid #F0997B; color: #712B13; }
        .accion-btn { width: 100%; padding: 14px; border-radius: 100px; border: none; font-family: 'Fredoka',sans-serif; font-size: 17px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .accion-btn.on { background: #6B4520; color: #FCE68B; }
        .accion-btn.on:hover { background: #3D2A0E; transform: translateY(-1px); }
        .accion-btn.off { background: #E8D9B8; color: #A87840; cursor: default; }
        .accion-btn.next { background: #6B4520; color: #FCE68B; }
        .contenido-wrap { max-width: 680px; }
        .contenido-badge { display: inline-block; font-family: 'Nunito',sans-serif; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; padding: 4px 12px; border-radius: 100px; margin-bottom: 14px; }
        .badge-intro { background: rgba(252,230,139,0.5); color: #6B4520; }
        .badge-dato { background: rgba(145,99,47,0.1); color: #8C6D45; }
        .badge-consejo { background: #EAF3DE; color: #3B6D11; }
        .contenido-titulo { font-family: 'Fredoka',sans-serif; font-size: 24px; font-weight: 600; color: #3D2A0E; margin-bottom: 14px; }
        .contenido-texto { font-family: 'Nunito',sans-serif; font-size: 16px; color: #5A3E1B; line-height: 1.85; white-space: pre-line; }
        .result-wrap { text-align: center; padding: 24px 16px; }
        .result-stars { font-size: 44px; margin: 10px 0; }
        .result-h { font-family: 'Fredoka',sans-serif; font-size: 26px; color: #3D2A0E; margin-bottom: 8px; }
        .result-sub { font-family: 'Nunito',sans-serif; font-size: 14px; color: #8C6D45; margin-bottom: 24px; }
        .stats-row { display: flex; justify-content: center; gap: 14px; margin-bottom: 24px; flex-wrap: wrap; }
        .stat-b { background: #FFFDF5; border: 1px solid #E8D9B8; border-radius: 14px; padding: 12px 18px; text-align: center; }
        .stat-n { font-family: 'Fredoka',sans-serif; font-size: 26px; color: #6B4520; }
        .stat-l { font-family: 'Nunito',sans-serif; font-size: 11px; color: #A87840; }
        .btns-col { display: flex; flex-direction: column; gap: 10px; max-width: 320px; margin: 0 auto; }
        .sec-btn { padding: 12px; border-radius: 100px; border: 2px solid #E8D9B8; background: transparent; font-family: 'Fredoka',sans-serif; font-size: 15px; color: #8C6D45; cursor: pointer; }
        @media (max-width: 640px) {
          .preg-layout { grid-template-columns: 1fr; }
          .preg-right { display: none; }
          .preg-text { font-size: 17px; }
          .lec-titulo { max-width: 120px; }
        }
      `}</style>

      <div className="lec-wrap">
        <div className="lec-header">
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#8C6D45', flexShrink: 0 }}>✕</button>
          <span className="lec-titulo">{unidadNombre}</span>
          <div className="prog-wrap"><div className="prog-fill" style={{ width: `${progresoPct}%` }} /></div>
          <span className="prog-label">{indice + 1}/{preguntas.length}</span>
        </div>

        <div className="lec-body">
          <div className="lec-inner">

            {fase === 'contenido' && contenidoActual && (
              <div className="contenido-wrap">
                <span className={`contenido-badge badge-${contenidoActual.tipo}`}>
                  {contenidoActual.tipo === 'intro' ? 'Introducción' : contenidoActual.tipo === 'dato' ? 'Contexto' : 'Consejo'}
                </span>
                <h2 className="contenido-titulo">{contenidoActual.titulo}</h2>
                <p className="contenido-texto">{contenidoActual.texto}</p>
                <div style={{ marginTop: 28 }}>
                  <button className="accion-btn on" style={{ maxWidth: 260 }}
                    onClick={() => { setFase('pregunta'); setMonedokiPose(POSES_ROTACION[0]) }}>
                    Continuar →
                  </button>
                </div>
              </div>
            )}

            {fase === 'contenido' && !contenidoActual && (() => {
              setTimeout(() => { setFase('pregunta'); setMonedokiPose(POSES_ROTACION[0]) }, 0)
              return <div style={{ padding: 40, textAlign: 'center', color: '#A87840', fontFamily: "'Fredoka',sans-serif" }}>Cargando...</div>
            })()}

            {fase === 'completado' && (
              <div className="result-wrap">
                <img src={MONEDOKI_POSES.super} alt="" style={{ width: 110, margin: '0 auto 8px' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
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
            )}

            {fase === 'repaso' && (
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
            )}

            {(fase === 'pregunta' || fase === 'feedback') && preguntaActual && (
              <div className="preg-layout">
                <div>
                  <p className="preg-text">{preguntaActual.pregunta}</p>

                  {(preguntaActual.tipo === 'multiple' || preguntaActual.tipo === 'completar' || preguntaActual.tipo === 'verdadero_falso') && (
                    <>
                      <div className="opciones">
                        {(preguntaActual.opciones as string[]).map((op, i) => {
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
                        <div className={`feedback ${esCorrecta ? 'fb-ok' : 'fb-mal'}`}>
                          <strong>{esCorrecta ? '✅ ¡Correcto!' : '❌ Respuesta incorrecta'}</strong>
                          <br />{preguntaActual.explicacion}
                        </div>
                      )}
                      {fase === 'pregunta'
                        ? <button className={`accion-btn ${seleccionada ? 'on' : 'off'}`} onClick={handleConfirmarMultiple} disabled={!seleccionada}>Confirmar respuesta</button>
                        : <button className="accion-btn next" onClick={handleSiguiente}>{indice + 1 >= preguntas.length ? 'Ver resultados →' : 'Siguiente →'}</button>
                      }
                    </>
                  )}

                  {preguntaActual.tipo === 'ordenar' && fase === 'pregunta' && (
                    <PreguntaOrdenar opciones={preguntaActual.opciones as string[]} respuestaCorrecta={preguntaActual.respuesta_correcta} onConfirm={handleConfirmarTipo} />
                  )}
                  {preguntaActual.tipo === 'ordenar' && fase === 'feedback' && (
                    <>
                      <div className={`feedback ${esCorrecta ? 'fb-ok' : 'fb-mal'}`}>
                        <strong>{esCorrecta ? '✅ ¡Orden correcto!' : '❌ El orden no era el correcto'}</strong>
                        <br />{preguntaActual.explicacion}
                      </div>
                      <button className="accion-btn next" onClick={handleSiguiente}>{indice + 1 >= preguntas.length ? 'Ver resultados →' : 'Siguiente →'}</button>
                    </>
                  )}

                  {preguntaActual.tipo === 'drag_and_drop' && fase === 'pregunta' && (
                    <PreguntaDragDrop opciones={preguntaActual.opciones as { items: string[]; definitions: string[] }} respuestaCorrecta={preguntaActual.respuesta_correcta} onConfirm={handleConfirmarTipo} />
                  )}
                  {preguntaActual.tipo === 'drag_and_drop' && fase === 'feedback' && (
                    <>
                      <div className={`feedback ${esCorrecta ? 'fb-ok' : 'fb-mal'}`}>
                        <strong>{esCorrecta ? '✅ ¡Perfecto!' : '❌ Algunas no estaban correctas'}</strong>
                        <br />{preguntaActual.explicacion}
                      </div>
                      <button className="accion-btn next" onClick={handleSiguiente}>{indice + 1 >= preguntas.length ? 'Ver resultados →' : 'Siguiente →'}</button>
                    </>
                  )}
                </div>

                <div className="preg-right">
                  <img src={MONEDOKI_POSES[monedokiPose]} alt="Monedoki" className="mk-side"
                    onError={e => { const el = e.target as HTMLImageElement; el.style.display = 'none'; if (el.parentElement) el.parentElement.innerHTML = '<div style="font-size:70px;text-align:center">🦊</div>' }}
                  />
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  )
}
