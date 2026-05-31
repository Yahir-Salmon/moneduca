'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function RegistroPage() {
  const [tab, setTab] = useState<'registro' | 'login'>('registro')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({ nombre: '', email: '', password: '', edad: '' })
  const router = useRouter()

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { nombre: form.nombre, edad: parseInt(form.edad) }
      }
    })

    if (signUpError) {
      setError(signUpError.message === 'User already registered'
        ? 'Ya existe una cuenta con ese email.'
        : 'Hubo un error al crear tu cuenta. Intenta de nuevo.')
      setLoading(false)
      return
    }

    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        nombre: form.nombre,
        edad: parseInt(form.edad),
      })
      setSuccess('¡Cuenta creada! Revisa tu email para confirmar tu cuenta.')
    }
    setLoading(false)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (loginError) {
      setError('Email o contraseña incorrectos.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` }
    })
  }

  return (
    <>
      <style>{`
        .registro-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 100px 24px 60px; background: #FFF8E8; }
        .registro-card { background: #FFFDF5; border-radius: 28px; border: 1px solid #E8D9B8; padding: 48px; width: 100%; max-width: 480px; box-shadow: 6px 6px 0px rgba(145,99,47,0.1); }
        .registro-logo { font-family: 'Fredoka',sans-serif; font-size: 24px; font-weight: 600; text-align: center; margin-bottom: 8px; color: #3D2A0E; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .registro-sub { text-align: center; color: #8C6D45; font-size: 14px; margin-bottom: 32px; font-family: 'Nunito',sans-serif; }
        .tabs { display: grid; grid-template-columns: 1fr 1fr; background: rgba(232,217,184,0.3); border-radius: 14px; padding: 4px; margin-bottom: 28px; }
        .tab-btn { padding: 10px; border: none; border-radius: 12px; background: none; font-family: 'Fredoka',sans-serif; font-weight: 600; font-size: 15px; cursor: pointer; transition: all 0.2s; color: #8C6D45; }
        .tab-btn.active { background: #FFFDF5; color: #3D2A0E; box-shadow: 0 2px 8px rgba(145,99,47,0.1); }
        .form-group { margin-bottom: 18px; }
        .form-label { display: block; font-size: 14px; font-weight: 700; margin-bottom: 8px; color: #6B4520; font-family: 'Nunito',sans-serif; }
        .form-input { width: 100%; padding: 12px 16px; border: 1.5px solid #E8D9B8; border-radius: 14px; font-size: 15px; font-family: 'Nunito',sans-serif; outline: none; transition: border 0.2s; background: #FFF8E8; color: #3D2A0E; }
        .form-input:focus { border-color: rgba(250,191,77,1); background: white; }
        .submit-btn { width: 100%; padding: 16px; border: none; border-radius: 100px; background: #6B4520; color: rgba(252,230,139,1); font-family: 'Fredoka',sans-serif; font-size: 17px; font-weight: 600; cursor: pointer; transition: all 0.25s; margin-top: 8px; }
        .submit-btn:hover:not(:disabled) { background: #3D2A0E; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(61,42,14,0.2); }
        .submit-btn:disabled { opacity: 0.6; cursor: default; }
        .divider { text-align: center; color: #A87840; font-size: 13px; margin: 20px 0; font-family: 'Nunito',sans-serif; }
        .google-btn { width: 100%; padding: 14px; border: 1.5px solid #E8D9B8; border-radius: 100px; background: white; font-family: 'Nunito',sans-serif; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 10px; color: #3D2A0E; }
        .google-btn:hover { border-color: #C8934A; background: #FFF8E8; }
        .form-error { background: #FFE8E8; color: #CC3333; border-radius: 12px; padding: 12px 16px; font-size: 14px; margin-bottom: 16px; font-family: 'Nunito',sans-serif; }
        .form-success { background: rgba(252,230,139,0.4); color: #6B4520; border-radius: 12px; padding: 12px 16px; font-size: 14px; margin-bottom: 16px; font-family: 'Nunito',sans-serif; text-align: center; }
        .terms { font-size: 12px; color: #A87840; text-align: center; margin-top: 20px; font-family: 'Nunito',sans-serif; }
        .terms a { color: #C8934A; text-decoration: underline; }
      `}</style>

      <div className="registro-wrap">
        <div className="registro-card">
          <div className="registro-logo">🦊 Moneduca</div>
          <p className="registro-sub">Tu camino hacia la libertad financiera empieza aquí</p>

          <div className="tabs">
            <button className={`tab-btn ${tab === 'registro' ? 'active' : ''}`} onClick={() => { setTab('registro'); setError(''); setSuccess('') }}>
              Crear cuenta
            </button>
            <button className={`tab-btn ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError(''); setSuccess('') }}>
              Iniciar sesión
            </button>
          </div>

          {error && <div className="form-error">⚠️ {error}</div>}
          {success && <div className="form-success">✅ {success}</div>}

          <form onSubmit={tab === 'registro' ? handleRegistro : handleLogin}>
            {tab === 'registro' && (
              <>
                <div className="form-group">
                  <label className="form-label">¿Cómo te llamas?</label>
                  <input className="form-input" required placeholder="Ej. Sofía" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">¿Cuántos años tienes?</label>
                  <input className="form-input" type="number" min="10" max="18" placeholder="Ej. 14" value={form.edad} onChange={e => setForm({...form, edad: e.target.value})} />
                </div>
              </>
            )}
            <div className="form-group">
              <label className="form-label">Tu email</label>
              <input className="form-input" type="email" required placeholder="tu@email.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input className="form-input" type="password" required placeholder="Mínimo 6 caracteres" minLength={6} value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Cargando...' : tab === 'registro' ? 'Crear mi cuenta ✦' : 'Iniciar sesión →'}
            </button>
          </form>

          <div className="divider">o continúa con</div>
          <button className="google-btn" onClick={handleGoogle}>
            <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/><path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
            Continuar con Google
          </button>
          <p className="terms">Al crear una cuenta aceptas nuestros <Link href="#">Términos</Link> y <Link href="#">Privacidad</Link>.</p>
        </div>
      </div>
    </>
  )
}
