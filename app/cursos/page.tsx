import Link from 'next/link'

const cursos = [
  { id: 'ahorro', emoji: '🏦', color: '#D4F5EB', accent: '#00C896', titulo: 'Ahorro inteligente', desc: 'Aprende por qué ahorrar es el primer paso hacia la libertad financiera y cómo hacerlo aunque tengas poco dinero.', nivel: 'Básico', lecciones: 4, tiempo: '1 hora', temas: ['¿Qué es el ahorro?', 'La regla del 20%', 'Cómo crear el hábito', 'Tu primer fondo de emergencia'] },
  { id: 'presupuesto', emoji: '📊', color: '#FFF8E7', accent: '#B8860B', titulo: 'Tu primer presupuesto', desc: 'Crea un plan mensual para que tu dinero alcance para todo lo que quieres y necesitas.', nivel: 'Básico', lecciones: 5, tiempo: '1.5 horas', temas: ['¿Qué es un presupuesto?', 'Ingresos vs gastos', 'La regla 50/30/20', 'Gastos hormiga', 'Presupuesto digital'] },
  { id: 'deuda', emoji: '💳', color: '#FFE8E8', accent: '#CC3333', titulo: 'Deudas y crédito', desc: 'Entiende cómo funciona el crédito, cuándo es útil y cómo evitar caer en deudas que no puedas pagar.', nivel: 'Intermedio', lecciones: 5, tiempo: '1.5 horas', temas: ['¿Qué es el crédito?', 'Tarjetas de crédito', 'La tasa de interés', 'Buró de crédito', 'Paga tus deudas'] },
  { id: 'inversion', emoji: '📈', color: '#E8EDFF', accent: '#4361EE', titulo: 'Introducción a invertir', desc: 'Descubre cómo tu dinero puede crecer solo mientras tú duermes. Conceptos básicos de inversión.', nivel: 'Intermedio', lecciones: 6, tiempo: '2 horas', temas: ['¿Qué es invertir?', 'Riesgo y rendimiento', 'Interés compuesto', 'CETES y más', 'Diversificación', 'Empieza hoy'] },
  { id: 'metas', emoji: '🎯', color: '#F3E8FF', accent: '#7B2FBE', titulo: 'Metas financieras', desc: 'Aprende a planear para lo que sueñas: viajes, gadgets, universidad y mucho más.', nivel: 'Avanzado', lecciones: 4, tiempo: '1 hora', temas: ['Define tu meta', 'Calcula cuánto necesitas', 'Plan de acción', 'Mantente motivado'] },
]

export default function CursosPage() {
  return (
    <>
      <style>{`
        .cursos-hero { padding: 140px 0 80px; background: #FAFAFA; text-align: center; }
        .cursos-h1 { font-size: clamp(36px,5vw,60px); font-weight: 800; margin-bottom: 16px; }
        .cursos-desc { font-size: 18px; color: #6B7280; max-width: 520px; margin: 0 auto; }
        .cursos-list { max-width: 1200px; margin: 0 auto; padding: 80px 24px; display: flex; flex-direction: column; gap: 28px; }
        .curso-row {
          border-radius: 24px; border: 1.5px solid #E5E7EB; padding: 36px;
          display: grid; grid-template-columns: auto 1fr auto; gap: 32px; align-items: start;
          transition: all 0.3s ease; background: white;
        }
        .curso-row:hover { border-color: transparent; box-shadow: 0 16px 48px rgba(0,0,0,0.1); transform: translateY(-4px); }
        .curso-icon { width: 72px; height: 72px; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 36px; flex-shrink: 0; }
        .curso-meta { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; flex-wrap: wrap; }
        .curso-nivel { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; border-radius: 100px; padding: 4px 12px; }
        .curso-info { font-size: 13px; color: #9CA3AF; }
        .curso-titulo { font-size: 22px; font-weight: 800; margin-bottom: 10px; }
        .curso-desc { font-size: 15px; color: #6B7280; margin-bottom: 20px; }
        .curso-temas { display: flex; flex-wrap: wrap; gap: 8px; }
        .tema-chip { font-size: 12px; padding: 5px 12px; background: #F4F4F6; border-radius: 100px; color: #6B7280; }
        .curso-cta { flex-shrink: 0; display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }
        @media (max-width: 768px) { .curso-row { grid-template-columns: 1fr; } .curso-cta { align-items: flex-start; } }
      `}</style>
      <div className="cursos-hero">
        <div className="container-md">
          <span className="tag-deco">Biblioteca de cursos</span>
          <h1 className="cursos-h1">Todo lo que necesitas<br />para manejar tu dinero</h1>
          <p className="cursos-desc">5 módulos, más de 24 lecciones. Aprende a tu ritmo, cuando quieras.</p>
        </div>
      </div>
      <div className="cursos-list">
        {cursos.map(c => (
          <div key={c.id} id={c.id} className="curso-row">
            <div className="curso-icon" style={{ background: c.color }}>{c.emoji}</div>
            <div>
              <div className="curso-meta">
                <span className="curso-nivel" style={{ background: c.color, color: c.accent }}>{c.nivel}</span>
                <span className="curso-info">📖 {c.lecciones} lecciones</span>
                <span className="curso-info">⏱ {c.tiempo}</span>
              </div>
              <h2 className="curso-titulo">{c.titulo}</h2>
              <p className="curso-desc">{c.desc}</p>
              <div className="curso-temas">{c.temas.map(t => <span key={t} className="tema-chip">{t}</span>)}</div>
            </div>
            <div className="curso-cta">
              <Link href="/registro" className="btn btn-primary">Empezar →</Link>
              <span style={{ fontSize: 13, color: '#9CA3AF' }}>Gratis</span>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
