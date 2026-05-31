import Link from 'next/link'
import Chatbot from '@/components/Chatbot'

const modulos = [
  { emoji: '🏦', color: '#D4F5EB', accent: '#00C896', titulo: 'Ahorro inteligente', desc: 'Aprende por qué ahorrar es el primer paso y cómo hacerlo aunque tengas poco dinero.', nivel: 'Básico' },
  { emoji: '📊', color: '#FFF8E7', accent: '#B8860B', titulo: 'Tu primer presupuesto', desc: 'Crea un plan mensual para que tu dinero alcance para todo lo que quieres y necesitas.', nivel: 'Básico' },
  { emoji: '💳', color: '#FFE8E8', accent: '#CC3333', titulo: 'Deudas y crédito', desc: 'Entiende cómo funciona el crédito, cuándo es útil y cómo evitar caer en deudas.', nivel: 'Intermedio' },
  { emoji: '📈', color: '#E8EDFF', accent: '#4361EE', titulo: 'Introducción a invertir', desc: 'Descubre cómo tu dinero puede crecer solo mientras tú duermes.', nivel: 'Intermedio' },
  { emoji: '🎯', color: '#F3E8FF', accent: '#7B2FBE', titulo: 'Metas financieras', desc: 'Aprende a planear para lo que sueñas: viajes, gadgets, universidad y más.', nivel: 'Avanzado' },
]

const pasos = [
  { num: '01', titulo: 'Crea tu cuenta gratis', desc: 'Sin tarjeta de crédito. Solo regístrate con tu email.' },
  { num: '02', titulo: 'Elige tu módulo', desc: 'Empieza por donde quieras. Cada lección dura 15 minutos.' },
  { num: '03', titulo: 'Aprende y practica', desc: 'Videos, ejercicios y quizzes para que el conocimiento se quede.' },
  { num: '04', titulo: 'Pregúntale al chat', desc: 'Nuestro asistente de IA responde tus dudas en cualquier momento.' },
]

export default function HomePage() {
  return (
    <>
      <style>{`
        .hero {
          min-height: 100vh; padding-top: 68px;
          display: flex; align-items: center;
          background: #FAFAFA; position: relative; overflow: hidden;
        }
        .hero::before {
          content: ''; position: absolute; top: -200px; right: -200px;
          width: 600px; height: 600px; border-radius: 50%;
          background: radial-gradient(circle, rgba(0,200,150,0.12) 0%, transparent 70%);
          pointer-events: none;
        }
        .hero-inner {
          max-width: 1200px; margin: 0 auto; padding: 80px 24px;
          display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center;
          position: relative; z-index: 1;
        }
        .hero-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          background: #D4F5EB; color: #009970;
          padding: 8px 16px; border-radius: 100px;
          font-size: 13px; font-weight: 600; margin-bottom: 24px;
        }
        .hero-dot { width: 8px; height: 8px; border-radius: 50%; background: #00C896; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.4);opacity:0.7} }
        .hero-h1 { font-size: clamp(40px,5vw,64px); font-weight: 800; line-height: 1.05; margin-bottom: 24px; }
        .hero-h1 .accent { color: #00C896; }
        .hero-h1 .subray { position: relative; display: inline-block; }
        .hero-h1 .subray::after { content: ''; position: absolute; bottom: -4px; left: 0; right: 0; height: 4px; background: #FFD166; border-radius: 2px; }
        .hero-desc { font-size: 18px; color: #6B7280; margin-bottom: 36px; max-width: 480px; }
        .hero-btns { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 48px; }
        .hero-stats { display: flex; gap: 32px; }
        .stat-num { font-family: 'Syne',sans-serif; font-size: 28px; font-weight: 800; }
        .stat-label { font-size: 13px; color: #9CA3AF; }
        /* Visual card */
        .hero-visual { position: relative; display: flex; justify-content: center; }
        .hero-card {
          background: white; border-radius: 24px; border: 1.5px solid #E5E7EB;
          padding: 28px; box-shadow: 0 20px 60px rgba(0,0,0,0.08);
          width: 100%; max-width: 360px; position: relative; z-index: 2;
        }
        .card-label { font-size: 12px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 20px; font-weight: 600; }
        .prog-item { margin-bottom: 16px; }
        .prog-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .prog-name { font-size: 14px; font-weight: 600; }
        .prog-pct { font-size: 13px; font-weight: 700; }
        .prog-bar { height: 8px; background: #F4F4F6; border-radius: 100px; overflow: hidden; }
        .prog-fill { height: 100%; border-radius: 100px; }
        .float-badge {
          position: absolute; background: white; border-radius: 14px; border: 1.5px solid #E5E7EB;
          padding: 12px 16px; box-shadow: 0 8px 24px rgba(0,0,0,0.1);
          font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 8px;
          white-space: nowrap; animation: float 3s ease-in-out infinite;
        }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .fb1 { top: -20px; right: -20px; animation-delay: 0s; }
        .fb2 { bottom: 20px; left: -30px; animation-delay: 1.5s; }
        /* Módulos */
        .modulos-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;
          max-width: 1200px; margin: 0 auto; padding: 0 24px;
        }
        .modulo-card {
          border-radius: 20px; border: 1.5px solid #E5E7EB; padding: 28px;
          background: white; transition: all 0.3s ease; display: block; color: inherit;
        }
        .modulo-card:hover { transform: translateY(-6px); box-shadow: 0 16px 48px rgba(0,0,0,0.1); border-color: transparent; }
        .modulo-icon { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 28px; margin-bottom: 20px; }
        .modulo-nivel { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; border-radius: 100px; padding: 4px 10px; margin-bottom: 12px; display: inline-block; }
        .modulo-titulo { font-size: 18px; font-weight: 700; margin-bottom: 10px; }
        .modulo-desc { font-size: 14px; color: #6B7280; line-height: 1.6; }
        .modulo-arrow { display: inline-flex; align-items: center; gap: 6px; margin-top: 20px; font-size: 14px; font-weight: 600; }
        /* Chatbot section */
        .chat-section { background: #F9FAFB; padding: 96px 0; }
        .chat-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .chat-h2 { font-size: clamp(28px,3vw,42px); font-weight: 800; margin-bottom: 16px; }
        .chat-desc { font-size: 16px; color: #6B7280; margin-bottom: 24px; }
        .chat-feats { list-style: none; }
        .chat-feat { display: flex; align-items: flex-start; gap: 12px; padding: 12px 0; border-bottom: 1px solid #E5E7EB; font-size: 15px; }
        .feat-icon { width: 28px; height: 28px; background: #D4F5EB; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        /* Pasos */
        .pasos-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        .paso-num { font-family: 'Syne',sans-serif; font-size: 40px; font-weight: 800; color: #E5E7EB; margin-bottom: 12px; line-height: 1; }
        .paso-titulo { font-size: 17px; font-weight: 700; margin-bottom: 8px; }
        .paso-desc { font-size: 14px; color: #6B7280; }
        /* CTA */
        .cta-wrap { padding: 0 24px 96px; }
        .cta-box {
          background: #0D0D0D; border-radius: 32px; padding: 80px 64px;
          text-align: center; position: relative; overflow: hidden;
        }
        .cta-box::before {
          content: ''; position: absolute; top: -100px; left: 50%; transform: translateX(-50%);
          width: 600px; height: 300px;
          background: radial-gradient(circle, rgba(0,200,150,0.2) 0%, transparent 70%);
          pointer-events: none;
        }
        .cta-h2 { font-size: clamp(28px,4vw,48px); font-weight: 800; color: white; margin-bottom: 16px; position: relative; z-index: 1; }
        .cta-h2 span { color: #00C896; }
        .cta-desc { color: #9CA3AF; font-size: 18px; margin-bottom: 36px; position: relative; z-index: 1; }
        .section-header { text-align: center; margin-bottom: 56px; }
        .section-h2 { font-size: clamp(28px,3.5vw,44px); font-weight: 800; margin-bottom: 12px; }
        .section-sub { font-size: 17px; color: #6B7280; max-width: 520px; margin: 0 auto; }
        @media (max-width: 900px) {
          .hero-inner, .chat-inner { grid-template-columns: 1fr; }
          .hero-visual { display: none; }
          .modulos-grid { grid-template-columns: 1fr 1fr; }
          .pasos-grid { grid-template-columns: 1fr 1fr; }
          .cta-box { padding: 56px 32px; }
        }
        @media (max-width: 600px) {
          .modulos-grid, .pasos-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <div>
            <div className="hero-eyebrow"><span className="hero-dot" /> Educación financiera para jóvenes</div>
            <h1 className="hero-h1">
              Tu dinero,{' '}<span className="subray">tus reglas</span><br />
              <span className="accent">aprende hoy.</span>
            </h1>
            <p className="hero-desc">Moneduca te enseña todo lo que la escuela no te dijo sobre el dinero. Cursos cortos, prácticos y diseñados especialmente para ti.</p>
            <div className="hero-btns">
              <Link href="/registro" className="btn btn-primary" style={{ fontSize: 16, padding: '16px 32px' }}>Empezar gratis ✦</Link>
              <Link href="/cursos" className="btn btn-secondary" style={{ fontSize: 16, padding: '16px 32px' }}>Ver cursos</Link>
            </div>
            <div className="hero-stats">
              {[['5', 'módulos de aprendizaje'], ['100%', 'gratuito para empezar'], ['15min', 'por lección']].map(([n, l]) => (
                <div key={l}><div className="stat-num">{n}</div><div className="stat-label">{l}</div></div>
              ))}
            </div>
          </div>
          <div className="hero-visual">
            <div className="float-badge fb1">🎉 +500 jóvenes aprendiendo</div>
            <div className="hero-card">
              <p className="card-label">Tu progreso esta semana</p>
              {[{ name: 'Ahorro inteligente', pct: 80, color: '#00C896' }, { name: 'Presupuesto', pct: 45, color: '#FFD166' }, { name: 'Crédito y deudas', pct: 20, color: '#4361EE' }].map(item => (
                <div key={item.name} className="prog-item">
                  <div className="prog-header">
                    <span className="prog-name">{item.name}</span>
                    <span className="prog-pct" style={{ color: item.color }}>{item.pct}%</span>
                  </div>
                  <div className="prog-bar"><div className="prog-fill" style={{ width: `${item.pct}%`, background: item.color }} /></div>
                </div>
              ))}
              <div style={{ marginTop: 24, padding: '14px 16px', background: '#F9FAFB', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 24 }}>🤖</span>
                <div><div style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 600 }}>Asistente IA</div><div style={{ fontSize: 14 }}>¿Tienes alguna duda? ¡Pregúntame!</div></div>
              </div>
            </div>
            <div className="float-badge fb2" style={{ animationDelay: '1.5s' }}>🏆 Módulo completado</div>
          </div>
        </div>
      </section>

      {/* MÓDULOS */}
      <section className="section">
        <div className="container-md">
          <div className="section-header">
            <span className="tag-deco">Lo que aprenderás</span>
            <h2 className="section-h2">5 módulos para dominar tu dinero</h2>
            <p className="section-sub">Desde lo más básico hasta estrategias reales. Aprende a tu ritmo.</p>
          </div>
        </div>
        <div className="modulos-grid">
          {modulos.map((m, i) => (
            <Link key={i} href="/cursos" className="modulo-card">
              <div className="modulo-icon" style={{ background: m.color }}>{m.emoji}</div>
              <div className="modulo-nivel" style={{ background: m.color, color: m.accent }}>{m.nivel}</div>
              <h3 className="modulo-titulo">{m.titulo}</h3>
              <p className="modulo-desc">{m.desc}</p>
              <div className="modulo-arrow">Ver lección →</div>
            </Link>
          ))}
        </div>
      </section>

      {/* CHATBOT */}
      <section className="chat-section">
        <div className="chat-inner">
          <div>
            <span className="tag-deco">Asistente IA</span>
            <h2 className="chat-h2">Pregunta lo que quieras, cuando quieras</h2>
            <p className="chat-desc">Nuestro chatbot está entrenado en finanzas personales y responde con un lenguaje fácil de entender. Como tener un asesor financiero en el bolsillo.</p>
            <ul className="chat-feats">
              {['Explica conceptos difíciles en palabras simples', 'Responde dudas de tus lecciones al instante', 'Da ejemplos con situaciones de la vida real', 'Disponible las 24 horas del día'].map((t, i) => (
                <li key={i} className="chat-feat"><span className="feat-icon">✦</span><span>{t}</span></li>
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
          <Link href="/registro" className="btn btn-verde" style={{ fontSize: 17, padding: '18px 40px', position: 'relative', zIndex: 1 }}>
            Crear mi cuenta gratis ✦
          </Link>
        </div>
      </div>
    </>
  )
}
