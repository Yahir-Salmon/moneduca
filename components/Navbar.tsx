'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/cursos', label: 'Cursos' },
  { href: '/quienes-somos', label: 'Quiénes somos' },
  { href: '/contacto', label: 'Contacto' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      <style>{`
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          background: rgba(255,255,255,0.92); backdrop-filter: blur(12px);
          border-bottom: 1.5px solid #E5E7EB;
        }
        .nav-inner {
          max-width: 1200px; margin: 0 auto; padding: 0 24px;
          height: 68px; display: flex; align-items: center; justify-content: space-between;
        }
        .nav-logo {
          font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px;
          color: #0D0D0D; display: flex; align-items: center; gap: 8px;
        }
        .logo-box {
          width: 34px; height: 34px; background: #0D0D0D; border-radius: 10px;
          display: flex; align-items: center; justify-content: center; font-size: 18px;
        }
        .nav-links { display: flex; align-items: center; gap: 4px; }
        .nav-link {
          padding: 8px 16px; border-radius: 100px; font-size: 15px; font-weight: 500;
          color: #6B7280; transition: all 0.2s;
        }
        .nav-link:hover { color: #0D0D0D; background: #F4F4F6; }
        .nav-link.active { color: #0D0D0D; font-weight: 600; }
        .nav-cta { display: flex; align-items: center; gap: 10px; }
        .hamburger { display: none; background: none; border: none; cursor: pointer; padding: 8px; }
        .ham-line { display: block; width: 22px; height: 2px; background: #0D0D0D; margin: 5px 0; border-radius: 2px; }
        .mobile-menu {
          position: fixed; top: 68px; left: 0; right: 0; z-index: 99;
          background: white; border-bottom: 1.5px solid #E5E7EB; padding: 16px 24px 24px;
          transform: translateY(-110%); transition: transform 0.3s ease;
        }
        .mobile-menu.open { transform: translateY(0); }
        .mobile-link {
          display: block; padding: 14px 0; font-size: 18px;
          font-family: 'Syne', sans-serif; font-weight: 600;
          color: #0D0D0D; border-bottom: 1px solid #F4F4F6;
        }
        @media (max-width: 768px) {
          .nav-links, .nav-cta { display: none; }
          .hamburger { display: block; }
        }
      `}</style>

      <nav className="nav">
        <div className="nav-inner">
          <Link href="/" className="nav-logo">
            <div className="logo-box">💰</div>
            Moneduca
          </Link>
          <div className="nav-links">
            {links.map(l => (
              <Link key={l.href} href={l.href} className={`nav-link ${pathname === l.href ? 'active' : ''}`}>
                {l.label}
              </Link>
            ))}
          </div>
          <div className="nav-cta">
            <Link href="/registro" className="btn btn-outline" style={{ padding: '10px 20px', fontSize: 14 }}>Entrar</Link>
            <Link href="/registro" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: 14 }}>Empezar gratis</Link>
          </div>
          <button className="hamburger" onClick={() => setOpen(!open)}>
            <span className="ham-line" /><span className="ham-line" /><span className="ham-line" />
          </button>
        </div>
      </nav>

      <div className={`mobile-menu ${open ? 'open' : ''}`}>
        {links.map(l => (
          <Link key={l.href} href={l.href} className="mobile-link" onClick={() => setOpen(false)}>{l.label}</Link>
        ))}
        <Link href="/registro" className="btn btn-primary" style={{ marginTop: 16, width: '100%', justifyContent: 'center' }} onClick={() => setOpen(false)}>
          Empezar gratis
        </Link>
      </div>
    </>
  )
}
