'use client'
import { useLanguage } from '@/lib/language'
const valores = [
  { emoji: '🎯', titulo: 'Accesible', desc: 'Creemos que la educación financiera no debe ser un privilegio. Por eso Moneduca es gratis.' },
  { emoji: '🧠', titulo: 'Simple', desc: 'Nada de términos complicados. Explicamos todo con ejemplos de la vida real.' },
  { emoji: '🚀', titulo: 'Práctico', desc: 'Cada lección incluye ejercicios que puedes aplicar en tu vida hoy mismo.' },
  { emoji: '❤️', titulo: 'Para ti', desc: 'Diseñado específicamente para jóvenes mexicanos de secundaria.' },
]

export default function QuienesSomosPage() {
  const { t } = useLanguage()
  return (
    <>
      <style>{`
        .qs-hero { padding: 144px 0 88px; background: #FCE9B5; text-align: center; position: relative; overflow: hidden; border-bottom: 1px solid #E8D9B8; }
        .qs-hero-inner { max-width: 960px; margin: 0 auto; display: grid; grid-template-columns: 1fr 180px; gap: 44px; align-items: center; text-align: left; position: relative; z-index: 1; }
        .qs-mascot { width: 180px; max-height: 220px; object-fit: contain; filter: drop-shadow(0 12px 14px rgba(83,49,17,0.13)); }
        .qs-hero::before { content: ''; position: absolute; top: -210px; left: 58%; width: 740px; height: 560px; border-radius: 50%; background: radial-gradient(circle, rgba(200,147,74,.22), transparent 68%); pointer-events: none; }
        .qs-h1 { font-size: clamp(36px,5vw,60px); font-weight: 700; color: #3D2A0E; margin-bottom: 20px; position: relative; z-index: 1; }
        .qs-h1 span { color: #8B5723; }
        .qs-desc { font-size: 18px; color: #6B4520; max-width: 560px; margin: 0 auto; position: relative; z-index: 1; }
        .qs-body { max-width: 1200px; margin: 0 auto; padding: 96px 24px; }
        .mision-card { background: #FFF8E8; border-radius: 24px; padding: 64px; border: 1.5px solid #E8D9B8; margin-bottom: 80px; text-align: center; }
        .mision-emoji { font-size: 56px; margin-bottom: 24px; }
        .mision-h2 { font-size: 32px; font-weight: 800; margin-bottom: 16px; }
        .mision-text { font-size: 17px; color: #8C6D45; max-width: 680px; margin: 0 auto; line-height: 1.8; }
        .valores-h2 { font-size: 36px; font-weight: 800; text-align: center; margin-bottom: 48px; }
        .valores-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; margin-bottom: 80px; }
        .valor-card { border: 1.5px solid #E8D9B8; border-radius: 18px; padding: 32px; background: #FFFDF5; transition: all 0.3s ease; }
        .valor-card:hover { border-color: #C8934A; box-shadow: 0 8px 24px rgba(145,99,47,0.12); transform: translateY(-4px); }
        .valor-emoji { font-size: 36px; margin-bottom: 16px; }
        .valor-tit { font-size: 20px; font-weight: 700; margin-bottom: 10px; }
        .valor-desc { color: #8C6D45; font-size: 15px; }
        .problema { background: #3D2A0E; border-radius: 24px; padding: 64px; color: white; }
        .prob-h2 { font-size: 32px; font-weight: 800; margin-bottom: 24px; color: #FFF3D4; }
        .prob-h2 span { color: #FCE68B; }
        .prob-text { color: #E8D4B6; font-size: 16px; line-height: 1.8; margin-bottom: 16px; }
        .qs-hero .tag-deco { background: rgba(255,253,245,0.65); }
        @media (max-width: 768px) { .qs-hero-inner { grid-template-columns: 1fr; text-align: center; } .qs-mascot { width: 125px; margin: 0 auto; } .valores-grid { grid-template-columns: 1fr; } .mision-card, .problema { padding: 40px 24px; } }
      `}</style>
      <div className="qs-hero">
        <div className="container-md">
          <div className="qs-hero-inner">
          <div>
          <span className="tag-deco">{t('Nuestra historia')}</span>
          <h1 className="qs-h1">{t('Nacimos para que el')} <span>{t('dinero')}</span><br />{t('deje de ser un misterio')}</h1>
          <p className="qs-desc">{t('Moneduca es una plataforma de educación financiera creada para jóvenes que quieren tomar el control de su futuro.')}</p>
          </div>
          <img className="qs-mascot" src="/monedoki.png" alt="Monedoki" />
          </div>
        </div>
      </div>
      <div className="qs-body">
        <div className="mision-card">
          <div className="mision-emoji">🌱</div>
          <h2 className="mision-h2">{t('Nuestra misión')}</h2>
          <p className="mision-text">{t('Queremos que cada joven en México tenga las herramientas para tomar decisiones financieras inteligentes. No importa cuánto dinero tengas hoy — lo importante es saber cómo usarlo, ahorrarlo y hacerlo crecer. Eso es lo que enseñamos en Moneduca.')}</p>
        </div>
        <h2 className="valores-h2">{t('Nuestros valores')}</h2>
        <div className="valores-grid">
          {valores.map((v, i) => (
            <div key={i} className="valor-card">
              <div className="valor-emoji">{v.emoji}</div>
              <h3 className="valor-tit">{t(v.titulo)}</h3>
              <p className="valor-desc">{t(v.desc)}</p>
            </div>
          ))}
        </div>
        <div className="problema">
          <h2 className="prob-h2">{t('El')} <span>{t('problema')}</span> {t('que queremos resolver')}</h2>
          <p className="prob-text">{t('En México, la educación financiera casi no existe en la escuela. Millones de jóvenes llegan a la adultez sin saber cómo hacer un presupuesto, qué es el interés compuesto, o por qué importa tener un fondo de emergencia.')}</p>
          <p className="prob-text">{t('Las consecuencias son reales: deudas impagables, falta de ahorro, decisiones financieras malas que se arrastran toda la vida. Creemos que eso puede cambiar — y que el mejor momento para aprender es ahora, cuando eres joven.')}</p>
        </div>
      </div>
    </>
  )
}
