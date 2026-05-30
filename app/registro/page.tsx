'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function RegistroPage() {
  const [tab, setTab] = useState<'registro' | 'login'>('registro')
  const [form, setForm] = useState({ nombre: '', email: '', password: '', edad: '' })

  return (
    <>
      <style>{`
        .registro-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 100px 24px 60px; background: #FAFAFA; }
        .registro-card { background: white; border-radius: 28px; border: 1.5px solid #E5E7EB; padding: 48px; width: 100%; max-width: 480px; box-shadow: 0 20px 60px rgba(0,0,0,0.08); }
        .registro-logo { font-family: 'Syne',sans-serif; font-size: 22px; font-weight: 800; text-align: center; margin-bottom: 32px; }
        .tabs { display: grid; grid-template-columns: 1fr 1fr; background: #F4F4F6; border-radius: 12px; padding: 4px; margin-bottom: 32px; }
        .tab-btn { padding: 10px; border: none; border-radius: 10px; background: none; font-family: 'Syne',sans-serif; font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.2s; color: #6B7280; }
        .tab-btn.active { background: white; color: #0D0D0D; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .form-group { margin-bottom: 18px; }
        .form-label { display: block; font-size: 14px; font-weight: 600; margin-bottom: 8px; }
        .form-input { width: 100%; padding: 12px 16px; border: 1.5px solid #E5E7EB; border-radius: 12px; font-size: 15px; font-family: 'DM Sans',sans-serif; outline: none; transition: border 0.2s; background: #FAFAFA; color: #0D0D0D; }
        .form-input:focus { border-color: #00C896; background: white; }
        .submit-btn { width: 100%; padding: 16px; border: none; border-radius: 100px; background: #0D0D0D; color: #00C896; font-family: 'Syne',sans-serif; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.25s; margin-top: 8px; }
        .submit-btn:hover { background: #1A1A2E; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.2); }
        .divider { text-align: center; color: #9CA3AF; font-size: 13px; margin: 20px 0; }
        .google-btn { width: 100%; padding: 14px; border: 1.5px solid #E5E7EB; border-radius: 100px; background: white; font-family: 'DM Sans',sans-serif; font-size: 15px; font-weight: 500; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 10px; }
        .google-btn:hover { border-color: #9CA3AF; }
        .terms { font-size: 12px; color: #9CA3AF; text-align: center; margin-top: 20px; }
        .terms a { color: #00C896; }
      `}</style>
      <div className="registro-wrap">
        <div className="registro-card">
          <div className="registro-logo">💰 Moneduca</div>
          <div className="tabs">
            <button className={`tab-btn ${tab === 'registro' ? 'active' : ''}`} onClick={() => setTab('registro')}>Crear cuenta</button>
            <button className={`tab-btn ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>Iniciar sesión</button>
          </div>
          <form onSubmit={e => { e.preventDefault(); alert('¡Autenticación próximamente! 🚀') }}>
            {tab === 'registro' && (
              <>
                <div className="form-group">
                  <label className="form-label">Tu nombre</label>
                  <input className="form-input" required placeholder="Ej. María" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">¿Cuántos años tienes?</label>
                  <input className="form-input" type="number" min="10" max="18" placeholder="Ej. 14" value={form.edad} onChange={e => setForm({...form, edad: e.target.value})} />
                </div>
              </>
            )}
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" required placeholder="tu@email.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input className="form-input" type="password" required placeholder="Mínimo 8 caracteres" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
            </div>
            <button type="submit" className="submit-btn">{tab === 'registro' ? 'Crear mi cuenta gratis ✦' : 'Iniciar sesión →'}</button>
          </form>
          <div className="divider">o continúa con</div>
          <button className="google-btn">
            <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/><path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
            Continuar con Google
          </button>
          <p className="terms">Al crear una cuenta aceptas nuestros <Link href="#">Términos</Link> y <Link href="#">Privacidad</Link>.</p>
        </div>
      </div>
    </>
  )
}
