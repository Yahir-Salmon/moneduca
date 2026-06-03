'use client'
import { useState } from 'react'

export function PreguntaDragDrop({ opciones, respuestaCorrecta, onConfirm }: {
  opciones: { items: string[]; definitions: string[] }
  respuestaCorrecta: string
  onConfirm: (correcto: boolean, seleccion: string) => void
}) {
  const correctMap: Record<string, string> = {}
  respuestaCorrecta.split('|').forEach(pair => {
    const [item, def] = pair.split(':')
    correctMap[item] = def
  })

  const [assignments, setAssignments] = useState<Record<string, string>>({})
  const [dragging, setDragging] = useState<string | null>(null)
  const [confirmado, setConfirmado] = useState(false)

  const handleDrop = (def: string) => {
    if (!dragging || confirmado) return
    setAssignments(prev => {
      const newA = { ...prev }
      Object.keys(newA).forEach(k => { if (newA[k] === def) delete newA[k] })
      newA[dragging] = def
      return newA
    })
    setDragging(null)
  }

  const allAssigned = opciones.items.every(item => assignments[item])

  const handleConfirm = () => {
    const esCorrecta = opciones.items.every(item => assignments[item] === correctMap[item])
    setConfirmado(true)
    onConfirm(esCorrecta, JSON.stringify(assignments))
  }

  return (
    <div>
      <style>{`
        .dd-wrap { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 16px; }
        .dd-label { font-family: 'Nunito',sans-serif; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #6B4520; margin-bottom: 6px; }
        .dd-item { padding: 10px 16px; border-radius: 10px; border: 2px solid #E8D9B8; background: #FFFDF5; font-family: 'Nunito',sans-serif; font-size: 14px; color: #3D2A0E; cursor: grab; transition: all 0.15s; font-weight: 600; margin-bottom: 8px; }
        .dd-item:hover { border-color: #C8934A; transform: translateY(-1px); }
        .dd-item.asignado { opacity: 0.4; cursor: default; transform: none; }
        .dd-def { min-height: 52px; padding: 10px 14px; border-radius: 10px; border: 2px dashed #E8D9B8; background: rgba(232,217,184,0.1); font-family: 'Nunito',sans-serif; font-size: 13px; color: #A87840; transition: all 0.15s; margin-bottom: 8px; }
        .dd-def.filled { border-style: solid; border-color: #6B4520; background: rgba(252,230,139,0.2); }
        .dd-def.correcto { border-color: #3B6D11; background: #EAF3DE; }
        .dd-def.incorrecto { border-color: #993C1D; background: #FAECE7; }
        .dd-chip { display: inline-block; background: #6B4520; color: #FCE68B; padding: 3px 10px; border-radius: 100px; font-size: 13px; font-weight: 600; margin-bottom: 4px; }
        @media (max-width: 480px) { .dd-wrap { grid-template-columns: 1fr; } }
      `}</style>
      <p style={{ fontFamily: "'Nunito',sans-serif", fontSize: 13, color: '#A87840', marginBottom: 12 }}>
        🖱️ Arrastra cada concepto a su definición correcta
      </p>
      <div className="dd-wrap">
        <div>
          <p className="dd-label">Conceptos</p>
          {opciones.items.map(item => (
            <div
              key={item}
              className={`dd-item ${assignments[item] ? 'asignado' : ''}`}
              draggable={!assignments[item] && !confirmado}
              onDragStart={() => setDragging(item)}
            >
              {item}
            </div>
          ))}
        </div>
        <div>
          <p className="dd-label">Definiciones</p>
          {opciones.definitions.map(def => {
            const assignedItem = Object.keys(assignments).find(k => assignments[k] === def)
            const isCorrect = confirmado && assignedItem && correctMap[assignedItem] === def
            const isWrong = confirmado && assignedItem && correctMap[assignedItem] !== def
            return (
              <div
                key={def}
                className={`dd-def ${assignedItem ? 'filled' : ''} ${isCorrect ? 'correcto' : ''} ${isWrong ? 'incorrecto' : ''}`}
                onDragOver={e => e.preventDefault()}
                onDrop={() => handleDrop(def)}
              >
                {assignedItem && <div className="dd-chip">{assignedItem}</div>}
                <div>{def}</div>
              </div>
            )
          })}
        </div>
      </div>
      {!confirmado && (
        <button
          style={{ width: '100%', padding: '15px', borderRadius: '100px', border: 'none', background: allAssigned ? '#6B4520' : '#E8D9B8', color: allAssigned ? '#FCE68B' : '#A87840', fontFamily: "'Fredoka',sans-serif", fontSize: '17px', fontWeight: 600, cursor: allAssigned ? 'pointer' : 'default', marginTop: 8 }}
          onClick={handleConfirm}
          disabled={!allAssigned}
        >
          Confirmar
        </button>
      )}
    </div>
  )
}
