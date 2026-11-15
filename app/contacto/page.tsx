'use client'
import { useState } from 'react'
import { useLanguage } from '@/lib/language'

export default function ContactoPage() {
  const { t, language } = useLanguage()
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ nombre: '', email: '', mensaje: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: form.nombre.trim(), email: form.email.trim(), mensaje: form.mensaje.trim() }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(typeof data.error === 'string' ? data.error : 'Hubo un error al enviar el mensaje.')
      }
      setSent(true)
    } catch (err) {
      setError(language === 'en' ? 'Could not send your message. Please try again.' : err instanceof Error ? err.message : 'Hubo un error al enviar. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        .contacto-wrap { padding: 140px 0 96px; min-height: 100vh; background: #FFF8E8; }
        .contacto-inner { max-width: 1100px; margin: 0 auto; padding: 0 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: start; }
        .contacto-h1 { font-size: clamp(32px,4vw,52px); font-weight: 800; margin-bottom: 20px; }
        .contacto-desc { font-size: 16px; color: #8C6D45; margin-bottom: 40px; line-height: 1.7; }
        .contact-item { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 24px; }
        .contact-icon { width: 44px; height: 44px; background: rgba(252,230,139,0.45); border: 1px solid #E8D9B8; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
        .contact-label { font-weight: 600; font-size: 14px; margin-bottom: 4px; }
        .contact-val { font-size: 14px; color: #8C6D45; }
        .form-card { background: #FFFDF5; border-radius: 18px; border: 1px solid #E8D9B8; padding: 40px; box-shadow: 4px 4px 0 rgba(145,99,47,0.06); }
        .form-group { margin-bottom: 20px; }
        .form-label { display: block; font-size: 14px; font-weight: 700; margin-bottom: 8px; color: #6B4520; }
        .form-input, .form-textarea { width: 100%; padding: 12px 16px; border: 1.5px solid #E8D9B8; border-radius: 12px; font-size: 15px; font-family: 'Nunito',sans-serif; outline: none; transition: border 0.2s; background: #FFF8E8; color: #3D2A0E; }
        .form-input:focus, .form-textarea:focus { border-color: #C8934A; background: white; }
        .form-textarea { resize: vertical; min-height: 120px; }
        .form-error { background: #FFE8E8; color: #CC3333; border-radius: 10px; padding: 12px 16px; font-size: 14px; margin-bottom: 16px; }
        .success-msg { text-align: center; padding: 40px; }
        .success-emoji { font-size: 56px; margin-bottom: 16px; }
        .success-h { font-size: 24px; font-weight: 800; margin-bottom: 10px; }
        .success-sub { color: #8C6D45; }
        @media (max-width: 768px) { .contacto-inner { grid-template-columns: 1fr; gap: 48px; } }
      `}</style>
      <div className="contacto-wrap">
        <div className="contacto-inner">
          <div>
            <span className="tag-deco">{t('Escríbenos')}</span>
            <h1 className="contacto-h1">{t('¿Tienes dudas?')}<br />{t('¡Hablemos!')}</h1>
            <p className="contacto-desc">{t('Estamos aquí para ayudarte. Ya sea que tengas una duda sobre un curso, quieras sugerir un tema o simplemente saludes — escríbenos.')}</p>
            {[
              ['📧', 'Email', 'moneduca.finanzas@gmail.com'],
              ['⏰', 'Tiempo de respuesta', 'Respondemos en menos de 24 horas'],
              ['🤖', '¿Dudas financieras?', 'Usa nuestro chatbot en la página principal — disponible 24/7'],
            ].map(([icon, label, val]) => (
              <div key={label} className="contact-item">
                <div className="contact-icon">{icon}</div>
                <div><div className="contact-label">{t(label)}</div><div className="contact-val">{t(val)}</div></div>
              </div>
            ))}
          </div>
          <div className="form-card">
            {sent ? (
              <div className="success-msg">
                <div className="success-emoji">🎉</div>
                <h3 className="success-h">{t('¡Mensaje enviado!')}</h3>
                <p className="success-sub">{t('Te responderemos pronto a tu correo. ¡Mientras tanto explora nuestros cursos!')}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && <div className="form-error">{error}</div>}
                <div className="form-group">
                  <label className="form-label">{t('Tu nombre')}</label>
                  <input className="form-input" required placeholder={language === "en" ? "e.g. Maria Garcia" : "Ej. María García"} value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} minLength={2} maxLength={100} />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('Tu email')}</label>
                  <input className="form-input" type="email" required placeholder={language === "en" ? "you@email.com" : "tu@email.com"} value={form.email} onChange={e => setForm({...form, email: e.target.value})} maxLength={254} />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('Mensaje')}</label>
                  <textarea className="form-textarea" required placeholder={language === "en" ? "Tell us how we can help..." : "Cuéntanos en qué podemos ayudarte..."} value={form.mensaje} onChange={e => setForm({...form, mensaje: e.target.value})} minLength={10} maxLength={2000} />
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 16, padding: 16, opacity: loading ? 0.7 : 1 }}>
                  {loading ? t('Enviando...') : t('Enviar mensaje') + ' ✦'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
