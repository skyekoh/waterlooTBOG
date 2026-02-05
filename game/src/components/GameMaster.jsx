import React, { useState, useEffect } from 'react'
import { ref, onValue, update, push } from 'firebase/database'
import { songs } from '../config/songs'
import Cup from './Cup'
import './GameMaster.css'

function GameMaster({ gameId, playerId, database, onStartGame, onEndGame }) {
  const [selectedSongIndex, setSelectedSongIndex] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [player1Joined, setPlayer1Joined] = useState(false)
  const [player2Joined, setPlayer2Joined] = useState(false)
  const [player1Info, setPlayer1Info] = useState(null) // Name and school
  const [player2Info, setPlayer2Info] = useState(null) // Name and school
  const [player1Cups, setPlayer1Cups] = useState([])
  const [player2Cups, setPlayer2Cups] = useState([])
  const [player1Guesses, setPlayer1Guesses] = useState(0)
  const [player2Guesses, setPlayer2Guesses] = useState(0)
  const [gameStatus, setGameStatus] = useState('waiting')
  const [winner, setWinner] = useState(null)
  const [player1Id, setPlayer1Id] = useState(null)
  const [player2Id, setPlayer2Id] = useState(null)
  
  // Use gameId as roomId (they're the same)
  const roomId = gameId

  useEffect(() => {
    if (!database || !gameId) return

    // Listen to game state from Firebase
    const gameRef = ref(database, `rooms/${gameId}`)
    onValue(gameRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        // Explicitly check for null/undefined, not just truthiness
        const player1Exists = data.player1 !== null && data.player1 !== undefined && data.player1 !== ''
        const player2Exists = data.player2 !== null && data.player2 !== undefined && data.player2 !== ''
        
        // Console logs for debugging
        if (player1Exists && !player1Joined) {
          console.log('✅ Player 1 has joined!', { playerId: data.player1, playerInfo: data.player1Info })
        }
        if (player2Exists && !player2Joined) {
          console.log('✅ Player 2 has joined!', { playerId: data.player2, playerInfo: data.player2Info })
        }
        if (!player1Exists && player1Joined) {
          console.log('❌ Player 1 has left')
        }
        if (!player2Exists && player2Joined) {
          console.log('❌ Player 2 has left')
        }
        
        setPlayer1Joined(player1Exists)
        setPlayer2Joined(player2Exists)
        setPlayer1Info(data.player1Info || null)
        setPlayer2Info(data.player2Info || null)
        setPlayer1Id(data.player1 || null)
        setPlayer2Id(data.player2 || null)
        
        // Track game statistics (cups and guesses)
        if (data.player1Cups) {
          setPlayer1Cups(data.player1Cups)
        } else {
          setPlayer1Cups(Array(6).fill(false))
        }
        if (data.player2Cups) {
          setPlayer2Cups(data.player2Cups)
        } else {
          setPlayer2Cups(Array(6).fill(false))
        }
        if (data.player1Guesses !== undefined) {
          setPlayer1Guesses(data.player1Guesses || 0)
        }
        if (data.player2Guesses !== undefined) {
          setPlayer2Guesses(data.player2Guesses || 0)
        }
        
        // Track game status and winner
        if (data.gameState) {
          setGameStatus(data.gameState)
          if (data.gameState === 'playing') {
            setGameStarted(true)
          }
        }
        if (data.winner !== undefined) {
          setWinner(data.winner)
        }
      }
    })
  }, [database, gameId])

  const handleStartGame = () => {
    if (songs.length === 0) {
      alert('No songs available! Please add songs to the game first.')
      return
    }
    if (selectedSongIndex === null || selectedSongIndex === undefined || selectedSongIndex < 0 || selectedSongIndex >= songs.length) {
      alert('Please select a song first!')
      return
    }
    setGameStarted(true)
    if (onStartGame) {
      onStartGame(selectedSongIndex)
    }
  }

  const handleEndGame = () => {
    setGameStarted(false)
    if (onEndGame) {
      onEndGame()
    }
  }

  const handleSinkCup = (player) => {
    if (gameStatus !== 'playing') return
    if (!database || !gameId) return

    const cups = player === 1 ? player1Cups : player2Cups
    const sunkCount = Array.isArray(cups) ? cups.filter(cup => cup).length : 0
    if (sunkCount >= 6) return

    const newCups = [...(Array.isArray(cups) ? cups : Array(6).fill(false))]
    const cupToSink = newCups.findIndex(cup => !cup)
    if (cupToSink === -1) return

    newCups[cupToSink] = true
    const newSunkCount = sunkCount + 1
    const now = Date.now()

    const playerKey = player === 1 ? 'player1' : 'player2'
    const firebaseUpdate = {
      [`${playerKey}Cups`]: newCups,
      [`${playerKey}Guesses`]: newSunkCount,
      [`${playerKey}SnippetPlayed`]: false,
      [`${playerKey}GuessUsed`]: false,
      lastSunkCup: {
        player,
        cupIndex: cupToSink,
        snippetNumber: newSunkCount,
        timestamp: now
      }
    }

    if (newSunkCount === 6) {
      firebaseUpdate.gameStatus = 'won'
      firebaseUpdate.gameState = 'won'
      firebaseUpdate.winner = player
      firebaseUpdate.finishedAt = now
    }

    const gameRef = ref(database, `rooms/${gameId}`)
    update(gameRef, firebaseUpdate).then(() => {
      if (newSunkCount === 6) {
        const winnerInfo = player === 1 ? player1Info : player2Info
        const winnerId = player === 1 ? player1Id : player2Id
        const leaderboardRef = ref(database, 'leaderboard')
        push(leaderboardRef, {
          playerId: winnerId || `player_${player}`,
          playerName: winnerInfo?.name || `Player ${player}`,
          playerSchool: winnerInfo?.school || '',
          gameId,
          songIndex: selectedSongIndex ?? 0,
          guesses: 6,
          timestamp: now
        })
      }
    })
  }

  const currentSong = songs[selectedSongIndex] || songs[0]

  return (
    <div className="game-master">
      <div className="gm-header">
        <h2 className="gm-title">🎮 GAME MASTER CONTROL PANEL</h2>
        <div className="gm-room-info">
          <p className="gm-room-label">Room ID:</p>
          <p className="gm-room-id">{roomId || 'Generating...'}</p>
          <p className="gm-room-instructions">Share this Room ID with players</p>
        </div>
      </div>

      <div className="gm-content">
        {/* Song Selection */}
        <div className="gm-section">
          <h3 className="gm-section-title">Select Song</h3>
          <div className="song-selector">
            {songs.length === 0 ? (
              <div className="no-songs-warning">
                <p>⚠️ No songs available!</p>
                <p className="song-help-text">Add songs to <code>src/config/songs.js</code> and MP3 files to <code>public/songs/</code></p>
              </div>
            ) : (
              <select 
                value={selectedSongIndex} 
                onChange={(e) => setSelectedSongIndex(parseInt(e.target.value))}
                className="song-select"
                disabled={gameStarted}
              >
                {songs.map((song, index) => (
                  <option key={song.id} value={index}>
                    {song.artist} - {song.title}
                  </option>
                ))}
              </select>
            )}
            {currentSong && (
              <div className="selected-song-info">
                <p><strong>Selected:</strong> {currentSong.artist} - {currentSong.title}</p>
                <p className="song-snippets-info">6 snippets configured</p>
              </div>
            )}
          </div>
        </div>

        {/* Game Controls */}
        <div className="gm-section">
          <h3 className="gm-section-title">Game Controls</h3>
          <div className="gm-controls">
            {!gameStarted ? (
              <button 
                onClick={handleStartGame} 
                className="gm-btn gm-btn-start"
                disabled={!roomId}
              >
                Start Game
              </button>
            ) : (
              <button 
                onClick={handleEndGame} 
                className="gm-btn gm-btn-end"
              >
                End Game
              </button>
            )}
          </div>
        </div>

        {/* Winner Announcement */}
        {gameStatus === 'won' && winner && (
          <div className="gm-section gm-winner-section">
            <h3 className="gm-section-title">🏆 Game Result</h3>
            <div className="winner-announcement">
              <h2 className={`winner-text player-${winner}-winner`}>
                Player {winner} Wins! 🎉
              </h2>
            </div>
          </div>
        )}

        {/* Player Status */}
        <div className="gm-section gm-player-status-section">
          <h3 className="gm-section-title">Player Status</h3>
          <div className="player-status-grid">
            <div className={`player-status-card player-1-card ${gameStatus === 'won' && winner === 1 ? 'winner' : ''}`}>
              <h4 className="player-1-title">Player 1</h4>
              <div className={`status-indicator ${player1Joined ? 'joined' : 'waiting'} player-1-indicator`}>
                {player1Joined ? '✅ Joined' : '⏳ Waiting'}
              </div>
              {player1Info && (
                <div className="player-info">
                  <p><strong>{player1Info.name}</strong></p>
                  <p className="player-school">{player1Info.school}</p>
                </div>
              )}
              {player1Joined && (
                <div className="player-stats">
                  <p>Cups Sunk: {player1Cups.filter(cup => cup).length}/6</p>
                  <p>Guesses: {player1Guesses}</p>
                </div>
              )}
              {gameStarted && gameStatus === 'playing' && player1Cups.filter(cup => cup).length < 6 && (
                <button
                  onClick={() => handleSinkCup(1)}
                  className="gm-btn gm-btn-sink gm-btn-sink-p1"
                >
                  Sink a Cup
                </button>
              )}
            </div>

            <div className={`player-status-card player-2-card ${gameStatus === 'won' && winner === 2 ? 'winner' : ''}`}>
              <h4 className="player-2-title">Player 2</h4>
              <div className={`status-indicator ${player2Joined ? 'joined' : 'waiting'} player-2-indicator`}>
                {player2Joined ? '✅ Joined' : '⏳ Waiting'}
              </div>
              {player2Info && (
                <div className="player-info">
                  <p><strong>{player2Info.name}</strong></p>
                  <p className="player-school">{player2Info.school}</p>
                </div>
              )}
              {player2Joined && (
                <div className="player-stats">
                  <p>Cups Sunk: {player2Cups.filter(cup => cup).length}/6</p>
                  <p>Guesses: {player2Guesses}</p>
                </div>
              )}
              {gameStarted && gameStatus === 'playing' && player2Cups.filter(cup => cup).length < 6 && (
                <button
                  onClick={() => handleSinkCup(2)}
                  className="gm-btn gm-btn-sink gm-btn-sink-p2"
                >
                  Sink a Cup
                </button>
              )}
            </div>
          </div>

          {/* Cup Display */}
          {(player1Joined || player2Joined) && (
            <div className="gm-cups-display">
              <div className="player-cups-container player-1-cups">
                <h4 className="cups-label">Player 1 Cups</h4>
                <div className="cups-grid">
                  {Array(6).fill(0).map((_, index) => (
                    <Cup
                      key={`p1-cup-${index}`}
                      sunk={player1Cups && player1Cups[index] ? true : false}
                      player={1}
                      cupIndex={index}
                      interactive={false}
                    />
                  ))}
                </div>
              </div>

              <div className="player-cups-container player-2-cups">
                <h4 className="cups-label">Player 2 Cups</h4>
                <div className="cups-grid">
                  {Array(6).fill(0).map((_, index) => (
                    <Cup
                      key={`p2-cup-${index}`}
                      sunk={player2Cups && player2Cups[index] ? true : false}
                      player={2}
                      cupIndex={index}
                      interactive={false}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Answer Preview (Game Master Only) */}
        {currentSong && (
          <div className="gm-section gm-answer-section">
            <h3 className="gm-section-title">Answer (Game Master Only)</h3>
            <div className="answer-display">
              <p className="answer-song">{currentSong.artist} - {currentSong.title}</p>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="gm-section gm-instructions">
          <h3 className="gm-section-title">Game Master Instructions</h3>
          <ul className="gm-instructions-list">
            <li>1. Select a song from the dropdown</li>
            <li>2. Share the Room ID with both players</li>
            <li>3. Wait for both players to join</li>
            <li>4. Click "Start Game" to begin</li>
            <li>5. Monitor player progress in real-time</li>
            <li>6. Click "End Game" to stop the game</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default GameMaster



