'use client'
import { useState } from 'react'

export function PreguntaOrdenar({ opciones, respuestaCorrecta, onConfirm }: {
  opciones: string[]
  respuestaCorrecta: string
  onConfirm: (correcto: boolean, seleccion: string) => void
}) {
  const [items, setItems] = useState([...opciones].sort(() => Math.random() - 0.5))
  const [confirmado, setConfirmado] = useState(false)
  const [dragIdx, setDragIdx] = useState<number | null>(null)

  const correctos = respuestaCorrecta.split('|')

  const handleDrop = (i: number) => {
    if (dragIdx === null || dragIdx === i) return
    const newItems = [...items]
    const [moved] = newItems.splice(dragIdx, 1)
    newItems.splice(i, 0, moved)
    setItems(newItems)
    setDragIdx(null)
  }

  const handleConfirm = () => {
    const esCorrecta = items.every((item, i) => item === correctos[i])
    setConfirmado(true)
    onConfirm(esCorrecta, items.join('|'))
  }

  return (
    <div>
      <style>{`
        .orden-item { padding: 13px 18px; border-radius: 12px; border: 2px solid #E8D9B8; background: #FFFDF5; font-family: 'Nunito',sans-serif; font-size: 15px; color: #3D2A0E; margin-bottom: 8px; cursor: grab; display: flex; align-items: center; gap: 10px; transition: all 0.15s; user-select: none; }
        .orden-item:hover:not(.confirmado-ok):not(.confirmado-mal) { border-color: #C8934A; }
        .orden-num { width: 24px; height: 24px; border-radius: 50%; background: rgba(252,230,139,0.5); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #6B4520; flex-shrink: 0; }
        .confirmado-ok { border-color: #3B6D11 !important; background: #EAF3DE !important; }
        .confirmado-mal { border-color: #993C1D !important; background: #FAECE7 !important; }
      `}</style>
      <p style={{ fontFamily: "'Nunito',sans-serif", fontSize: 13, color: '#A87840', marginBottom: 12 }}>
        🖱️ Arrastra los elementos para ordenarlos correctamente
      </p>
      {items.map((item, i) => (
        <div
          key={item}
          className={`orden-item ${confirmado ? (item === correctos[i] ? 'confirmado-ok' : 'confirmado-mal') : ''}`}
          draggable={!confirmado}
          onDragStart={() => setDragIdx(i)}
          onDragOver={e => e.preventDefault()}
          onDrop={() => handleDrop(i)}
        >
          <span className="orden-num">{i + 1}</span>
          {item}
        </div>
      ))}
      {!confirmado && (
        <button
          style={{ width: '100%', padding: '15px', borderRadius: '100px', border: 'none', background: '#6B4520', color: '#FCE68B', fontFamily: "'Fredoka',sans-serif", fontSize: '17px', fontWeight: 600, cursor: 'pointer', marginTop: 8 }}
          onClick={handleConfirm}
        >
          Confirmar orden
        </button>
      )}
    </div>
  )
}
