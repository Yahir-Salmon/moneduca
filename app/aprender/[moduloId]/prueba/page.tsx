'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Pregunta {
  id: string
  tipo: 'multiple' | 'verdadero_falso' | 'completar'
  dificultad: number
  pregunta: string
  opciones: string[]
  respuesta_correcta: string
  explicacion: string
  unidad_id: string
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export default function PruebaModuloPage() {
  const params = useParams()
  const router = useRouter()
  const moduloId = params.moduloId as string

  const [moduloNombre, setModuloNombre] = useState('')
  const [preguntas, setPreguntas] = useState<Pregunta[]>([])
  const [indice, setIndice] = useState(0)
  const [seleccionada, setSeleccionada] = useState<string | null>(null)
  const [confirmada, setConfirmada] = useState(false)
  const [esCorrecta, setEsCorrecta] = useState(false)
  const [correctas, setCorrectas] = useState(0)
  const [fase, setFase] = useState<'intro' | 'pregunta' | 'feedback' | 'resultado'>('intro')
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [guardado, setGuardado] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/registro'); return }
      setUserId(user.id)

      const { data: modulo } = await supabase
        .from('modulos')
        .select('nombre')
        .eq('id', moduloId)
        .single()
      if (modulo) setModuloNombre(modulo.nombre)

      // Verificar que el módulo esté completo
      const { data: unidades } = await supabase
        .from('unidades')
        .select('id')
        .eq('modulo_id', moduloId)

      if (!unidades || unidades.length === 0) {
        router.push('/dashboard')
        return
      }

      const { data: progreso } = await supabase
        .from('progreso_unidad')
        .select('unidad_id, completada')
        .eq('user_id', user.id)
        .eq('modulo_id', moduloId)

      const completadas = progreso?.filter(p => p.completada).map(p => p.unidad_id) || []
      const todasCompletas = unidades.every(u => completadas.includes(u.id))

      if (!todasCompletas) {
        router.push('/dashboard')
        return
      }

      // Cargar preguntas de todas las unidades del módulo, priorizando dificultad alta
      const unidadIds = unidades.map(u => u.id)
      const { data: banco } = await supabase
        .from('preguntas')
        .select('*')
        .in('unidad_id', unidadIds)
        .in('tipo', ['multiple', 'verdadero_falso', 'completar'])

      if (banco && banco.length > 0) {
        // Seleccionar máx 2 preguntas por unidad, priorizando dificultad mayor
        const porUnidad: Record<string, typeof banco> = {}
        banco.forEach(p => {
          if (!porUnidad[p.unidad_id]) porUnidad[p.unidad_id] = []
          porUnidad[p.unidad_id].push(p)
        })

        let seleccionadas: typeof banco = []
        Object.values(porUnidad).forEach(grupo => {
          const ordenadas = grupo.sort((a, b) => b.dificultad - a.dificultad)
          seleccionadas.push(...ordenadas.slice(0, 2))
        })

        // Tomar máx 15 preguntas al azar
        const final = shuffle(seleccionadas).slice(0, 15).map(p => {
          const opciones = typeof p.opciones === 'string' ? JSON.parse(p.opciones) : p.opciones
          return {
            ...p,
            opciones: Array.isArray(opciones) ? shuffle(opciones) : opciones,
          }
        })

        setPreguntas(final)
      }

      setLoading(false)
    }
    init()
  }, [moduloId, router])

  const preguntaActual = preguntas[indice]
  const totalPreguntas = preguntas.length
  const progresoPct = totalPreguntas > 0 ? ((indice + (confirmada ? 1 : 0)) / totalPreguntas) * 100 : 0
  const puntajeFinal = totalPreguntas > 0 ? Math.round((correctas / totalPreguntas) * 100) : 0

  const confirmar = () => {
    if (!seleccionada || confirmada) return
    const correcto = seleccionada === preguntaActual.respuesta_correcta
    setConfirmada(true)
    setEsCorrecta(correcto)
    if (correcto) setCorrectas(prev => prev + 1)
    setFase('feedback')
  }

  const guardarResultado = useCallback(async (puntaje: number) => {
    if (!userId || guardado) return
    setGuardado(true)
    const aprobado = puntaje >= 70
    await supabase.from('pruebas_modulo').upsert({
      user_id: userId,
      modulo_id: moduloId,
      puntaje,
      aprobado,
      completada_en: new Date().toISOString(),
    }, { onConflict: 'user_id,modulo_id' })
  }, [userId, moduloId, guardado])

  const siguiente = async () => {
    if (indice + 1 >= totalPreguntas) {
      await guardarResultado(puntajeFinal)
      setFase('resultado')
    } else {
      setIndice(prev => prev + 1)
      setSeleccionada(null)
      setConfirmada(false)
      setEsCorrecta(false)
      setFase('pregunta')
    }
  }

  const reintentar = () => {
    setPreguntas(prev => shuffle(prev).map(p => ({
      ...p,
      opciones: shuffle(p.opciones as string[]),
    })))
    setIndice(0)
    setSeleccionada(null)
    setConfirmada(false)
    setEsCorrecta(false)
    setCorrectas(0)
    setFase('pregunta')
    setGuardado(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF8E8' }}>
      <p style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 20, color: '#6B4520' }}>Preparando prueba...</p>
    </div>
  )

  if (preguntas.length === 0) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FFF8E8', gap: 16, padding: 24 }}>
      <p style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 20, color: '#6B4520', textAlign: 'center' }}>
        No hay preguntas disponibles para esta prueba aún.
      </p>
      <button
        onClick={() => router.push('/dashboard')}
        style={{ padding: '12px 28px', borderRadius: 100, background: '#6B4520', color: '#FCE68B', border: 'none', fontFamily: "'Fredoka',sans-serif", fontSize: 16, cursor: 'pointer' }}
      >
        Volver al inicio
      </button>
    </div>
  )

  return (
    <>
      <style>{`
        .prueba-wrap {
          position: fixed; top: 68px; left: 0; right: 0; bottom: 0;
          background: #FFF8E8; display: flex; flex-direction: column; overflow: hidden;
        }
        .prueba-header {
          background: #FFFDF5; border-bottom: 1px solid #E8D9B8;
          padding: 14px 24px; display: flex; align-items: center; gap: 14px; flex-shrink: 0;
        }
        .prueba-titulo-header {
          font-family: 'Fredoka',sans-serif; font-size: 14px; color: #3D2A0E;
          font-weight: 600; white-space: nowrap;
        }
        .prueba-badge {
          background: #3D2A0E; color: #FCE68B; font-family: 'Fredoka',sans-serif;
          font-size: 12px; padding: 4px 12px; border-radius: 100px; white-space: nowrap; flex-shrink: 0;
        }
        .prog-bar-wrap { flex: 1; height: 8px; background: rgba(232,217,184,0.5); border-radius: 100px; overflow: hidden; }
        .prog-bar-fill { height: 100%; background: #3D2A0E; border-radius: 100px; transition: width 0.4s ease; }
        .prog-count { font-family: 'Fredoka',sans-serif; font-size: 13px; color: #8C6D45; white-space: nowrap; flex-shrink: 0; }

        .prueba-body { flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch; }
        .prueba-inner { max-width: 680px; margin: 0 auto; padding: 40px 24px 80px; }

        /* Intro */
        .prueba-intro { text-align: center; }
        .intro-icon {
          width: 72px; height: 72px; background: #3D2A0E; border-radius: 20px;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 24px; font-size: 32px;
        }
        .intro-h { font-family: 'Fredoka',sans-serif; font-size: 28px; color: #3D2A0E; margin-bottom: 10px; }
        .intro-sub { font-family: 'Nunito',sans-serif; font-size: 16px; color: #8C6D45; margin-bottom: 32px; line-height: 1.6; }
        .intro-items { list-style: none; text-align: left; background: #FFFDF5; border: 1px solid #E8D9B8; border-radius: 16px; padding: 24px; margin-bottom: 32px; display: flex; flex-direction: column; gap: 12px; }
        .intro-item { font-family: 'Nunito',sans-serif; font-size: 15px; color: #5A3E1B; display: flex; align-items: center; gap: 10px; }
        .intro-dot { width: 7px; height: 7px; border-radius: 50%; background: #C8934A; flex-shrink: 0; }

        /* Pregunta */
        .preg-numero { font-family: 'Nunito',sans-serif; font-size: 12px; font-weight: 700; color: #A87840; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 16px; }
        .preg-text { font-family: 'Fredoka',sans-serif; font-size: 22px; font-weight: 600; color: #3D2A0E; margin-bottom: 24px; line-height: 1.3; }
        .opciones { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
        .op-btn {
          text-align: left; padding: 14px 18px; border-radius: 14px;
          border: 2px solid #E8D9B8; background: #FFFDF5;
          font-family: 'Nunito',sans-serif; font-size: 15px; color: #3D2A0E;
          cursor: pointer; transition: all 0.15s; line-height: 1.4;
        }
        .op-btn:hover:not(:disabled) { border-color: #C8934A; background: rgba(252,230,139,0.15); }
        .op-btn.sel { border-color: #6B4520; background: rgba(252,230,139,0.2); }
        .op-btn.ok { border-color: #3B6D11; background: #EAF3DE; color: #27500A; }
        .op-btn.mal { border-color: #993C1D; background: #FAECE7; color: #712B13; }

        .feedback-box { border-radius: 14px; padding: 14px 16px; margin-bottom: 20px; font-family: 'Nunito',sans-serif; font-size: 14px; line-height: 1.6; }
        .fb-ok { background: #EAF3DE; border: 1.5px solid #C0DD97; color: #27500A; }
        .fb-mal { background: #FAECE7; border: 1.5px solid #F0997B; color: #712B13; }

        .accion-btn {
          width: 100%; padding: 14px; border-radius: 100px; border: none;
          font-family: 'Fredoka',sans-serif; font-size: 17px; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
        }
        .accion-btn.on { background: #6B4520; color: #FCE68B; }
        .accion-btn.on:hover { background: #3D2A0E; }
        .accion-btn.off { background: #E8D9B8; color: #A87840; cursor: default; }
        .accion-btn.next { background: #6B4520; color: #FCE68B; }

        /* Resultado */
        .resultado-wrap { text-align: center; padding: 16px; }
        .resultado-score {
          width: 120px; height: 120px; border-radius: 50%;
          border: 4px solid #6B4520; display: flex; flex-direction: column;
          align-items: center; justify-content: center; margin: 0 auto 24px;
        }
        .score-num { font-family: 'Fredoka',sans-serif; font-size: 36px; color: #3D2A0E; line-height: 1; }
        .score-label { font-family: 'Nunito',sans-serif; font-size: 11px; color: #8C6D45; }
        .resultado-h { font-family: 'Fredoka',sans-serif; font-size: 26px; color: #3D2A0E; margin-bottom: 8px; }
        .resultado-sub { font-family: 'Nunito',sans-serif; font-size: 15px; color: #8C6D45; margin-bottom: 28px; line-height: 1.6; }
        .stats-fila { display: flex; justify-content: center; gap: 14px; margin-bottom: 28px; flex-wrap: wrap; }
        .stat-caja { background: #FFFDF5; border: 1px solid #E8D9B8; border-radius: 14px; padding: 14px 20px; text-align: center; min-width: 90px; }
        .stat-n { font-family: 'Fredoka',sans-serif; font-size: 28px; color: #6B4520; }
        .stat-l { font-family: 'Nunito',sans-serif; font-size: 11px; color: #A87840; margin-top: 2px; }
        .btns-col { display: flex; flex-direction: column; gap: 10px; max-width: 340px; margin: 0 auto; }
        .sec-btn {
          padding: 12px; border-radius: 100px; border: 2px solid #E8D9B8;
          background: transparent; font-family: 'Fredoka',sans-serif; font-size: 15px;
          color: #8C6D45; cursor: pointer; transition: all 0.2s;
        }
        .sec-btn:hover { border-color: #C8934A; color: #6B4520; }

        @media (max-width: 640px) {
          .preg-text { font-size: 18px; }
          .prueba-titulo-header { display: none; }
        }
      `}</style>

      <div className="prueba-wrap">
        {/* Header */}
        <div className="prueba-header">
          <button
            onClick={() => router.push('/dashboard')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#8C6D45', flexShrink: 0 }}
          >
            ✕
          </button>
          <span className="prueba-titulo-header">{moduloNombre}</span>
          <span className="prueba-badge">Prueba final</span>
          {fase !== 'intro' && fase !== 'resultado' && (
            <>
              <div className="prog-bar-wrap">
                <div className="prog-bar-fill" style={{ width: `${progresoPct}%` }} />
              </div>
              <span className="prog-count">{indice + 1}/{totalPreguntas}</span>
            </>
          )}
        </div>

        <div className="prueba-body">
          <div className="prueba-inner">

            {/* Pantalla de intro */}
            {fase === 'intro' && (
              <div className="prueba-intro">
                <div className="intro-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FCE68B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <h1 className="intro-h">Prueba final: {moduloNombre}</h1>
                <p className="intro-sub">
                  Demuestra que dominas los conceptos de este módulo.
                  Necesitas obtener al menos 70% para aprobar.
                </p>
                <ul className="intro-items">
                  <li className="intro-item"><span className="intro-dot" />{totalPreguntas} preguntas de todas las unidades</li>
                  <li className="intro-item"><span className="intro-dot" />Sin límite de tiempo</li>
                  <li className="intro-item"><span className="intro-dot" />Verás la explicación de cada respuesta</li>
                  <li className="intro-item"><span className="intro-dot" />Puedes repetirla si no apruebas</li>
                </ul>
                <button
                  className="accion-btn on"
                  style={{ maxWidth: 280, margin: '0 auto' }}
                  onClick={() => setFase('pregunta')}
                >
                  Comenzar prueba
                </button>
              </div>
            )}

            {/* Pregunta activa */}
            {(fase === 'pregunta' || fase === 'feedback') && preguntaActual && (
              <div>
                <p className="preg-numero">Pregunta {indice + 1} de {totalPreguntas}</p>
                <p className="preg-text">{preguntaActual.pregunta}</p>

                <div className="opciones">
                  {(preguntaActual.opciones as string[]).map((op, i) => {
                    let cls = 'op-btn'
                    if (confirmada) {
                      if (op === preguntaActual.respuesta_correcta) cls += ' ok'
                      else if (op === seleccionada) cls += ' mal'
                    } else if (op === seleccionada) cls += ' sel'
                    return (
                      <button
                        key={i}
                        className={cls}
                        onClick={() => { if (!confirmada) setSeleccionada(op) }}
                        disabled={confirmada}
                      >
                        {op}
                      </button>
                    )
                  })}
                </div>

                {fase === 'feedback' && (
                  <div className={`feedback-box ${esCorrecta ? 'fb-ok' : 'fb-mal'}`}>
                    <strong>{esCorrecta ? 'Correcto.' : 'Incorrecto.'}</strong>{' '}
                    {preguntaActual.explicacion}
                  </div>
                )}

                {fase === 'pregunta' ? (
                  <button
                    className={`accion-btn ${seleccionada ? 'on' : 'off'}`}
                    onClick={confirmar}
                    disabled={!seleccionada}
                  >
                    Confirmar respuesta
                  </button>
                ) : (
                  <button className="accion-btn next" onClick={siguiente}>
                    {indice + 1 >= totalPreguntas ? 'Ver resultados' : 'Siguiente'}
                  </button>
                )}
              </div>
            )}

            {/* Resultado */}
            {fase === 'resultado' && (
              <div className="resultado-wrap">
                <div className="resultado-score" style={{ borderColor: puntajeFinal >= 70 ? '#3B6D11' : '#993C1D' }}>
                  <span className="score-num" style={{ color: puntajeFinal >= 70 ? '#3B6D11' : '#993C1D' }}>{puntajeFinal}%</span>
                  <span className="score-label">puntaje</span>
                </div>

                <h2 className="resultado-h">
                  {puntajeFinal >= 70 ? 'Módulo aprobado' : 'Intenta de nuevo'}
                </h2>
                <p className="resultado-sub">
                  {puntajeFinal >= 70
                    ? `Respondiste correctamente ${correctas} de ${totalPreguntas} preguntas. Dominas el módulo.`
                    : `Respondiste correctamente ${correctas} de ${totalPreguntas} preguntas. Necesitas al menos 70% para aprobar.`}
                </p>

                <div className="stats-fila">
                  <div className="stat-caja">
                    <div className="stat-n" style={{ color: '#3B6D11' }}>{correctas}</div>
                    <div className="stat-l">correctas</div>
                  </div>
                  <div className="stat-caja">
                    <div className="stat-n" style={{ color: '#993C1D' }}>{totalPreguntas - correctas}</div>
                    <div className="stat-l">incorrectas</div>
                  </div>
                  <div className="stat-caja">
                    <div className="stat-n">{totalPreguntas}</div>
                    <div className="stat-l">total</div>
                  </div>
                </div>

                <div className="btns-col">
                  <button className="accion-btn on" onClick={() => router.push('/dashboard')}>
                    Volver al inicio
                  </button>
                  {puntajeFinal < 70 && (
                    <button className="sec-btn" onClick={reintentar}>
                      Repetir prueba
                    </button>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  )
}
