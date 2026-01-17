import React, { useState } from 'react'
import './GuessInput.css'

function GuessInput({ song, onSubmit, enabled, guessUsed = false }) {
  const [guess, setGuess] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [result, setResult] = useState(null) // 'correct', 'incorrect', null

  const normalizeString = (str) => {
    return str.toLowerCase().replace(/[^a-z0-9]/g, '')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!guess.trim() || !enabled || isChecking) return

    setIsChecking(true)
    
    // Check if guess matches song title only
    const normalizedGuess = normalizeString(guess)
    const normalizedTitle = normalizeString(song.title)
    
    const isCorrect = 
      normalizedGuess === normalizedTitle ||
      normalizedTitle.includes(normalizedGuess) ||
      normalizedGuess.includes(normalizedTitle)

    setTimeout(() => {
      setResult(isCorrect ? 'correct' : 'incorrect')
      setIsChecking(false)
      
      // Always call onSubmit to mark guess as used (regardless of correct/incorrect)
      if (onSubmit) {
        // For correct guesses, call with true after showing result
        // For incorrect guesses, call immediately to mark as used
        if (isCorrect) {
          setTimeout(() => {
            onSubmit(true)
          }, 1000)
        } else {
          // Mark guess as used immediately for incorrect guesses
          onSubmit(false)
        }
      }
    }, 500)
  }

  const handleChange = (e) => {
    setGuess(e.target.value)
    setResult(null)
  }

  return (
    <div className="guess-input-container">
      <form onSubmit={handleSubmit} className="guess-form">
        <input
          type="text"
          value={guess}
          onChange={handleChange}
          placeholder="Enter song title..."
          className={`guess-input ${result ? `guess-${result}` : ''}`}
          disabled={!enabled || isChecking}
          autoComplete="off"
        />
        <button
          type="submit"
          className="guess-submit"
          disabled={!enabled || isChecking || !guess.trim()}
        >
          {isChecking ? 'Checking...' : 'Guess'}
        </button>
      </form>

      {result === 'correct' && (
        <div className="guess-result correct">
          <i className="fas fa-check-circle"></i>
          <span>Correct! 🎉</span>
        </div>
      )}

      {result === 'incorrect' && (
        <div className="guess-result incorrect">
          <i className="fas fa-times-circle"></i>
          <span>Incorrect! Play another snippet to guess again!</span>
        </div>
      )}

      {!enabled && !guessUsed && (
        <p className="guess-hint">Play a snippet to unlock a guess!</p>
      )}
      {!enabled && guessUsed && (
        <p className="guess-hint">You've used your guess for this snippet. Play another snippet to guess again!</p>
      )}
    </div>
  )
}

export default GuessInput






