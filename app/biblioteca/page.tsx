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
  descripcion: string
  orden: number
}

export default function BibliotecaPage() {
  const [modulos, setModulos] = useState<Modulo[]>([])
  const [unidades, setUnidades] = useState<Unidad[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/registro'); return }

      const [{ data: mods }, { data: unis }] = await Promise.all([
        supabase.from('modulos').select('*').order('orden'),
        supabase.from('unidades').select('*').order('orden'),
      ])

      setModulos(mods || [])
      setUnidades(unis || [])
      setLoading(false)
    }
    init()
  }, [router])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF8E8' }}>
      <p style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 20, color: '#6B4520' }}>Cargando biblioteca...</p>
    </div>
  )

  return (
    <>
      <style>{`
        .bib-wrap { min-height: 100vh; background: #FFF8E8; padding-top: 68px; }
        .bib-header { background: #FFFDF5; border-bottom: 1px solid #E8D9B8; padding: 40px 0; }
        .bib-header-inner { max-width: 800px; margin: 0 auto; padding: 0 24px; }
        .bib-eyebrow { font-family: 'Nunito',sans-serif; font-size: 11px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: #A87840; margin-bottom: 10px; }
        .bib-h1 { font-family: 'Fredoka',sans-serif; font-size: 32px; color: #3D2A0E; margin-bottom: 10px; }
        .bib-desc { font-family: 'Nunito',sans-serif; font-size: 15px; color: #8C6D45; line-height: 1.6; max-width: 520px; }
        .bib-body { max-width: 800px; margin: 0 auto; padding: 48px 24px 80px; }
        .modulo-section { margin-bottom: 48px; }
        .modulo-header-bib { display: flex; align-items: baseline; gap: 14px; margin-bottom: 20px; padding-bottom: 14px; border-bottom: 2px solid #E8D9B8; }
        .modulo-num { font-family: 'Fredoka',sans-serif; font-size: 13px; color: #A87840; }
        .modulo-nombre-bib { font-family: 'Fredoka',sans-serif; font-size: 20px; color: #3D2A0E; }
        .unidades-lista { display: flex; flex-direction: column; gap: 8px; }
        .unidad-fila {
          display: flex; align-items: center; gap: 16px;
          padding: 16px 20px; background: #FFFDF5;
          border: 1px solid #E8D9B8; border-radius: 14px;
          text-decoration: none; color: inherit; transition: all 0.15s;
        }
        .unidad-fila:hover { border-color: #C8934A; background: rgba(252,230,139,0.1); transform: translateX(4px); }
        .unidad-orden { font-family: 'Fredoka',sans-serif; font-size: 14px; color: #A87840; min-width: 28px; }
        .unidad-info { flex: 1; }
        .unidad-nombre-bib { font-family: 'Fredoka',sans-serif; font-size: 16px; color: #3D2A0E; }
        .unidad-desc-bib { font-family: 'Nunito',sans-serif; font-size: 13px; color: #8C6D45; margin-top: 2px; }
        .unidad-arrow { color: #C8934A; font-size: 14px; flex-shrink: 0; }

        @media (max-width: 640px) {
          .bib-h1 { font-size: 26px; }
        }
      `}</style>

      <div className="bib-wrap">
        <div className="bib-header">
          <div className="bib-header-inner">
            <p className="bib-eyebrow">Material de estudio</p>
            <h1 className="bib-h1">Biblioteca</h1>
            <p className="bib-desc">
              Lee el contenido de cada unidad sin presiones. Repasa lo que necesites antes de practicar.
            </p>
          </div>
        </div>

        <div className="bib-body">
          {modulos.map((modulo, mi) => {
            const unidadesModulo = unidades
              .filter(u => u.modulo_id === modulo.id)
              .sort((a, b) => a.orden - b.orden)

            return (
              <div key={modulo.id} className="modulo-section">
                <div className="modulo-header-bib">
                  <span className="modulo-num">Módulo {mi + 1}</span>
                  <h2 className="modulo-nombre-bib">{modulo.nombre}</h2>
                </div>
                <div className="unidades-lista">
                  {unidadesModulo.map(unidad => (
                    <Link
                      key={unidad.id}
                      href={`/biblioteca/${modulo.id}/${unidad.id}`}
                      className="unidad-fila"
                    >
                      <span className="unidad-orden">{unidad.orden}</span>
                      <div className="unidad-info">
                        <div className="unidad-nombre-bib">{unidad.nombre}</div>
                        {unidad.descripcion && (
                          <div className="unidad-desc-bib">{unidad.descripcion}</div>
                        )}
                      </div>
                      <span className="unidad-arrow">Leer</span>
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
