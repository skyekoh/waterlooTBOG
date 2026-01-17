import React, { useState, useEffect } from 'react'
import { ref, onValue, query, limitToLast, orderByChild } from 'firebase/database'
import './Leaderboard.css'

function Leaderboard({ database }) {
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)

  // Sort scores by guesses (ascending - fewer guesses = better rank)
  const sortedScores = [...scores].sort((a, b) => {
    // Primary sort: guesses (lower is better)
    if (a.guesses !== b.guesses) {
      return a.guesses - b.guesses
    }
    // Secondary sort: timestamp (older = earlier win, better)
    return a.timestamp - b.timestamp
  })

  useEffect(() => {
    const leaderboardRef = ref(database, 'leaderboard')
    const topScoresQuery = query(
      leaderboardRef,
      orderByChild('guesses'),
      limitToLast(50)
    )

    onValue(topScoresQuery, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const scoresArray = Object.entries(data)
          .map(([id, score]) => ({
            id,
            ...score
          }))
          .sort((a, b) => {
            if (a.guesses !== b.guesses) return a.guesses - b.guesses
            return a.timestamp - b.timestamp
          })
          .slice(0, 50)
        
        setScores(scoresArray)
      }
      setLoading(false)
    })
  }, [database])

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    const date = new Date(timestamp)
    return date.toLocaleDateString()
  }

  return (
    <div className="leaderboard">
      <h2 className="leaderboard-title">Leaderboard</h2>
      <p className="leaderboard-subtitle">Top Scores</p>
      
      {loading ? (
        <div className="leaderboard-loading">Loading...</div>
      ) : sortedScores.length === 0 ? (
        <div className="leaderboard-empty">No scores yet. Be the first!</div>
      ) : (
        <div className="leaderboard-list">
          {sortedScores.map((score, index) => (
            <div key={score.id || index} className="leaderboard-item">
              <div className="leaderboard-rank">
                <span className="rank-number">#{index + 1}</span>
              </div>
              <div className="leaderboard-info">
                <div className="leaderboard-player">
                  <span className="player-name">{score.playerName || 'Player'}</span>
                  <span className="player-school">{score.playerSchool || ''}</span>
                </div>
                <div className="leaderboard-score">
                  <span className="score-guesses">{score.guesses}</span>
                  <span className="score-label">{score.guesses === 1 ? 'guess' : 'guesses'}</span>
                </div>
                <div className="leaderboard-meta">
                  <span className="meta-date">{formatDate(score.timestamp)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Leaderboard

