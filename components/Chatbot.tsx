'use client'
import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Message { role: 'user' | 'assistant'; content: string }

const SUGGESTIONS = ['¿Qué es un presupuesto?', '¿Cómo empiezo a ahorrar?', '¿Qué es la tasa de interés?']

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '¡Hola! Soy Monedoki 🦊 Tu guía de finanzas personales. Puedo explicarte cualquier duda sobre ahorro, presupuestos, crédito o inversión. ¿Qué quieres aprender hoy?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  const messagesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const n = session.user.user_metadata?.nombre || session.user.user_metadata?.full_name || session.user.user_metadata?.name || null
        setUserName(n)
        if (n) {
          setMessages([{ role: 'assistant', content: `¡Hola, ${n}! Soy Monedoki 🦊 Tu guía de finanzas. ¿En qué te puedo ayudar hoy?` }])
        }
      }
    })
  }, [])

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
        body: JSON.stringify({ messages: [...messages, userMsg], userName }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.content }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Lo siento, hubo un error. Intenta de nuevo.' }])
    } finally { setLoading(false) }
  }

  return (
    <>
      <style>{`
        .chatbot { background: #FFFDF5; border-radius: 24px; border: 1px solid #E8D9B8; overflow: hidden; box-shadow: 6px 6px 0px rgba(145,99,47,0.1); display: flex; flex-direction: column; height: 500px; }
        .chat-hdr { background: #3D2A0E; padding: 16px 20px; display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
        .chat-avatar { width: 44px; height: 44px; border-radius: 50%; overflow: hidden; flex-shrink: 0; background: rgba(250,191,77,0.2); display: flex; align-items: center; justify-content: center; }
        .chat-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .chat-hdr-name { font-family: 'Fredoka',sans-serif; font-weight: 600; color: #FCE68B; font-size: 16px; }
        .chat-hdr-status { font-size: 12px; color: rgba(252,230,139,0.6); display: flex; align-items: center; gap: 5px; font-family: 'Nunito',sans-serif; }
        .status-dot { width: 7px; height: 7px; background: rgba(250,191,77,1); border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.4);opacity:0.7} }
        .chat-msgs { flex: 1; overflow-y: auto; padding: 20px 16px; display: flex; flex-direction: column; gap: 12px; }
        .chat-msgs::-webkit-scrollbar { width: 4px; }
        .chat-msgs::-webkit-scrollbar-thumb { background: #E8D9B8; border-radius: 2px; }
        .msg { max-width: 85%; font-size: 14px; line-height: 1.6; font-family: 'Nunito',sans-serif; }
        .msg-user { align-self: flex-end; background: #6B4520; color: #FCE68B; padding: 10px 16px; border-radius: 18px 18px 4px 18px; }
        .msg-bot-wrap { align-self: flex-start; display: flex; align-items: flex-end; gap: 8px; max-width: 85%; }
        .msg-bot-avatar { width: 28px; height: 28px; border-radius: 50%; overflow: hidden; flex-shrink: 0; background: rgba(250,191,77,0.2); display: flex; align-items: center; justify-content: center; font-size: 14px; }
        .msg-bot-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .msg-bot { background: rgba(252,230,139,0.25); color: #3D2A0E; padding: 10px 16px; border-radius: 18px 18px 18px 4px; border: 1px solid rgba(232,217,184,0.5); }
        .typing { align-self: flex-start; display: flex; align-items: flex-end; gap: 8px; }
        .typing-bubble { background: rgba(252,230,139,0.25); padding: 12px 16px; border-radius: 18px 18px 18px 4px; display: flex; gap: 5px; border: 1px solid rgba(232,217,184,0.5); }
        .typing-dot { width: 7px; height: 7px; background: #C8934A; border-radius: 50%; animation: bounce 1.2s infinite; }
        .typing-dot:nth-child(2){animation-delay:0.2s} .typing-dot:nth-child(3){animation-delay:0.4s}
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }
        .chat-sugg { padding: 8px 14px; display: flex; gap: 8px; flex-wrap: wrap; border-top: 1px solid #E8D9B8; flex-shrink: 0; background: rgba(252,230,139,0.05); }
        .sugg-btn { font-size: 12px; padding: 6px 12px; background: rgba(252,230,139,0.3); border: 1px solid rgba(232,217,184,0.8); border-radius: 100px; cursor: pointer; color: #6B4520; transition: all 0.2s; white-space: nowrap; font-family: 'Nunito',sans-serif; font-weight: 600; }
        .sugg-btn:hover { background: rgba(250,191,77,0.4); }
        .chat-input-row { padding: 12px 14px; border-top: 1px solid #E8D9B8; display: flex; gap: 8px; align-items: center; flex-shrink: 0; }
        .chat-input { flex: 1; border: 1.5px solid #E8D9B8; border-radius: 100px; padding: 10px 16px; font-size: 14px; font-family: 'Nunito',sans-serif; outline: none; transition: border 0.2s; background: #FFF8E8; color: #3D2A0E; }
        .chat-input:focus { border-color: rgba(250,191,77,1); background: white; }
        .chat-send { width: 38px; height: 38px; background: #6B4520; border: none; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; flex-shrink: 0; font-size: 15px; }
        .chat-send:hover { background: #3D2A0E; transform: scale(1.05); }
        .chat-send:disabled { opacity: 0.4; cursor: default; transform: none; }
      `}</style>
      <div className="chatbot">
        <div className="chat-hdr">
          <div className="chat-avatar">
            <img src="/monedoki-feliz.png" alt="Monedoki" onError={e => { (e.target as HTMLImageElement).style.display='none'; (e.target as HTMLImageElement).parentElement!.innerHTML='🦊' }} />
          </div>
          <div>
            <div className="chat-hdr-name">Monedoki</div>
            <div className="chat-hdr-status"><span className="status-dot" /> En línea</div>
          </div>
        </div>
        <div className="chat-msgs" ref={messagesRef}>
          {messages.map((m, i) => (
            m.role === 'user' ? (
              <div key={i} className="msg msg-user">{m.content}</div>
            ) : (
              <div key={i} className="msg-bot-wrap">
                <div className="msg-bot-avatar">
                  <img src="/monedoki-neutral.png" alt="" onError={e => { (e.target as HTMLImageElement).style.display='none'; (e.target as HTMLImageElement).parentElement!.innerHTML='🦊' }} />
                </div>
                <div className="msg msg-bot">{m.content}</div>
              </div>
            )
          ))}
          {loading && (
            <div className="typing">
              <div className="msg-bot-avatar">
                <img src="/monedoki-pensar.png" alt="" onError={e => { (e.target as HTMLImageElement).style.display='none'; (e.target as HTMLImageElement).parentElement!.innerHTML='🦊' }} />
              </div>
              <div className="typing-bubble">
                <span className="typing-dot"/><span className="typing-dot"/><span className="typing-dot"/>
              </div>
            </div>
          )}
        </div>
        {messages.length <= 1 && (
          <div className="chat-sugg">
            {SUGGESTIONS.map(s => <button key={s} className="sugg-btn" onClick={() => send(s)}>{s}</button>)}
          </div>
        )}
        <div className="chat-input-row">
          <input className="chat-input" value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send(input)}
            placeholder="Pregúntale algo a Monedoki..." disabled={loading} />
          <button className="chat-send" onClick={() => send(input)} disabled={loading || !input.trim()}>➤</button>
        </div>
      </div>
    </>
  )
}
