'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Modulo { id: string; nombre: string; descripcion: string; orden: number; icono: string }
interface Unidad { id: string; modulo_id: string; nombre: string; orden: number; descripcion: string }

export default function CursosPage() {
  const [modulos, setModulos] = useState<Modulo[]>([])
  const [unidades, setUnidades] = useState<Unidad[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const [{ data: mods }, { data: unis }] = await Promise.all([
        supabase.from('modulos').select('*').order('orden'),
        supabase.from('unidades').select('*').order('orden'),
      ])
      setModulos(mods || [])
      setUnidades(unis || [])
      setLoading(false)
    }
    init()

    // Scroll a anchor si viene de página principal
    if (window.location.hash) {
      setTimeout(() => {
        const el = document.querySelector(window.location.hash)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 500)
    }
  }, [])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF8E8' }}>
      <p style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 20, color: '#6B4520' }}>Cargando cursos... 🦊</p>
    </div>
  )

  return (
    <>
      <style>{`
        .cursos-hero { padding: 140px 0 64px; background: #FFF8E8; text-align: center; }
        .cursos-h1 { font-size: clamp(32px,5vw,54px); font-weight: 700; color: #3D2A0E; margin-bottom: 14px; }
        .cursos-desc { font-size: 17px; color: #8C6D45; max-width: 560px; margin: 0 auto; font-family: 'Nunito',sans-serif; line-height: 1.7; }
        .cursos-cta-note { margin-top: 24px; display: inline-flex; align-items: center; gap: 8px; background: rgba(252,230,139,0.4); color: #6B4520; padding: 10px 20px; border-radius: 100px; font-family: 'Nunito',sans-serif; font-size: 14px; font-weight: 600; }
        .cursos-body { max-width: 1100px; margin: 0 auto; padding: 64px 24px; display: flex; flex-direction: column; gap: 56px; }
        .modulo-section { scroll-margin-top: 100px; }
        .modulo-header-bar { background: #3D2A0E; border-radius: 20px 20px 0 0; padding: 24px 32px; display: flex; align-items: center; gap: 16px; }
        .mod-icon { width: 52px; height: 52px; background: rgba(250,191,77,0.2); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 26px; flex-shrink: 0; }
        .mod-nombre { font-family: 'Fredoka',sans-serif; font-size: 20px; font-weight: 600; color: #FCE68B; }
        .mod-desc { font-family: 'Nunito',sans-serif; font-size: 14px; color: rgba(252,230,139,0.6); margin-top: 4px; }
        .unidades-grid { background: #FFFDF5; border: 1px solid #E8D9B8; border-top: none; border-radius: 0 0 20px 20px; display: grid; grid-template-columns: repeat(2, 1fr); }
        .unidad-card { padding: 24px 28px; border-right: 1px solid #E8D9B8; border-bottom: 1px solid #E8D9B8; }
        .unidad-card:nth-child(even) { border-right: none; }
        .unidad-card:nth-last-child(-n+2) { border-bottom: none; }
        .unidad-orden { font-family: 'Nunito',sans-serif; font-size: 11px; color: #A87840; font-weight: 800; text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 6px; }
        .unidad-nombre { font-family: 'Fredoka',sans-serif; font-size: 17px; font-weight: 600; color: #3D2A0E; margin-bottom: 8px; }
        .unidad-desc { font-family: 'Nunito',sans-serif; font-size: 13px; color: #8C6D45; line-height: 1.6; }
        .modulo-footer { background: rgba(252,230,139,0.1); border: 1px solid #E8D9B8; border-top: none; border-radius: 0 0 20px 20px; padding: 16px 28px; display: flex; align-items: center; justify-content: space-between; }
        .modulo-footer-info { font-family: 'Nunito',sans-serif; font-size: 13px; color: #A87840; }
        .modulo-footer-badge { background: rgba(252,230,139,0.5); color: #6B4520; font-family: 'Fredoka',sans-serif; font-size: 13px; font-weight: 600; padding: 6px 16px; border-radius: 100px; }
        @media (max-width: 600px) { .unidades-grid { grid-template-columns: 1fr; } .unidad-card { border-right: none; } .unidad-card:nth-last-child(-n+2) { border-bottom: 1px solid #E8D9B8; } .unidad-card:last-child { border-bottom: none; } }
      `}</style>

      <div className="cursos-hero">
        <div className="container-md">
          <span className="tag-deco">Biblioteca de cursos</span>
          <h1 className="cursos-h1">Todo lo que aprenderás<br />en Moneduca</h1>
          <p className="cursos-desc">{modulos.length} módulos, {unidades.length} unidades de aprendizaje. Cada módulo está diseñado para jóvenes de secundaria con ejemplos de la vida real.</p>
          <div className="cursos-cta-note">
            🦊 Para acceder a las lecciones, inicia sesión y ve a <strong style={{ marginLeft: 4 }}>Mi cuenta</strong>
          </div>
        </div>
      </div>

      <div className="cursos-body">
        {modulos.map((modulo, mi) => {
          const unidadesModulo = unidades.filter(u => u.modulo_id === modulo.id).sort((a, b) => a.orden - b.orden)
          return (
            <div key={modulo.id} id={modulo.id} className="modulo-section">
              <div className="modulo-header-bar">
                <div className="mod-icon">{modulo.icono}</div>
                <div>
                  <div className="mod-nombre">Módulo {mi + 1}: {modulo.nombre}</div>
                  <div className="mod-desc">{modulo.descripcion}</div>
                </div>
              </div>
              <div className="unidades-grid">
                {unidadesModulo.map(unidad => (
                  <div key={unidad.id} className="unidad-card">
                    <div className="unidad-orden">Unidad {unidad.orden}</div>
                    <div className="unidad-nombre">{unidad.nombre}</div>
                    <div className="unidad-desc">{unidad.descripcion}</div>
                  </div>
                ))}
              </div>
              <div className="modulo-footer">
                <span className="modulo-footer-info">📖 {unidadesModulo.length} unidades · Aprende a tu ritmo</span>
                <span className="modulo-footer-badge">{mi < 2 ? 'Básico' : mi < 4 ? 'Intermedio' : 'Avanzado'}</span>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
