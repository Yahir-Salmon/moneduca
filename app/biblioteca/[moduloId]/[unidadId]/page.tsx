'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Contenido {
  id: string
  unidad_id: string
  orden: number
  titulo: string
  texto: string
  tipo: 'intro' | 'dato' | 'consejo' | 'ejemplo'
}

interface Unidad {
  id: string
  modulo_id: string
  nombre: string
  descripcion: string
  orden: number
}

interface Modulo {
  id: string
  nombre: string
  orden: number
}

const TIPO_LABEL: Record<string, string> = {
  intro: 'Introducción',
  dato: 'Contexto',
  consejo: 'Consejo',
  ejemplo: 'Ejemplo',
}

const TIPO_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  intro: { bg: 'rgba(252,230,139,0.3)', color: '#6B4520', border: 'rgba(250,191,77,0.4)' },
  dato: { bg: 'rgba(145,99,47,0.08)', color: '#8C6D45', border: '#E8D9B8' },
  consejo: { bg: '#EAF3DE', color: '#3B6D11', border: '#C0DD97' },
  ejemplo: { bg: 'rgba(200,147,74,0.1)', color: '#6B4520', border: '#C8934A' },
}

export default function LecturaUnidadPage() {
  const params = useParams()
  const router = useRouter()
  const moduloId = params.moduloId as string
  const unidadId = params.unidadId as string

  const [unidad, setUnidad] = useState<Unidad | null>(null)
  const [modulo, setModulo] = useState<Modulo | null>(null)
  const [contenidos, setContenidos] = useState<Contenido[]>([])
  const [unidadAnterior, setUnidadAnterior] = useState<Unidad | null>(null)
  const [unidadSiguiente, setUnidadSiguiente] = useState<Unidad | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/registro'); return }

      const [
        { data: unidadData },
        { data: moduloData },
        { data: contenidosData },
        { data: todasUnidades },
      ] = await Promise.all([
        supabase.from('unidades').select('*').eq('id', unidadId).single(),
        supabase.from('modulos').select('*').eq('id', moduloId).single(),
        supabase.from('contenidos').select('*').eq('unidad_id', unidadId).order('orden'),
        supabase.from('unidades').select('*').eq('modulo_id', moduloId).order('orden'),
      ])

      setUnidad(unidadData)
      setModulo(moduloData)
      setContenidos(contenidosData || [])

      if (todasUnidades && unidadData) {
        const idx = todasUnidades.findIndex(u => u.id === unidadId)
        setUnidadAnterior(idx > 0 ? todasUnidades[idx - 1] : null)
        setUnidadSiguiente(idx < todasUnidades.length - 1 ? todasUnidades[idx + 1] : null)
      }

      setLoading(false)
    }
    init()
  }, [moduloId, unidadId, router])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF8E8' }}>
      <p style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 20, color: '#6B4520' }}>Cargando...</p>
    </div>
  )

  if (!unidad) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FFF8E8', gap: 16 }}>
      <p style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 18, color: '#6B4520' }}>Unidad no encontrada.</p>
      <Link href="/biblioteca" style={{ color: '#C8934A', fontFamily: "'Nunito',sans-serif" }}>Volver a la biblioteca</Link>
    </div>
  )

  return (
    <>
      <style>{`
        .lec-read-wrap { min-height: 100vh; background: #FFF8E8; padding-top: 68px; }

        /* Barra superior */
        .lec-read-top { background: #FFFDF5; border-bottom: 1px solid #E8D9B8; padding: 14px 24px; }
        .lec-read-top-inner { max-width: 720px; margin: 0 auto; display: flex; align-items: center; gap: 8px; }
        .breadcrumb-link { font-family: 'Nunito',sans-serif; font-size: 13px; color: #A87840; text-decoration: none; }
        .breadcrumb-link:hover { color: '#6B4520'; }
        .breadcrumb-sep { font-size: 12px; color: #C8934A; }
        .breadcrumb-current { font-family: 'Nunito',sans-serif; font-size: 13px; color: #6B4520; font-weight: 700; }

        /* Contenido */
        .lec-read-body { max-width: 720px; margin: 0 auto; padding: 48px 24px 80px; }

        .lec-read-meta { margin-bottom: 8px; }
        .lec-read-modulo { font-family: 'Nunito',sans-serif; font-size: 12px; font-weight: 700; color: #A87840; letter-spacing: 0.08em; text-transform: uppercase; }
        .lec-read-h1 { font-family: 'Fredoka',sans-serif; font-size: 30px; color: #3D2A0E; margin-bottom: 6px; line-height: 1.2; }
        .lec-read-desc { font-family: 'Nunito',sans-serif; font-size: 15px; color: #8C6D45; margin-bottom: 40px; }

        /* Bloque de contenido */
        .contenido-bloque { margin-bottom: 32px; }
        .contenido-tipo-pill {
          display: inline-block; font-family: 'Nunito',sans-serif; font-size: 11px;
          font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em;
          padding: 4px 12px; border-radius: 100px; margin-bottom: 12px;
          border: 1px solid transparent;
        }
        .contenido-bloque-titulo { font-family: 'Fredoka',sans-serif; font-size: 20px; color: #3D2A0E; margin-bottom: 12px; }
        .contenido-bloque-texto {
          font-family: 'Nunito',sans-serif; font-size: 16px; color: #5A3E1B;
          line-height: 1.9; white-space: pre-line;
        }
        .contenido-bloque-texto + .contenido-bloque-texto { margin-top: 12px; }
        .contenido-divider { border: none; border-top: 1px solid #E8D9B8; margin: 40px 0; }

        /* Sin contenido */
        .sin-contenido {
          background: #FFFDF5; border: 1px solid #E8D9B8; border-radius: 16px;
          padding: 40px 32px; text-align: center; margin-bottom: 32px;
        }
        .sin-contenido-h { font-family: 'Fredoka',sans-serif; font-size: 18px; color: '#3D2A0E'; margin-bottom: 8px; }
        .sin-contenido-p { font-family: 'Nunito',sans-serif; font-size: 14px; color: '#8C6D45'; }

        /* CTA a lección */
        .cta-leccion {
          background: #3D2A0E; border-radius: 20px; padding: 28px 32px;
          display: flex; align-items: center; justify-content: space-between; gap: 20px;
          margin-bottom: 40px;
        }
        .cta-leccion-texto { }
        .cta-leccion-titulo { font-family: 'Fredoka',sans-serif; font-size: 18px; color: '#FCE68B'; color: rgba(252,230,139,1); margin-bottom: 4px; }
        .cta-leccion-sub { font-family: 'Nunito',sans-serif; font-size: 13px; color: rgba(200,147,74,0.7); }
        .cta-leccion-btn {
          background: rgba(252,230,139,1); color: #3D2A0E; border: none;
          border-radius: 100px; padding: 12px 24px; font-family: 'Fredoka',sans-serif;
          font-size: 15px; font-weight: 600; cursor: pointer; white-space: nowrap;
          text-decoration: none; display: inline-block; transition: all 0.2s;
        }
        .cta-leccion-btn:hover { background: rgba(250,191,77,1); }

        /* Navegación */
        .nav-unidades { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .nav-unidad-btn {
          background: #FFFDF5; border: 1px solid #E8D9B8; border-radius: 14px;
          padding: 16px 20px; text-decoration: none; color: inherit; transition: all 0.15s;
          display: flex; flex-direction: column;
        }
        .nav-unidad-btn:hover { border-color: '#C8934A'; background: rgba(252,230,139,0.1); }
        .nav-unidad-dir { font-family: 'Nunito',sans-serif; font-size: 11px; font-weight: 700; color: #A87840; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 4px; }
        .nav-unidad-nombre { font-family: 'Fredoka',sans-serif; font-size: 15px; color: #3D2A0E; }
        .nav-unidad-empty { }

        @media (max-width: 600px) {
          .cta-leccion { flex-direction: column; align-items: flex-start; }
          .lec-read-h1 { font-size: 24px; }
          .nav-unidades { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="lec-read-wrap">
        {/* Breadcrumb */}
        <div className="lec-read-top">
          <div className="lec-read-top-inner">
            <Link href="/biblioteca" className="breadcrumb-link">Biblioteca</Link>
            <span className="breadcrumb-sep">›</span>
            {modulo && <span className="breadcrumb-link">{modulo.nombre}</span>}
            <span className="breadcrumb-sep">›</span>
            <span className="breadcrumb-current">{unidad.nombre}</span>
          </div>
        </div>

        <div className="lec-read-body">
          {/* Encabezado */}
          <div className="lec-read-meta">
            {modulo && <p className="lec-read-modulo">Módulo {modulo.orden} — {modulo.nombre}</p>}
          </div>
          <h1 className="lec-read-h1">{unidad.nombre}</h1>
          {unidad.descripcion && <p className="lec-read-desc">{unidad.descripcion}</p>}

          {/* Bloques de contenido */}
          {contenidos.length > 0 ? (
            <>
              {contenidos.map((bloque, i) => {
                const estilo = TIPO_STYLE[bloque.tipo] || TIPO_STYLE.dato
                return (
                  <div key={bloque.id} className="contenido-bloque">
                    {i > 0 && <hr className="contenido-divider" />}
                    <span
                      className="contenido-tipo-pill"
                      style={{ background: estilo.bg, color: estilo.color, borderColor: estilo.border }}
                    >
                      {TIPO_LABEL[bloque.tipo] || bloque.tipo}
                    </span>
                    <h2 className="contenido-bloque-titulo">{bloque.titulo}</h2>
                    <p className="contenido-bloque-texto">{bloque.texto}</p>
                  </div>
                )
              })}
            </>
          ) : (
            <div className="sin-contenido">
              <h3 className="sin-contenido-h">Contenido en preparación</h3>
              <p className="sin-contenido-p">
                El equipo de contenido está trabajando en esta unidad. Mientras tanto, puedes practicar la lección.
              </p>
            </div>
          )}

          <hr className="contenido-divider" />

          {/* CTA a la lección */}
          <div className="cta-leccion">
            <div className="cta-leccion-texto">
              <div className="cta-leccion-titulo">¿Listo para practicar?</div>
              <div className="cta-leccion-sub">Responde preguntas y consolida lo que leíste.</div>
            </div>
            <Link href={`/aprender/${moduloId}/${unidadId}`} className="cta-leccion-btn">
              Ir a la lección
            </Link>
          </div>

          {/* Navegación entre unidades */}
          <div className="nav-unidades">
            {unidadAnterior ? (
              <Link href={`/biblioteca/${moduloId}/${unidadAnterior.id}`} className="nav-unidad-btn">
                <span className="nav-unidad-dir">Anterior</span>
                <span className="nav-unidad-nombre">{unidadAnterior.nombre}</span>
              </Link>
            ) : (
              <div className="nav-unidad-empty" />
            )}
            {unidadSiguiente ? (
              <Link href={`/biblioteca/${moduloId}/${unidadSiguiente.id}`} className="nav-unidad-btn" style={{ textAlign: 'right' }}>
                <span className="nav-unidad-dir">Siguiente</span>
                <span className="nav-unidad-nombre">{unidadSiguiente.nombre}</span>
              </Link>
            ) : (
              <Link href="/biblioteca" className="nav-unidad-btn" style={{ textAlign: 'right', justifyContent: 'center' }}>
                <span className="nav-unidad-dir">Fin del módulo</span>
                <span className="nav-unidad-nombre">Volver a la biblioteca</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
