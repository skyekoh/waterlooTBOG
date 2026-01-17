import React, { useState, useRef } from 'react'
import './Ball.css'

function Ball({ position, onShoot }) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [currentPos, setCurrentPos] = useState(position)
  const ballRef = useRef(null)

  const handleMouseDown = (e) => {
    setIsDragging(true)
    const rect = ballRef.current.getBoundingClientRect()
    setDragStart({
      x: e.clientX - rect.left - rect.width / 2,
      y: e.clientY - rect.top - rect.height / 2
    })
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    
    const rect = ballRef.current.parentElement.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    // Constrain to reasonable bounds
    const constrainedX = Math.max(10, Math.min(90, x))
    const constrainedY = Math.max(10, Math.min(90, y))
    
    setCurrentPos({ x: constrainedX, y: constrainedY })
  }

  const handleMouseUp = (e) => {
    if (!isDragging) return
    
    setIsDragging(false)
    
    // Calculate velocity based on drag distance
    const rect = ballRef.current.parentElement.getBoundingClientRect()
    const deltaX = e.clientX - (rect.left + (dragStart.x + rect.width * currentPos.x / 100))
    const deltaY = e.clientY - (rect.top + (dragStart.y + rect.height * currentPos.y / 100))
    
    // Trigger shoot with target position
    if (onShoot) {
      onShoot({ x: currentPos.x, y: currentPos.y })
    }
    
    // Reset position after a delay
    setTimeout(() => {
      setCurrentPos(position)
    }, 500)
  }

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging])

  return (
    <div
      ref={ballRef}
      className={`ball ${isDragging ? 'ball-dragging' : ''}`}
      style={{
        left: `${currentPos.x}%`,
        top: `${currentPos.y}%`,
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="ball-shine"></div>
    </div>
  )
}

export default Ball









