import React, { useState, useEffect, useRef } from 'react'
import { initializeApp } from 'firebase/app'
import { getDatabase, ref, onValue, set, push, update } from 'firebase/database'
import GameBoard from './components/GameBoard'
import Lobby from './components/Lobby'
import Leaderboard from './components/Leaderboard'
import GameMaster from './components/GameMaster'
import './App.css'

// Import logo - using Vite's BASE_URL to handle base path correctly
const logoPath = `${import.meta.env.BASE_URL}icon.png`

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCo370oAFIlJsjXfhVtd5helf8lEKkBn1k",
  authDomain: "waterloo-tbog-tech-ex-2026.firebaseapp.com",
  databaseURL: "https://waterloo-tbog-tech-ex-2026-default-rtdb.firebaseio.com",
  projectId: "waterloo-tbog-tech-ex-2026",
  storageBucket: "waterloo-tbog-tech-ex-2026.firebasestorage.app",
  messagingSenderId: "304566509763",
  appId: "1:304566509763:web:def8ecee25b875df360276",
  measurementId: "G-E7V7L21TBH"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const database = getDatabase(app)


function App() {
  const [gameState, setGameState] = useState('lobby') // 'lobby', 'waiting', 'playing', 'finished', 'gamemaster'
  const [playerId, setPlayerId] = useState(null)
  const [gameId, setGameId] = useState(null)
  const [roomId, setRoomId] = useState(null)
  const [isGameMaster, setIsGameMaster] = useState(false)
  const [selectedSongIndex, setSelectedSongIndex] = useState(null)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [playerInfo, setPlayerInfo] = useState({ name: '', school: '', playerNumber: null })
  const hasJoinedRoomRef = useRef(false) // Track if we've already joined the room (to prevent repeated logs)
  const previousRoomIdRef = useRef(null) // Track previous room ID to detect room changes
  const roomUnsubscribeRef = useRef(null) // Store the unsubscribe function to clean up listeners

  // Generate or load player ID
  useEffect(() => {
    let savedPlayerId = localStorage.getItem('playerId')
    if (!savedPlayerId) {
      savedPlayerId = 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      localStorage.setItem('playerId', savedPlayerId)
    }
    setPlayerId(savedPlayerId)
  }, [])

  // createRoom removed - only Game Master can create games now

  const joinRoom = (roomIdToJoin, playerName, playerSchool, playerNumber = null) => {
    // CRITICAL: Clean up existing listener if one exists
    if (roomUnsubscribeRef.current) {
      console.log('🧹 Cleaning up previous room listener')
      roomUnsubscribeRef.current()
      roomUnsubscribeRef.current = null
    }
    
    const roomRef = ref(database, `rooms/${roomIdToJoin}`)
    
    // Only reset hasJoinedRoomRef if we're joining a DIFFERENT room
    if (previousRoomIdRef.current !== roomIdToJoin) {
      hasJoinedRoomRef.current = false
      previousRoomIdRef.current = roomIdToJoin
      console.log('🔄 New room detected, resetting join flag')
    }
    
    // Listen to room changes (including game state)
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        let assignedPlayerNumber = null
        
        // First, check if this player is already in the room
        if (data.player1 === playerId) {
          // This is player 1 - ONLY log once on initial join
          assignedPlayerNumber = 1
          if (!hasJoinedRoomRef.current) {
            console.log('🎮 Player 1 joining room:', { roomId: roomIdToJoin, playerId, playerName, playerSchool })
            hasJoinedRoomRef.current = true
          }
          // NEVER log again - even if listener fires multiple times
        } else if (data.player2 === playerId) {
          // This is player 2 - ONLY log once on initial join
          assignedPlayerNumber = 2
          if (!hasJoinedRoomRef.current) {
            console.log('🎮 Player 2 joining room:', { roomId: roomIdToJoin, playerId, playerName, playerSchool })
            hasJoinedRoomRef.current = true
          }
          // NEVER log again - even if listener fires multiple times
        } else if (!data.player1) {
          // First player to join - becomes Player 1
          assignedPlayerNumber = 1
          if (!hasJoinedRoomRef.current) {
            console.log('🎮 Player 1 joining room:', { roomId: roomIdToJoin, playerId, playerName, playerSchool })
            hasJoinedRoomRef.current = true
            set(ref(database, `rooms/${roomIdToJoin}/player1`), playerId)
            set(ref(database, `rooms/${roomIdToJoin}/player1Info`), { name: playerName, school: playerSchool })
          }
          // NEVER log again after initial join
        } else if (!data.player2) {
          // Second player to join - becomes Player 2 (only if this player isn't already player1)
          assignedPlayerNumber = 2
          if (!hasJoinedRoomRef.current) {
            console.log('🎮 Player 2 joining room:', { roomId: roomIdToJoin, playerId, playerName, playerSchool })
            hasJoinedRoomRef.current = true
            set(ref(database, `rooms/${roomIdToJoin}/player2`), playerId)
            set(ref(database, `rooms/${roomIdToJoin}/player2Info`), { name: playerName, school: playerSchool })
          }
          // NEVER log again after initial join
        } else {
          // Room is full with different players
          if (data.player1 && data.player2 && data.player1 !== playerId && data.player2 !== playerId) {
            if (!hasJoinedRoomRef.current) {
              console.log('❌ Room is full!', { roomId: roomIdToJoin, playerId, existingPlayer1: data.player1, existingPlayer2: data.player2 })
              alert('This room is already full with two players!')
              hasJoinedRoomRef.current = true
            }
          }
          return
        }
        
        // Only update state if we have a valid assigned player number
        // This prevents updating state on every Firebase change when we're already in the room
        if (assignedPlayerNumber) {
          // Set room info (only update if needed to avoid unnecessary re-renders)
          setRoomId(roomIdToJoin)
          setGameId(roomIdToJoin)
          setPlayerInfo({ 
            name: data[`player${assignedPlayerNumber}Info`]?.name || playerName, 
            school: data[`player${assignedPlayerNumber}Info`]?.school || playerSchool, 
            playerNumber: assignedPlayerNumber 
          })
          
          // Update game state based on Firebase
          if (data.gameState === 'playing') {
            setGameState('playing')
          } else {
            setGameState('waiting')
          }
        }
      } else {
        // Room doesn't exist
        if (!hasJoinedRoomRef.current) {
          alert('Room not found. Please check the Room ID or ask the Game Master to create it.')
        }
      }
    })
    
    // Store unsubscribe function to clean up later
    roomUnsubscribeRef.current = unsubscribe
    console.log('✅ Room listener set up and stored')
  }

  const startNewGame = () => {
    setGameState('lobby')
    setGameId(null)
    setRoomId(null)
    setIsGameMaster(false)
    setSelectedSongIndex(null)
    setPlayerInfo({ name: '', school: '', playerNumber: null })
    hasJoinedRoomRef.current = false // Reset join tracking when leaving
  }

  const createGameMaster = async () => {
    try {
      // Get the next room number from Firebase
      const configRef = ref(database, 'config/lastRoomNumber')
      const configSnapshot = await new Promise((resolve) => {
        onValue(configRef, (snapshot) => {
          resolve(snapshot)
        }, { onlyOnce: true })
      })
      
      const lastRoomNumber = configSnapshot.val() || 0
      const nextRoomNumber = lastRoomNumber + 1
      const newRoomId = `room ${nextRoomNumber}`
      
      // Update the last room number
      await set(configRef, nextRoomNumber)
      
      setRoomId(newRoomId)
      setGameId(newRoomId)
      setIsGameMaster(true)
      setGameState('gamemaster')
      
      // Create room in Firebase
      const roomRef = ref(database, `rooms/${newRoomId}`)
      set(roomRef, {
        gameMasterId: playerId,
        gameState: 'waiting',
        createdAt: Date.now(),
        player1: null,
        player2: null,
        player1Info: null,
        player2Info: null,
        currentSongIndex: null
      })
    } catch (error) {
      console.error('Error creating room:', error)
      alert('Failed to create room. Please try again.')
    }
  }

  const handleGameMasterStart = (songIndex) => {
    setSelectedSongIndex(songIndex)
    if (gameId) {
      const gameRef = ref(database, `rooms/${gameId}`)
      update(gameRef, {
        currentSongIndex: songIndex,
        gameState: 'playing'
      })
    }
  }

  const handleGameMasterEnd = () => {
    setGameState('lobby')
    setGameId(null)
    setRoomId(null)
    setIsGameMaster(false)
    setSelectedSongIndex(null)
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <img 
            src={logoPath}
            alt="UWTBOG Logo" 
            className="header-logo"
          />
          <h1 className="header-title">BEER PONG HEARDLE</h1>
          <div className="header-right">
            <button 
              className="trophy-button"
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              aria-label="Toggle Leaderboard"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="trophy-icon">
                <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        {gameState === 'lobby' && (
          <Lobby 
            playerId={playerId}
            onJoinRoom={joinRoom}
            onCreateGameMaster={createGameMaster}
            roomId={roomId}
          />
        )}

        {gameState === 'gamemaster' && (
          <GameMaster
            gameId={gameId}
            playerId={playerId}
            database={database}
            onStartGame={handleGameMasterStart}
            onEndGame={handleGameMasterEnd}
          />
        )}

        {gameState === 'waiting' && (
          <div className="waiting-screen">
            <div className="waiting-content">
              <h2>Waiting for Game to Start</h2>
              <div className="waiting-info">
                <p>Room ID: <strong>{roomId}</strong></p>
                <p>You are: <strong>Player {playerInfo.playerNumber}</strong></p>
                <p className="player-name">{playerInfo.name} ({playerInfo.school})</p>
              </div>
              <div className="waiting-message">
                <p>⏳ Waiting for Game Master to start the game...</p>
              </div>
              <button onClick={startNewGame} className="btn-secondary">Leave Room</button>
            </div>
          </div>
        )}

        {gameState === 'playing' && gameId && (
          <GameBoard
            gameId={gameId}
            playerId={playerId}
            database={database}
            selectedSongIndex={selectedSongIndex}
            isGameMaster={isGameMaster}
            playerInfo={playerInfo}
            onGameEnd={startNewGame}
          />
        )}

        {gameState === 'finished' && (
          <div className="game-finished">
            <h2>Game Finished!</h2>
            <button onClick={startNewGame} className="btn-primary">Play Again</button>
          </div>
        )}
      </main>

      {showLeaderboard && (
        <aside className="leaderboard-sidebar">
          <Leaderboard database={database} />
        </aside>
      )}
    </div>
  )
}

export default App

