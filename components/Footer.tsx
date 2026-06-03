import Link from 'next/link'

export default function Footer() {
  return (
    <>
      <style>{`
        .footer { background: #3D2A0E; color: #C8934A; padding: 64px 0 32px; }
        .footer-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        .footer-top {
          display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px;
          padding-bottom: 48px; border-bottom: 1px solid rgba(200,147,74,0.2);
        }
        .footer-logo { font-family: 'Fredoka',sans-serif; font-size: 22px; font-weight: 700; color: rgba(252,230,139,1); display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
        .footer-logo-box { width: 34px; height: 34px; background: rgba(250,191,77,1); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
        .footer-desc { font-size: 14px; line-height: 1.7; max-width: 280px; color: #A87840; }
        .footer-col-title { font-family: 'Nunito',sans-serif; font-size: 12px; font-weight: 800; color: rgba(252,230,139,0.8); letter-spacing: 0.07em; text-transform: uppercase; margin-bottom: 18px; }
        .footer-link { display: block; color: #A87840; font-size: 14px; margin-bottom: 10px; transition: color 0.2s; font-family: 'Nunito',sans-serif; }
        .footer-link:hover { color: rgba(252,230,139,1); }
        .footer-bottom { display: flex; justify-content: space-between; align-items: center; padding-top: 32px; font-size: 13px; font-family: 'Nunito',sans-serif; }
        .footer-mascot { font-size: 28px; }
        @media (max-width: 768px) {
          .footer-top { grid-template-columns: 1fr 1fr; gap: 32px; }
          .footer-bottom { flex-direction: column; gap: 10px; text-align: center; }
        }
      `}</style>
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div>
              <div className="footer-logo">
                <div className="footer-logo-box">🦊</div>
                Moneduca
              </div>
              <p className="footer-desc">Educación financiera divertida y accesible para jóvenes de secundaria. Aprende a manejar tu dinero desde hoy.</p>
            </div>
            <div>
              <p className="footer-col-title">Aprende</p>
              <Link href="/cursos" className="footer-link">Todos los cursos</Link>
              <Link href="/cursos#ahorro" className="footer-link">Ahorro</Link>
              <Link href="/cursos#presupuesto" className="footer-link">Presupuesto</Link>
              <Link href="/cursos#inversion" className="footer-link">Inversión</Link>
            </div>
            <div>
              <p className="footer-col-title">Nosotros</p>
              <Link href="/quienes-somos" className="footer-link">Quiénes somos</Link>
              <Link href="/contacto" className="footer-link">Contacto</Link>
              <Link href="/registro" className="footer-link">Crear cuenta</Link>
            </div>
            <div>
              <p className="footer-col-title">Legal</p>
              <Link href="#" className="footer-link">Privacidad</Link>
              <Link href="#" className="footer-link">Términos</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 <span style={{ color: 'rgba(252,230,139,1)' }}>Moneduca</span>. Todos los derechos reservados.</p>
            <span className="footer-mascot">🦊</span>
            <p style={{ color: '#A87840' }}>Hecho con ❤️ para jóvenes mexicanos</p>
          </div>
        </div>
      </footer>
    </>
  )
}
