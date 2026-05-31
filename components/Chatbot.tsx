'use client'
import { useState, useRef } from 'react'

interface Message { role: 'user' | 'assistant'; content: string }

const SUGGESTIONS = ['¿Qué es un presupuesto?', '¿Cómo empiezo a ahorrar?', '¿Qué es la tasa de interés?']

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '¡Hola! 👋 Soy tu asistente de finanzas. Puedo explicarte cualquier duda sobre ahorro, presupuestos, crédito o inversión. ¿Qué quieres aprender hoy?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesRef = useRef<HTMLDivElement>(null)

  const send = async (text: string) => {
    if (!text.trim() || loading) return
    const userMsg: Message = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.content }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Lo siento, hubo un error. Intenta de nuevo.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        .chatbot { background: white; border-radius: 24px; border: 1.5px solid #E5E7EB; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.08); display: flex; flex-direction: column; height: 500px; }
        .chat-hdr { background: #0D0D0D; padding: 16px 20px; display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
        .chat-avatar { width: 36px; height: 36px; background: #00C896; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; }
        .chat-hdr-name { font-family: 'Fredoka',sans-serif; font-weight: 700; color: white; font-size: 15px; }
        .chat-hdr-status { font-size: 12px; color: #00C896; display: flex; align-items: center; gap: 5px; }
        .status-dot { width: 7px; height: 7px; background: #00C896; border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.4);opacity:0.7} }
        .chat-msgs { flex: 1; overflow-y: auto; padding: 20px 16px; display: flex; flex-direction: column; gap: 12px; }
        .chat-msgs::-webkit-scrollbar { width: 4px; }
        .chat-msgs::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 2px; }
        .msg { max-width: 85%; font-size: 14px; line-height: 1.6; }
        .msg-user { align-self: flex-end; background: #0D0D0D; color: white; padding: 10px 16px; border-radius: 18px 18px 4px 18px; }
        .msg-bot { align-self: flex-start; background: #F4F4F6; color: #0D0D0D; padding: 10px 16px; border-radius: 18px 18px 18px 4px; }
        .typing { align-self: flex-start; background: #F4F4F6; padding: 12px 16px; border-radius: 18px 18px 18px 4px; display: flex; gap: 5px; }
        .typing-dot { width: 7px; height: 7px; background: #9CA3AF; border-radius: 50%; animation: bounce 1.2s infinite; }
        .typing-dot:nth-child(2){animation-delay:0.2s} .typing-dot:nth-child(3){animation-delay:0.4s}
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }
        .chat-sugg { padding: 8px 16px; display: flex; gap: 8px; flex-wrap: wrap; border-top: 1px solid #F4F4F6; flex-shrink: 0; }
        .sugg-btn { font-size: 12px; padding: 6px 12px; background: #F4F4F6; border: none; border-radius: 100px; cursor: pointer; color: #0D0D0D; transition: all 0.2s; white-space: nowrap; font-family: 'Nunito',sans-serif; }
        .sugg-btn:hover { background: #D4F5EB; color: #009970; }
        .chat-input-row { padding: 12px 16px; border-top: 1.5px solid #E5E7EB; display: flex; gap: 10px; align-items: center; flex-shrink: 0; }
        .chat-input { flex: 1; border: 1.5px solid #E5E7EB; border-radius: 100px; padding: 10px 18px; font-size: 14px; font-family: 'Nunito',sans-serif; outline: none; transition: border 0.2s; background: #FAFAFA; color: #0D0D0D; }
        .chat-input:focus { border-color: #00C896; background: white; }
        .chat-send { width: 40px; height: 40px; background: #0D0D0D; border: none; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; flex-shrink: 0; font-size: 16px; }
        .chat-send:hover { background: #00C896; transform: scale(1.05); }
        .chat-send:disabled { opacity: 0.4; cursor: default; transform: none; }
      `}</style>
      <div className="chatbot">
        <div className="chat-hdr">
          <div className="chat-avatar">🤖</div>
          <div>
            <div className="chat-hdr-name">Asistente Moneduca</div>
            <div className="chat-hdr-status"><span className="status-dot" /> En línea</div>
          </div>
        </div>
        <div className="chat-msgs" ref={messagesRef}>
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role === 'user' ? 'msg-user' : 'msg-bot'}`}>{m.content}</div>
          ))}
          {loading && <div className="typing"><span className="typing-dot"/><span className="typing-dot"/><span className="typing-dot"/></div>}
        </div>
        {messages.length <= 1 && (
          <div className="chat-sugg">
            {SUGGESTIONS.map(s => <button key={s} className="sugg-btn" onClick={() => send(s)}>{s}</button>)}
          </div>
        )}
        <div className="chat-input-row">
          <input className="chat-input" value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send(input)} placeholder="Escribe tu pregunta..." disabled={loading} />
          <button className="chat-send" onClick={() => send(input)} disabled={loading || !input.trim()}>➤</button>
        </div>
      </div>
    </>
  )
}
