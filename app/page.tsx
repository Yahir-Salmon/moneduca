import Link from 'next/link'
import Chatbot from '@/components/Chatbot'

const modulos = [
  { emoji: '🏦', bg: 'rgba(252,230,139,0.5)', accent: '#C8934A', titulo: 'Ahorro inteligente', desc: 'Aprende por qué ahorrar es el primer paso y cómo hacerlo aunque tengas poco.', nivel: 'Básico' },
  { emoji: '📊', bg: 'rgba(250,191,77,0.25)', accent: '#6B4520', titulo: 'Tu primer presupuesto', desc: 'Crea un plan mensual para que tu dinero alcance para todo lo que quieres.', nivel: 'Básico' },
  { emoji: '💳', bg: 'rgba(145,99,47,0.1)', accent: '#8C6D45', titulo: 'Deudas y crédito', desc: 'Entiende cómo funciona el crédito y cómo evitar caer en deudas.', nivel: 'Intermedio' },
  { emoji: '📈', bg: 'rgba(252,230,139,0.4)', accent: '#C8934A', titulo: 'Introducción a invertir', desc: 'Descubre cómo tu dinero puede crecer solo mientras tú duermes.', nivel: 'Intermedio' },
  { emoji: '🎯', bg: 'rgba(145,99,47,0.15)', accent: '#6B4520', titulo: 'Metas financieras', desc: 'Planea para lo que sueñas: viajes, gadgets, universidad y más.', nivel: 'Avanzado' },
]

const pasos = [
  { num: '01', titulo: 'Crea tu cuenta gratis', desc: 'Sin tarjeta de crédito. Solo regístrate con tu email.' },
  { num: '02', titulo: 'Elige tu módulo', desc: 'Empieza por donde quieras. Cada lección dura 15 minutos.' },
  { num: '03', titulo: 'Aprende y practica', desc: 'Ejercicios y quizzes para que el conocimiento se quede.' },
  { num: '04', titulo: 'Pregúntale al chat', desc: 'Nuestro asistente de IA responde tus dudas cuando quieras.' },
]

export default function HomePage() {
  return (
    <>
      <style>{`
        /* HERO */
        .hero {
          min-height: 100vh; padding-top: 68px;
          display: flex; align-items: center;
          background: #FFF8E8; position: relative; overflow: hidden;
        }
        .hero::before {
          content: ''; position: absolute; top: -150px; right: -150px;
          width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, rgba(250,191,77,0.2) 0%, transparent 70%);
          pointer-events: none;
        }
        .hero-inner {
          max-width: 1200px; margin: 0 auto; padding: 80px 24px;
          display: grid; grid-template-columns: 1fr 420px; gap: 64px; align-items: center;
          position: relative; z-index: 1;
        }
        .hero-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(252,230,139,0.6); color: #6B4520;
          padding: 8px 16px; border-radius: 100px;
          font-size: 13px; font-weight: 700; margin-bottom: 24px;
          font-family: 'Nunito', sans-serif;
        }
        .hero-dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(250,191,77,1); animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.5);opacity:0.6} }
        .hero-h1 { font-size: clamp(40px,5vw,62px); font-weight: 700; line-height: 1.05; margin-bottom: 20px; color: #3D2A0E; }
        .hero-h1 .accent { color: #C8934A; }
        .hero-h1 .subray { position: relative; display: inline-block; }
        .hero-h1 .subray::after { content: ''; position: absolute; bottom: -4px; left: 0; right: 0; height: 4px; background: rgba(250,191,77,1); border-radius: 2px; }
        .hero-desc { font-size: 18px; color: #8C6D45; margin-bottom: 36px; max-width: 480px; line-height: 1.7; }
        .hero-btns { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 48px; }
        .hero-stats { display: flex; gap: 32px; }
        .stat-num { font-family: 'Fredoka',sans-serif; font-size: 28px; font-weight: 700; color: #3D2A0E; }
        .stat-label { font-size: 13px; color: #A87840; font-family: 'Nunito',sans-serif; }
        /* Mascot card */
        .hero-right { position: relative; display: flex; flex-direction: column; align-items: center; gap: 20px; }
        .mascot-bubble {
          background: rgba(250,191,77,1); border-radius: 20px; padding: 16px 20px;
          font-family: 'Fredoka',sans-serif; font-size: 17px; font-weight: 700;
          color: #3D2A0E; text-align: center; position: relative;
          box-shadow: 4px 4px 0px rgba(145,99,47,0.3);
        }
        .mascot-bubble::after {
          content: ''; position: absolute; bottom: -12px; left: 50%; transform: translateX(-50%);
          border: 12px solid transparent; border-top-color: rgba(250,191,77,1); border-bottom: 0;
        }
        .mascot-img {
          width: 180px; height: 180px; object-fit: contain;
        }
        .hero-card {
          background: #FFFDF5; border-radius: 20px; border: 1px solid #E8D9B8;
          padding: 24px; width: 100%;
          box-shadow: 4px 4px 0px rgba(145,99,47,0.1);
        }
        .card-label { font-size: 12px; color: #A87840; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 16px; font-weight: 700; font-family: 'Nunito',sans-serif; }
        .prog-item { margin-bottom: 14px; }
        .prog-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
        .prog-name { font-size: 13px; font-weight: 600; color: #3D2A0E; font-family: 'Nunito',sans-serif; }
        .prog-pct { font-size: 12px; font-weight: 700; font-family: 'Nunito',sans-serif; }
        .prog-bar { height: 8px; background: rgba(232,217,184,0.5); border-radius: 100px; overflow: hidden; }
        .prog-fill { height: 100%; border-radius: 100px; }
        /* Módulos */
        .modulos-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;
          max-width: 1200px; margin: 0 auto; padding: 0 24px;
        }
        .modulo-card {
          border-radius: 20px; border: 1px solid #E8D9B8; padding: 28px;
          background: #FFFDF5; transition: all 0.3s ease; display: block; color: inherit;
        }
        .modulo-card:hover { transform: translateY(-6px); box-shadow: 6px 6px 0px rgba(145,99,47,0.15); border-color: rgba(250,191,77,0.6); }
        .modulo-icon { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 26px; margin-bottom: 16px; }
        .modulo-nivel { font-size: 11px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; border-radius: 100px; padding: 4px 10px; margin-bottom: 10px; display: inline-block; font-family: 'Nunito',sans-serif; }
        .modulo-titulo { font-size: 17px; font-weight: 700; margin-bottom: 8px; color: #3D2A0E; }
        .modulo-desc { font-size: 13px; color: #8C6D45; line-height: 1.6; font-family: 'Nunito',sans-serif; }
        .modulo-arrow { display: inline-flex; align-items: center; gap: 6px; margin-top: 16px; font-size: 13px; font-weight: 700; color: #C8934A; font-family: 'Nunito',sans-serif; }
        /* Chatbot section */
        .chat-section { background: #FFF8E8; padding: 96px 0; }
        .chat-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .chat-h2 { font-size: clamp(28px,3vw,40px); font-weight: 700; margin-bottom: 16px; color: #3D2A0E; }
        .chat-desc { font-size: 16px; color: #8C6D45; margin-bottom: 24px; font-family: 'Nunito',sans-serif; }
        .chat-feats { list-style: none; }
        .chat-feat { display: flex; align-items: flex-start; gap: 12px; padding: 12px 0; border-bottom: 1px solid #E8D9B8; font-size: 15px; font-family: 'Nunito',sans-serif; color: #6B4520; }
        .feat-icon { width: 26px; height: 26px; background: rgba(252,230,139,0.6); border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 13px; }
        /* Monedoki CTA section */
        .mascot-section {
          background: rgba(250,191,77,0.12); border-radius: 32px;
          padding: 64px; margin: 0 24px 96px;
          display: grid; grid-template-columns: 1fr auto; gap: 48px; align-items: center;
          border: 1px solid rgba(250,191,77,0.4);
        }
        .mascot-section-img { width: 140px; }
        /* Pasos */
        .pasos-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        .paso-num { font-family: 'Fredoka',sans-serif; font-size: 42px; font-weight: 700; color: #E8D9B8; margin-bottom: 10px; line-height: 1; }
        .paso-titulo { font-size: 16px; font-weight: 700; margin-bottom: 8px; color: #3D2A0E; }
        .paso-desc { font-size: 14px; color: #8C6D45; font-family: 'Nunito',sans-serif; }
        /* CTA */
        .cta-wrap { padding: 0 24px 96px; }
        .cta-box {
          background: #3D2A0E; border-radius: 32px; padding: 80px 64px;
          text-align: center; position: relative; overflow: hidden;
        }
        .cta-box::before {
          content: ''; position: absolute; top: -80px; left: 50%; transform: translateX(-50%);
          width: 500px; height: 300px;
          background: radial-gradient(circle, rgba(250,191,77,0.15) 0%, transparent 70%);
          pointer-events: none;
        }
        .cta-h2 { font-size: clamp(28px,4vw,46px); font-weight: 700; color: rgba(252,230,139,1); margin-bottom: 16px; position: relative; z-index: 1; }
        .cta-h2 span { color: rgba(250,191,77,1); }
        .cta-desc { color: #A87840; font-size: 18px; margin-bottom: 36px; position: relative; z-index: 1; font-family: 'Nunito',sans-serif; }
        .section-header { text-align: center; margin-bottom: 56px; }
        .section-h2 { font-size: clamp(28px,3.5vw,42px); font-weight: 700; margin-bottom: 12px; color: #3D2A0E; }
        .section-sub { font-size: 17px; color: #8C6D45; max-width: 520px; margin: 0 auto; font-family: 'Nunito',sans-serif; }
        @media (max-width: 900px) {
          .hero-inner { grid-template-columns: 1fr; }
          .hero-right { display: none; }
          .chat-inner { grid-template-columns: 1fr; }
          .modulos-grid { grid-template-columns: 1fr 1fr; }
          .pasos-grid { grid-template-columns: 1fr 1fr; }
          .cta-box, .mascot-section { padding: 48px 32px; margin: 0 16px 64px; }
          .mascot-section { grid-template-columns: 1fr; }
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
              Tu dinero,{' '}<span className="subray">tus reglas.</span><br />
              <span className="accent">Aprende hoy.</span>
            </h1>
            <p className="hero-desc">Moneduca te enseña todo lo que la escuela no te dijo sobre el dinero. Cursos cortos, prácticos y diseñados para ti.</p>
            <div className="hero-btns">
              <Link href="/registro" className="btn btn-primary" style={{ fontSize: 16, padding: '16px 32px' }}>Empezar gratis ✦</Link>
              <Link href="/cursos" className="btn btn-secondary" style={{ fontSize: 16, padding: '16px 32px' }}>Ver cursos</Link>
            </div>
            <div className="hero-stats">
              {[['5', 'módulos'], ['100%', 'gratuito'], ['15min', 'por lección']].map(([n, l]) => (
                <div key={l}>
                  <div className="stat-num">{n}</div>
                  <div className="stat-label">{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="hero-right">
            <div className="mascot-bubble">¡Hola! Soy Monedoki 🦊<br/>¡Te enseño a manejar tu lana!</div>
            <img src="/monedoki.png" alt="Monedoki" className="mascot-img" onError={(e) => { (e.target as HTMLImageElement).style.display='none' }} />
            <div className="hero-card">
              <p className="card-label">Tu progreso esta semana</p>
              {[{ name: 'Ahorro inteligente', pct: 80, color: 'rgba(250,191,77,1)' }, { name: 'Presupuesto', pct: 45, color: '#C8934A' }, { name: 'Crédito y deudas', pct: 20, color: '#8C6D45' }].map(item => (
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
            <h2 className="section-h2">5 módulos para dominar tu dinero</h2>
            <p className="section-sub">Desde lo más básico hasta estrategias reales. Aprende a tu ritmo.</p>
          </div>
        </div>
        <div className="modulos-grid">
          {modulos.map((m, i) => (
            <Link key={i} href="/cursos" className="modulo-card">
              <div className="modulo-icon" style={{ background: m.bg }}>{m.emoji}</div>
              <div className="modulo-nivel" style={{ background: m.bg, color: m.accent }}>{m.nivel}</div>
              <h3 className="modulo-titulo">{m.titulo}</h3>
              <p className="modulo-desc">{m.desc}</p>
              <div className="modulo-arrow">Ver lección →</div>
            </Link>
          ))}
        </div>
      </section>

      {/* MONEDOKI CTA */}
      <div className="container-md">
        <div className="mascot-section">
          <div>
            <span className="tag-deco">Tu compañero de aprendizaje</span>
            <h2 style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 'clamp(24px,3vw,36px)', fontWeight: 700, marginBottom: 16, color: '#3D2A0E' }}>
              Monedoki te acompaña en cada lección
            </h2>
            <p style={{ fontSize: 16, color: '#8C6D45', marginBottom: 28, fontFamily: "'Nunito',sans-serif", lineHeight: 1.7 }}>
              Aprende finanzas de la mano de Monedoki. Te da tips, te celebra cuando avanzas y te anima cuando te trabas. ¡Como un buen amigo!
            </p>
            <Link href="/registro" className="btn btn-primary">Conocer a Monedoki ✦</Link>
          </div>
          <img src="/monedoki.png" alt="Monedoki" className="mascot-section-img" onError={(e) => { (e.target as HTMLImageElement).style.fontSize='80px'; (e.target as HTMLImageElement).alt='🦊' }} />
        </div>
      </div>

      {/* CHATBOT */}
      <section className="chat-section">
        <div className="chat-inner">
          <div>
            <span className="tag-deco">Asistente IA</span>
            <h2 className="chat-h2">Pregunta lo que quieras, cuando quieras</h2>
            <p className="chat-desc">Nuestro chatbot responde con lenguaje fácil de entender. Como tener un asesor financiero en el bolsillo.</p>
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
          <Link href="/registro" className="btn btn-yellow" style={{ fontSize: 17, padding: '18px 40px', position: 'relative', zIndex: 1 }}>
            Crear mi cuenta gratis ✦
          </Link>
        </div>
      </div>
    </>
  )
}
