'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const links = [
  { href: '/cursos', label: 'Cursos' },
  { href: '/quienes-somos', label: 'Nosotros' },
  { href: '/contacto', label: 'Contacto' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [session, setSession] = useState(false)
  const [nombre, setNombre] = useState('')
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(!!session)
      if (session?.user) {
        const n = session.user.user_metadata?.nombre || session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || ''
        setNombre(n)
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(!!session)
      if (session?.user) {
        const n = session.user.user_metadata?.nombre || session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || ''
        setNombre(n)
      } else { setNombre('') }
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <>
      <style>{`
        .nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: rgba(255,253,245,0.95); backdrop-filter: blur(12px); border-bottom: 1px solid #E8D9B8; }
        .nav-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; height: 68px; display: flex; align-items: center; justify-content: space-between; }
        .nav-logo { font-family: 'Fredoka',sans-serif; font-weight: 600; font-size: 22px; color: #3D2A0E; display: flex; align-items: center; gap: 10px; }
        .logo-box { width: 36px; height: 36px; background: rgba(250,191,77,1); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
        .nav-links { display: flex; align-items: center; gap: 4px; }
        .nav-link { padding: 8px 16px; border-radius: 100px; font-size: 15px; font-weight: 600; color: #8C6D45; transition: all 0.2s; font-family: 'Nunito',sans-serif; }
        .nav-link:hover { color: #3D2A0E; background: rgba(252,230,139,0.3); }
        .nav-link.active { color: #6B4520; background: rgba(252,230,139,0.4); }
        .nav-right { display: flex; align-items: center; gap: 10px; }
        .nav-user-name { font-family: 'Fredoka',sans-serif; font-size: 15px; color: #6B4520; padding: 8px 14px; background: rgba(252,230,139,0.4); border-radius: 100px; }
        .nav-logout { background: none; border: 1.5px solid #E8D9B8; border-radius: 100px; padding: 8px 16px; font-family: 'Nunito',sans-serif; font-size: 14px; color: #8C6D45; cursor: pointer; transition: all 0.2s; }
        .nav-logout:hover { border-color: #C8934A; color: #6B4520; }
        .hamburger { display: none; background: none; border: none; cursor: pointer; padding: 8px; }
        .ham-line { display: block; width: 22px; height: 2px; background: #6B4520; margin: 5px 0; border-radius: 2px; }
        .mobile-menu { position: fixed; top: 68px; left: 0; right: 0; z-index: 99; background: #FFFDF5; border-bottom: 1px solid #E8D9B8; padding: 16px 24px 24px; transform: translateY(-110%); transition: transform 0.3s ease; }
        .mobile-menu.open { transform: translateY(0); }
        .mobile-link { display: block; padding: 14px 0; font-size: 18px; font-family: 'Fredoka',sans-serif; font-weight: 600; color: #3D2A0E; border-bottom: 1px solid #E8D9B8; }
        @media (max-width: 768px) { .nav-links, .nav-right { display: none; } .hamburger { display: block; } }
      `}</style>

      <nav className="nav">
        <div className="nav-inner">
          <Link href="/" className="nav-logo">
            <div className="logo-box">🦊</div>
            Moneduca
          </Link>

          <div className="nav-links">
            {links.map(l => (
              <Link key={l.href} href={l.href} className={`nav-link ${pathname === l.href ? 'active' : ''}`}>{l.label}</Link>
            ))}
            {session && (
              <Link href="/dashboard" className={`nav-link ${pathname === '/dashboard' ? 'active' : ''}`}>Mi cuenta</Link>
            )}
          </div>

          <div className="nav-right">
            {session ? (
              <>
                <span className="nav-user-name">🦊 {nombre}</span>
                <button className="nav-logout" onClick={handleLogout}>Salir</button>
              </>
            ) : (
              <Link href="/registro" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: 14 }}>Empezar gratis ✦</Link>
            )}
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
        {session ? (
          <>
            <Link href="/dashboard" className="mobile-link" onClick={() => setOpen(false)}>Mi cuenta</Link>
            <button onClick={() => { handleLogout(); setOpen(false) }} style={{ marginTop: 16, width: '100%', padding: '14px', borderRadius: 100, border: '2px solid #E8D9B8', background: 'transparent', fontFamily: "'Fredoka',sans-serif", fontSize: 16, color: '#8C6D45', cursor: 'pointer' }}>
              Cerrar sesión
            </button>
          </>
        ) : (
          <Link href="/registro" className="btn btn-primary" style={{ marginTop: 16, width: '100%', justifyContent: 'center' }} onClick={() => setOpen(false)}>
            Empezar gratis ✦
          </Link>
        )}
      </div>
    </>
  )
}
