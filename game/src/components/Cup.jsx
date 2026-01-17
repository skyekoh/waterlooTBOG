import React from 'react'
import './Cup.css'

function Cup({ sunk, onClick, player, cupIndex, interactive = false }) {
  return (
    <div 
      className={`cup ${sunk ? 'cup-sunk' : ''} ${interactive ? 'cup-interactive' : ''}`}
      onClick={onClick}
      title={interactive ? `Click to shoot cup ${cupIndex + 1}` : `Player ${player} - Cup ${cupIndex + 1}`}
    >
      <div className="cup-rim"></div>
      <div className="cup-body">
        {sunk && <div className="cup-water"></div>}
      </div>
      <div className="cup-base"></div>
    </div>
  )
}

export default Cup

