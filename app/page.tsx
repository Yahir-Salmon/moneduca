'use client'
import { useState } from 'react'
import Chatbot from '@/components/Chatbot'

export default function ContactoPage() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ nombre: '', email: '', mensaje: '' })

  return (
    <>
      <style>{`
        .contacto-wrap { padding: 140px 0 96px; min-height: 100vh; }
        .contacto-inner { max-width: 1100px; margin: 0 auto; padding: 0 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: start; }
        .contacto-h1 { font-size: clamp(32px,4vw,52px); font-weight: 800; margin-bottom: 20px; }
        .contacto-desc { font-size: 16px; color: #6B7280; margin-bottom: 40px; }
        .contact-item { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 24px; }
        .contact-icon { width: 44px; height: 44px; background: #D4F5EB; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
        .contact-label { font-weight: 600; font-size: 14px; margin-bottom: 4px; }
        .contact-val { font-size: 14px; color: #6B7280; }
        .form-card { background: white; border-radius: 24px; border: 1.5px solid #E5E7EB; padding: 40px; box-shadow: 0 8px 32px rgba(0,0,0,0.06); }
        .form-group { margin-bottom: 20px; }
        .form-label { display: block; font-size: 14px; font-weight: 600; margin-bottom: 8px; }
        .form-input, .form-textarea { width: 100%; padding: 12px 16px; border: 1.5px solid #E5E7EB; border-radius: 12px; font-size: 15px; font-family: 'DM Sans',sans-serif; outline: none; transition: border 0.2s; background: #FAFAFA; color: #0D0D0D; }
        .form-input:focus, .form-textarea:focus { border-color: #00C896; background: white; }
        .form-textarea { resize: vertical; min-height: 120px; }
        .success-msg { text-align: center; padding: 40px; }
        .success-emoji { font-size: 56px; margin-bottom: 16px; }
        .success-h { font-size: 24px; font-weight: 800; margin-bottom: 10px; }
        .success-sub { color: #6B7280; }
        @media (max-width: 768px) { .contacto-inner { grid-template-columns: 1fr; gap: 48px; } }
      `}</style>
      <div className="contacto-wrap">
        <div className="contacto-inner">
          <div>
            <span className="tag-deco">Escríbenos</span>
            <h1 className="contacto-h1">¿Tienes dudas?<br />¡Hablemos!</h1>
            <p className="contacto-desc">Estamos aquí para ayudarte. Ya sea que tengas una duda sobre un curso, quieras sugerir un tema o simplemente saludes — escríbenos.</p>
            {[['📧', 'Email', 'moneduca.finanzas@gmail.com'], ['⏰', 'Tiempo de respuesta', 'Respondemos en menos de 24 horas'], ['🤖', '¿Dudas financieras?', 'Usa nuestro chatbot en la página principal — disponible 24/7']].map(([icon, label, val]) => (
              <div key={label} className="contact-item">
                <div className="contact-icon">{icon}</div>
                <div><div className="contact-label">{label}</div><div className="contact-val">{val}</div></div>
              </div>
            ))}
          </div>
          <div className="form-card">
            {sent ? (
              <div className="success-msg">
                <div className="success-emoji">🎉</div>
                <h3 className="success-h">¡Mensaje enviado!</h3>
                <p className="success-sub">Te responderemos pronto. Mientras tanto, ¡explora nuestros cursos!</p>
              </div>
            ) : (
              <form onSubmit={e => { e.preventDefault(); setSent(true) }}>
                <div className="form-group">
                  <label className="form-label">Tu nombre</label>
                  <input className="form-input" required placeholder="Ej. María García" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tu email</label>
                  <input className="form-input" type="email" required placeholder="tu@email.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Mensaje</label>
                  <textarea className="form-textarea" required placeholder="Cuéntanos en qué podemos ayudarte..." value={form.mensaje} onChange={e => setForm({...form, mensaje: e.target.value})} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 16, padding: 16 }}>
                  Enviar mensaje
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
