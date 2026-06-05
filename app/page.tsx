'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Chatbot from '@/components/Chatbot'
import { supabase } from '@/lib/supabase'

const modulos = [
  { emoji: '01', color: 'rgba(252,230,139,0.5)', accent: '#C8934A', titulo: 'Bases: Historia del dinero', desc: 'Descubre cómo nació el dinero, por qué existe y cómo ha cambiado el mundo.', nivel: 'Básico' },
  { emoji: '02', color: 'rgba(250,191,77,0.25)', accent: '#6B4520', titulo: 'Presupuesto y ahorro', desc: 'Aprende a organizar tu dinero y crear el hábito del ahorro desde hoy.', nivel: 'Básico' },
  { emoji: '03', color: 'rgba(145,99,47,0.1)', accent: '#8C6D45', titulo: 'Inversiones', desc: 'Haz que tu dinero trabaje para ti. CETES, interés compuesto y más.', nivel: 'Intermedio' },
  { emoji: '04', color: 'rgba(252,230,139,0.4)', accent: '#C8934A', titulo: 'Tarjetas de crédito y débito', desc: 'Usa el plástico a tu favor sin caer en deudas ni intereses.', nivel: 'Intermedio' },
  { emoji: '05', color: 'rgba(145,99,47,0.15)', accent: '#6B4520', titulo: 'Impuestos', desc: 'Entiende qué son, para qué sirven y cómo funcionan en México.', nivel: 'Avanzado' },
  { emoji: '06', color: 'rgba(252,230,139,0.3)', accent: '#C8934A', titulo: 'Estafas y seguros', desc: 'Protégete de fraudes financieros y aprende qué es un seguro.', nivel: 'Avanzado' },
]

const pasos = [
  { num: '01', titulo: 'Crea tu cuenta gratis', desc: 'Sin tarjeta de crédito. Solo regístrate con tu email.' },
  { num: '02', titulo: 'Elige tu módulo', desc: 'Empieza por donde quieras. Cada unidad dura 15 minutos.' },
  { num: '03', titulo: 'Aprende con Monedoki', desc: 'Preguntas interactivas, feedback inmediato y progreso real.' },
  { num: '04', titulo: 'Pregúntale al chat', desc: 'Monedoki responde tus dudas financieras cuando quieras.' },
]

export default function HomePage() {
  const [loggedIn, setLoggedIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setLoggedIn(!!session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setLoggedIn(!!session))
    return () => subscription.unsubscribe()
  }, [])

  const handleCTA = (e: React.MouseEvent) => {
    e.preventDefault()
    router.push(loggedIn ? '/dashboard' : '/registro')
  }
  return (
    <>
      <style>{`
        .hero { min-height: 100vh; padding-top: 68px; display: flex; align-items: center; background: #FFF8E8; position: relative; overflow: hidden; }
        .hero::before { content: ''; position: absolute; top: -150px; right: -150px; width: 500px; height: 500px; border-radius: 50%; background: radial-gradient(circle, rgba(250,191,77,0.18) 0%, transparent 70%); pointer-events: none; }
        .hero-inner { max-width: 1200px; margin: 0 auto; padding: 80px 24px; display: grid; grid-template-columns: 1fr 400px; gap: 64px; align-items: center; position: relative; z-index: 1; }
        .hero-eyebrow { display: inline-flex; align-items: center; gap: 8px; background: rgba(252,230,139,0.6); color: #6B4520; padding: 8px 16px; border-radius: 100px; font-size: 13px; font-weight: 700; margin-bottom: 24px; font-family: 'Nunito',sans-serif; }
        .hero-dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(250,191,77,1); animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.5);opacity:0.6} }
        .hero-h1 { font-size: clamp(38px,5vw,60px); font-weight: 700; line-height: 1.05; margin-bottom: 20px; color: #3D2A0E; }
        .hero-h1 .accent { color: #C8934A; }
        .hero-h1 .subray { position: relative; display: inline-block; }
        .hero-h1 .subray::after { content: ''; position: absolute; bottom: -4px; left: 0; right: 0; height: 4px; background: rgba(250,191,77,1); border-radius: 2px; }
        .hero-desc { font-size: 17px; color: #8C6D45; margin-bottom: 36px; line-height: 1.7; font-family: 'Nunito',sans-serif; }
        .hero-btns { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 48px; }
        .hero-stats { display: flex; gap: 32px; }
        .stat-num { font-family: 'Fredoka',sans-serif; font-size: 28px; font-weight: 600; color: #3D2A0E; }
        .stat-label { font-size: 13px; color: #A87840; font-family: 'Nunito',sans-serif; }
        /* Hero right - Monedoki */
        .hero-right { display: flex; flex-direction: column; align-items: center; gap: 16px; }
        .mk-bubble { background: rgba(250,191,77,1); border-radius: 20px 20px 20px 6px; padding: 14px 18px; font-family: 'Fredoka',sans-serif; font-size: 16px; font-weight: 600; color: #3D2A0E; text-align: center; box-shadow: 4px 4px 0px rgba(145,99,47,0.2); }
        .mk-hero-img { width: 200px; height: 200px; object-fit: contain; filter: drop-shadow(4px 8px 12px rgba(145,99,47,0.2)); }
        .hero-card { background: #FFFDF5; border-radius: 20px; border: 1px solid #E8D9B8; padding: 20px; width: 100%; box-shadow: 4px 4px 0px rgba(145,99,47,0.08); }
        .card-label { font-size: 11px; color: #A87840; text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 14px; font-weight: 700; font-family: 'Nunito',sans-serif; }
        .prog-item { margin-bottom: 12px; }
        .prog-header { display: flex; justify-content: space-between; margin-bottom: 5px; }
        .prog-name { font-size: 13px; font-weight: 600; color: #3D2A0E; font-family: 'Nunito',sans-serif; }
        .prog-pct { font-size: 12px; font-weight: 700; font-family: 'Fredoka',sans-serif; }
        .prog-bar { height: 7px; background: rgba(232,217,184,0.5); border-radius: 100px; overflow: hidden; }
        .prog-fill { height: 100%; border-radius: 100px; }
        /* Módulos */
        .modulos-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        .modulo-card { border-radius: 20px; border: 1px solid #E8D9B8; padding: 24px; background: #FFFDF5; transition: all 0.3s; display: block; color: inherit; }
        .modulo-card:hover { transform: translateY(-5px); box-shadow: 5px 5px 0px rgba(145,99,47,0.12); border-color: rgba(250,191,77,0.5); }
        .modulo-icon { width: 50px; height: 50px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 14px; }
        .modulo-nivel { font-size: 11px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; border-radius: 100px; padding: 3px 10px; margin-bottom: 10px; display: inline-block; font-family: 'Nunito',sans-serif; }
        .modulo-titulo { font-size: 16px; font-weight: 600; margin-bottom: 8px; color: #3D2A0E; font-family: 'Fredoka',sans-serif; }
        .modulo-desc { font-size: 13px; color: #8C6D45; line-height: 1.6; font-family: 'Nunito',sans-serif; }
        .modulo-arrow { display: inline-flex; gap: 6px; margin-top: 14px; font-size: 13px; font-weight: 700; color: #C8934A; font-family: 'Nunito',sans-serif; }
        /* Chat section */
        .chat-section { background: rgba(252,230,139,0.1); padding: 96px 0; border-top: 1px solid #E8D9B8; border-bottom: 1px solid #E8D9B8; }
        .chat-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 72px; align-items: center; }
        .chat-h2 { font-size: clamp(26px,3vw,38px); font-weight: 700; margin-bottom: 14px; color: #3D2A0E; }
        .chat-desc { font-size: 16px; color: #8C6D45; margin-bottom: 24px; font-family: 'Nunito',sans-serif; line-height: 1.7; }
        .chat-feats { list-style: none; }
        .chat-feat { display: flex; align-items: flex-start; gap: 12px; padding: 11px 0; border-bottom: 1px solid #E8D9B8; font-size: 15px; font-family: 'Nunito',sans-serif; color: #6B4520; }
        .feat-icon { width: 26px; height: 26px; background: rgba(252,230,139,0.6); border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 13px; }
        /* Monedoki CTA */
        .mk-cta { background: rgba(250,191,77,0.12); border-radius: 28px; padding: 56px 48px; margin: 0 24px 96px; display: grid; grid-template-columns: 1fr auto; gap: 40px; align-items: center; border: 1px solid rgba(250,191,77,0.35); }
        .mk-cta-img { width: 130px; object-fit: contain; }
        /* Pasos */
        .pasos-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        .paso-num { font-family: 'Fredoka',sans-serif; font-size: 40px; font-weight: 600; color: #E8D9B8; margin-bottom: 10px; line-height: 1; }
        .paso-titulo { font-size: 15px; font-weight: 700; margin-bottom: 8px; color: #3D2A0E; font-family: 'Fredoka',sans-serif; }
        .paso-desc { font-size: 13px; color: #8C6D45; font-family: 'Nunito',sans-serif; }
        /* CTA final */
        .cta-wrap { padding: 0 24px 96px; }
        .cta-box { background: #3D2A0E; border-radius: 32px; padding: 72px 56px; text-align: center; position: relative; overflow: hidden; }
        .cta-box::before { content: ''; position: absolute; top: -80px; left: 50%; transform: translateX(-50%); width: 500px; height: 300px; background: radial-gradient(circle, rgba(250,191,77,0.15) 0%, transparent 70%); pointer-events: none; }
        .cta-h2 { font-size: clamp(26px,4vw,44px); font-weight: 700; color: rgba(252,230,139,1); margin-bottom: 14px; position: relative; z-index: 1; }
        .cta-h2 span { color: rgba(250,191,77,1); }
        .cta-desc { color: #A87840; font-size: 17px; margin-bottom: 32px; position: relative; z-index: 1; font-family: 'Nunito',sans-serif; }
        .section-header { text-align: center; margin-bottom: 48px; }
        .section-h2 { font-size: clamp(26px,3.5vw,40px); font-weight: 700; margin-bottom: 12px; color: #3D2A0E; }
        .section-sub { font-size: 16px; color: #8C6D45; max-width: 500px; margin: 0 auto; font-family: 'Nunito',sans-serif; }
        @media (max-width: 900px) {
          .hero-inner { grid-template-columns: 1fr; }
          .hero-right { display: none; }
          .chat-inner { grid-template-columns: 1fr; }
          .modulos-grid { grid-template-columns: 1fr 1fr; }
          .pasos-grid { grid-template-columns: 1fr 1fr; }
          .cta-box, .mk-cta { padding: 48px 28px; margin: 0 16px 64px; }
          .mk-cta { grid-template-columns: 1fr; }
        }
        @media (max-width: 600px) { .modulos-grid, .pasos-grid { grid-template-columns: 1fr; } }
      `}</style>

      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <div>
            <div className="hero-eyebrow"><span className="hero-dot" /> Educación financiera para jóvenes</div>
            <h1 className="hero-h1">
              Tu dinero,{' '}<span className="subray">tus reglas.</span><br />
              <span className="accent">Aprende hoy.</span>
            </h1>
            <p className="hero-desc">Moneduca te enseña todo lo que la escuela no te dijo sobre el dinero. 6 módulos, lecciones interactivas y Monedoki como tu guía.</p>
            <div className="hero-btns">
              <button onClick={handleCTA} className="btn btn-primary" style={{ fontSize: 16, padding: '16px 32px' }}>Empezar gratis</button>
              <Link href="/cursos" className="btn btn-secondary" style={{ fontSize: 16, padding: '16px 32px' }}>Ver módulos</Link>
            </div>
            <div className="hero-stats">
              {[['6', 'módulos'], ['100%', 'gratuito'], ['15min', 'por unidad']].map(([n, l]) => (
                <div key={l}><div className="stat-num">{n}</div><div className="stat-label">{l}</div></div>
              ))}
            </div>
          </div>
          <div className="hero-right">
            <div className="mk-bubble">Hola, soy Monedoki.<br/>Aprende a manejar tu dinero.</div>
            <img src="/monedoki.png" alt="Monedoki" className="mk-hero-img" onError={e => { (e.target as HTMLImageElement).style.display='none' }} />
            <div className="hero-card">
              <p className="card-label">Tu progreso esta semana</p>
              {[{ name: 'Historia del dinero', pct: 75, color: 'rgba(250,191,77,1)' }, { name: 'Presupuesto y ahorro', pct: 40, color: '#C8934A' }, { name: 'Tarjetas de crédito', pct: 10, color: '#8C6D45' }].map(item => (
                <div key={item.name} className="prog-item">
                  <div className="prog-header">
                    <span className="prog-name">{item.name}</span>
                    <span className="prog-pct" style={{ color: item.color }}>{item.pct}%</span>
                  </div>
                  <div className="prog-bar"><div className="prog-fill" style={{ width: `${item.pct}%`, background: item.color }} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MÓDULOS */}
      <section className="section">
        <div className="container-md">
          <div className="section-header">
            <span className="tag-deco">Lo que aprenderás</span>
            <h2 className="section-h2">6 módulos para dominar tu dinero</h2>
            <p className="section-sub">Desde la historia del dinero hasta cómo protegerte de estafas. Todo lo que necesitas.</p>
          </div>
        </div>
        <div className="modulos-grid">
          {modulos.map((m, i) => (
            <Link key={i} href={`/cursos#${['bases','presupuesto','inversiones','tarjetas','impuestos','estafas'][i]}`} className="modulo-card">
              <div className="modulo-icon" style={{ background: m.color }}>{m.emoji}</div>
              <div className="modulo-nivel" style={{ background: m.color, color: m.accent }}>{m.nivel}</div>
              <h3 className="modulo-titulo">{m.titulo}</h3>
              <p className="modulo-desc">{m.desc}</p>
              <div className="modulo-arrow">Ver módulo →</div>
            </Link>
          ))}
        </div>
      </section>

      {/* MONEDOKI CTA */}
      <div className="container-md">
        <div className="mk-cta">
          <div>
            <span className="tag-deco">Tu compañero de aprendizaje</span>
            <h2 style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 'clamp(22px,3vw,34px)', fontWeight: 700, marginBottom: 14, color: '#3D2A0E' }}>
              Monedoki te acompaña en cada lección
            </h2>
            <p style={{ fontSize: 15, color: '#8C6D45', marginBottom: 24, fontFamily: "'Nunito',sans-serif", lineHeight: 1.7 }}>
              Aprende con preguntas interactivas, feedback inmediato y la compañía de Monedoki. Te celebra cuando aciertas y te anima cuando te equivocas.
            </p>
            <button onClick={handleCTA} className="btn btn-primary">Conocer a Monedoki</button>
          </div>
          <img src="/monedoki.png" alt="Monedoki" className="mk-cta-img" onError={e => { (e.target as HTMLImageElement).style.display='none' }} />
        </div>
      </div>

      {/* CHATBOT */}
      <section className="chat-section">
        <div className="chat-inner">
          <div>
            <span className="tag-deco">Asistente financiero</span>
            <h2 className="chat-h2">Pregúntale a Monedoki lo que quieras</h2>
            <p className="chat-desc">Monedoki no solo aparece en las lecciones — también puede resolver tus dudas financieras en cualquier momento, con lenguaje fácil y ejemplos de tu vida diaria.</p>
            <ul className="chat-feats">
              {['Explica conceptos difíciles en palabras simples', 'Responde dudas de tus lecciones al instante', 'Ejemplos con situaciones cotidianas mexicanas', 'Disponible las 24 horas del día'].map((t, i) => (
                <li key={i} className="chat-feat"><span className="feat-icon">🦊</span><span>{t}</span></li>
              ))}
            </ul>
          </div>
          <Chatbot />
        </div>
      </section>

      {/* PASOS */}
      <section className="section">
        <div className="container-md">
          <div className="section-header">
            <span className="tag-deco">Cómo funciona</span>
            <h2 className="section-h2">Empieza en 4 pasos sencillos</h2>
          </div>
        </div>
        <div className="pasos-grid">
          {pasos.map((p, i) => (
            <div key={i}>
              <div className="paso-num">{p.num}</div>
              <h3 className="paso-titulo">{p.titulo}</h3>
              <p className="paso-desc">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="cta-wrap">
        <div className="cta-box">
          <h2 className="cta-h2">¿Listo para <span>dominar</span> tu dinero?</h2>
          <p className="cta-desc">Únete gratis hoy. Sin tarjeta, sin compromisos.</p>
          <button onClick={handleCTA} className="btn btn-yellow" style={{ fontSize: 17, padding: '18px 40px', position: 'relative', zIndex: 1 }}>Crear mi cuenta gratis</button>
        </div>
      </div>
    </>
  )
}
