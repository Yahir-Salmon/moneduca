const valores = [
  { emoji: '🎯', titulo: 'Accesible', desc: 'Creemos que la educación financiera no debe ser un privilegio. Por eso Moneduca es gratis.' },
  { emoji: '🧠', titulo: 'Simple', desc: 'Nada de términos complicados. Explicamos todo con ejemplos de la vida real.' },
  { emoji: '🚀', titulo: 'Práctico', desc: 'Cada lección incluye ejercicios que puedes aplicar en tu vida hoy mismo.' },
  { emoji: '❤️', titulo: 'Para ti', desc: 'Diseñado específicamente para jóvenes mexicanos de secundaria.' },
]

export default function QuienesSomosPage() {
  return (
    <>
      <style>{`
        .qs-hero { padding: 140px 0 80px; background: #0D0D0D; text-align: center; position: relative; overflow: hidden; }
        .qs-hero::before { content: ''; position: absolute; top: -100px; left: 50%; transform: translateX(-50%); width: 700px; height: 400px; background: radial-gradient(circle, rgba(0,200,150,0.15) 0%, transparent 70%); }
        .qs-h1 { font-size: clamp(36px,5vw,60px); font-weight: 800; color: white; margin-bottom: 20px; position: relative; z-index: 1; }
        .qs-h1 span { color: #00C896; }
        .qs-desc { font-size: 18px; color: #9CA3AF; max-width: 560px; margin: 0 auto; position: relative; z-index: 1; }
        .qs-body { max-width: 1200px; margin: 0 auto; padding: 96px 24px; }
        .mision-card { background: #F9FAFB; border-radius: 32px; padding: 64px; border: 1.5px solid #E5E7EB; margin-bottom: 80px; text-align: center; }
        .mision-emoji { font-size: 56px; margin-bottom: 24px; }
        .mision-h2 { font-size: 32px; font-weight: 800; margin-bottom: 16px; }
        .mision-text { font-size: 17px; color: #6B7280; max-width: 680px; margin: 0 auto; line-height: 1.8; }
        .valores-h2 { font-size: 36px; font-weight: 800; text-align: center; margin-bottom: 48px; }
        .valores-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; margin-bottom: 80px; }
        .valor-card { border: 1.5px solid #E5E7EB; border-radius: 20px; padding: 32px; background: white; transition: all 0.3s ease; }
        .valor-card:hover { border-color: #00C896; box-shadow: 0 8px 32px rgba(0,200,150,0.12); transform: translateY(-4px); }
        .valor-emoji { font-size: 36px; margin-bottom: 16px; }
        .valor-tit { font-size: 20px; font-weight: 700; margin-bottom: 10px; }
        .valor-desc { color: #6B7280; font-size: 15px; }
        .problema { background: #0D0D0D; border-radius: 32px; padding: 64px; color: white; }
        .prob-h2 { font-size: 32px; font-weight: 800; margin-bottom: 24px; }
        .prob-h2 span { color: #00C896; }
        .prob-text { color: #9CA3AF; font-size: 16px; line-height: 1.8; margin-bottom: 16px; }
        @media (max-width: 768px) { .valores-grid { grid-template-columns: 1fr; } .mision-card, .problema { padding: 40px 24px; } }
      `}</style>
      <div className="qs-hero">
        <div className="container-md">
          <span className="tag-deco">Nuestra historia</span>
          <h1 className="qs-h1">Nacimos para que el <span>dinero</span><br />deje de ser un misterio</h1>
          <p className="qs-desc">Moneduca es una plataforma de educación financiera creada para jóvenes que quieren tomar el control de su futuro.</p>
        </div>
      </div>
      <div className="qs-body">
        <div className="mision-card">
          <div className="mision-emoji">🌱</div>
          <h2 className="mision-h2">Nuestra misión</h2>
          <p className="mision-text">Queremos que cada joven en México tenga las herramientas para tomar decisiones financieras inteligentes. No importa cuánto dinero tengas hoy — lo importante es saber cómo usarlo, ahorrarlo y hacerlo crecer. Eso es lo que enseñamos en Moneduca.</p>
        </div>
        <h2 className="valores-h2">Nuestros valores</h2>
        <div className="valores-grid">
          {valores.map((v, i) => (
            <div key={i} className="valor-card">
              <div className="valor-emoji">{v.emoji}</div>
              <h3 className="valor-tit">{v.titulo}</h3>
              <p className="valor-desc">{v.desc}</p>
            </div>
          ))}
        </div>
        <div className="problema">
          <h2 className="prob-h2">El <span>problema</span> que queremos resolver</h2>
          <p className="prob-text">En México, la educación financiera casi no existe en la escuela. Millones de jóvenes llegan a la adultez sin saber cómo hacer un presupuesto, qué es el interés compuesto, o por qué importa tener un fondo de emergencia.</p>
          <p className="prob-text">Las consecuencias son reales: deudas impagables, falta de ahorro, decisiones financieras malas que se arrastran toda la vida. Creemos que eso puede cambiar — y que el mejor momento para aprender es ahora, cuando eres joven.</p>
        </div>
      </div>
    </>
  )
}
