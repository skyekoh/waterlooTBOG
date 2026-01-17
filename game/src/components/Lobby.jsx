import React, { useState } from 'react'
import './Lobby.css'

function Lobby({ playerId, onCreateRoom, onJoinRoom, onCreateGameMaster, roomId }) {
  const [joinRoomId, setJoinRoomId] = useState('')
  const [showJoinInput, setShowJoinInput] = useState(false)
  const [playerName, setPlayerName] = useState('')
  const [playerSchool, setPlayerSchool] = useState('')
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const handlePasswordSubmit = () => {
    if (password.trim() === 'TBOG') {
      setShowPasswordPrompt(false)
      setPassword('')
      setPasswordError('')
      if (onCreateGameMaster) {
        onCreateGameMaster()
      }
    } else {
      setPasswordError('Incorrect password. Please try again.')
      setPassword('')
    }
  }

  return (
    <div className="lobby">
      <div className="lobby-content">
        <h2 className="lobby-title">Game Lobby</h2>
        <p className="lobby-subtitle">Player ID: <span className="player-id">{playerId}</span></p>
        
        <div className="lobby-actions">
          <button 
            onClick={() => setShowJoinInput(!showJoinInput)} 
            className="btn-join-room"
          >
            Join Game
          </button>

          {onCreateGameMaster && (
            <button 
              onClick={() => setShowPasswordPrompt(true)} 
              className="btn-game-master"
            >
              Game Master (Create Game)
            </button>
          )}
        </div>

        {roomId && (
          <div className="room-info">
            <p className="room-label">Room ID:</p>
            <p className="room-id">{roomId}</p>
            <p className="room-instructions">Share this Room ID with Player 2</p>
          </div>
        )}

        {showPasswordPrompt && (
          <div className="password-prompt-overlay">
            <div className="password-prompt">
              <h3>Game Master Access</h3>
              <p>Enter the Game Master password:</p>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setPasswordError('')
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handlePasswordSubmit()
                  }
                }}
                placeholder="Password"
                className="password-input"
                autoFocus
              />
              {passwordError && (
                <p className="password-error">{passwordError}</p>
              )}
              <div className="password-actions">
                <button
                  onClick={handlePasswordSubmit}
                  className="btn-submit-password"
                >
                  Submit
                </button>
                <button
                  onClick={() => {
                    setShowPasswordPrompt(false)
                    setPassword('')
                    setPasswordError('')
                  }}
                  className="btn-cancel-password"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showJoinInput && (
          <div className="join-room-form">
            <div className="player-info-form">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Your Name"
                className="player-info-input"
              />
              <input
                type="text"
                value={playerSchool}
                onChange={(e) => setPlayerSchool(e.target.value)}
                placeholder="Your School"
                className="player-info-input"
              />
            </div>
            <input
              type="text"
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value)}
              placeholder="Enter Room ID"
              className="room-id-input"
            />
            <button
              onClick={() => {
                if (joinRoomId.trim() && playerName.trim() && playerSchool.trim()) {
                  onJoinRoom(joinRoomId.trim(), playerName.trim(), playerSchool.trim())
                }
              }}
              className="btn-submit-join"
              disabled={!joinRoomId.trim() || !playerName.trim() || !playerSchool.trim()}
            >
              Join Game
            </button>
          </div>
        )}

        <div className="game-instructions">
          <h3>How to Play</h3>
          <ul>
            <li>1. Game Master creates a game, then players join with Room ID</li>
            <li>2. Shoot the ball into cups to unlock song snippets (both players can shoot anytime)</li>
            <li>3. Guess the song to win!</li>
            <li>4. First player to guess correctly OR sink all 6 cups wins!</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Lobby



