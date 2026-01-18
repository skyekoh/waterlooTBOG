import React, { useState, useEffect, useRef } from 'react'
import { ref, onValue, set, update, push } from 'firebase/database'
import Cup from './Cup'
import AudioPlayer from './AudioPlayer'
import GuessInput from './GuessInput'
import HardwareController from './HardwareController'
import { songs } from '../config/songs'
import './GameBoard.css'

function GameBoard({ gameId, playerId, database, selectedSongIndex, isGameMaster, onGameEnd, playerInfo = { name: '', school: '', playerNumber: null } }) {
  const [gameData, setGameData] = useState(null)
  const [currentSongIndex, setCurrentSongIndex] = useState(0)
  const [player1Cups, setPlayer1Cups] = useState(Array(6).fill(false))
  const [player2Cups, setPlayer2Cups] = useState(Array(6).fill(false))
  const [player1Guesses, setPlayer1Guesses] = useState(0)
  const [player2Guesses, setPlayer2Guesses] = useState(0)
  const [player1GuessUsed, setPlayer1GuessUsed] = useState(false) // Track if player 1 has used their guess for current cup count
  const [player2GuessUsed, setPlayer2GuessUsed] = useState(false) // Track if player 2 has used their guess for current cup count
  const [player1SnippetPlayed, setPlayer1SnippetPlayed] = useState(false) // Track if player 1 has played snippet for current cup count
  const [player2SnippetPlayed, setPlayer2SnippetPlayed] = useState(false) // Track if player 2 has played snippet for current cup count
  const [gameStatus, setGameStatus] = useState('playing') // 'playing', 'won', 'finished'
  const [winner, setWinner] = useState(null)
  const [lastSunkCup, setLastSunkCup] = useState(null)
  const gameAreaRef = useRef(null)
  const audioPlayerRef = useRef(null)
  const lastCupCountRef = useRef({ player1: 0, player2: 0 }) // Track previous cup counts
  const lastCupSinkTimeRef = useRef({ player1: 0, player2: 0 }) // Debounce: track last cup sink time per player
  const isProcessingCupSinkRef = useRef({ player1: false, player2: false }) // Prevent concurrent processing

  // Determine which player this instance is (1 or 2)
  const isPlayer1 = useRef(playerInfo.playerNumber === 1)

  useEffect(() => {
    // Update isPlayer1 based on playerInfo
    if (playerInfo.playerNumber !== null) {
      isPlayer1.current = playerInfo.playerNumber === 1
    }

    if (!database || !gameId) return

    const gameRef = ref(database, `rooms/${gameId}`)
    onValue(gameRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        setGameData(data)
        if (data.player1 === playerId) {
          isPlayer1.current = true
        } else if (data.player2 === playerId) {
          isPlayer1.current = false
        }
        if (data.player1Cups) {
          const currentCupCount = data.player1Cups.filter(cup => cup).length
          // Reset snippet status if cup count increased (new cup sunk)
          // Don't reset guessUsed - guess is only available after snippet is played
          if (currentCupCount > lastCupCountRef.current.player1) {
            setPlayer1SnippetPlayed(false) // New cup sunk, allow snippet to be played again
            lastCupCountRef.current.player1 = currentCupCount
          }
          setPlayer1Cups(data.player1Cups)
          // Ensure guesses match cups sunk count (guesses increment with each cup sunk)
          setPlayer1Guesses(currentCupCount)
        }
        if (data.player2Cups) {
          const currentCupCount = data.player2Cups.filter(cup => cup).length
          // Reset snippet status if cup count increased (new cup sunk)
          // Don't reset guessUsed - guess is only available after snippet is played
          if (currentCupCount > lastCupCountRef.current.player2) {
            setPlayer2SnippetPlayed(false) // New cup sunk, allow snippet to be played again
            lastCupCountRef.current.player2 = currentCupCount
          }
          setPlayer2Cups(data.player2Cups)
          // Ensure guesses match cups sunk count (guesses increment with each cup sunk)
          setPlayer2Guesses(currentCupCount)
        }
        if (data.player1SnippetPlayed !== undefined) setPlayer1SnippetPlayed(data.player1SnippetPlayed)
        if (data.player2SnippetPlayed !== undefined) setPlayer2SnippetPlayed(data.player2SnippetPlayed)
        if (data.currentSongIndex !== undefined && data.currentSongIndex !== null) {
          setCurrentSongIndex(data.currentSongIndex)
        }
        if (data.player1Guesses !== undefined) setPlayer1Guesses(data.player1Guesses)
        if (data.player2Guesses !== undefined) setPlayer2Guesses(data.player2Guesses)
        if (data.player1GuessUsed !== undefined) setPlayer1GuessUsed(data.player1GuessUsed)
        if (data.player2GuessUsed !== undefined) setPlayer2GuessUsed(data.player2GuessUsed)
        if (data.gameStatus) setGameStatus(data.gameStatus)
        if (data.winner) setWinner(data.winner)
        if (data.lastSunkCup) setLastSunkCup(data.lastSunkCup)
        
        // Initialize game state when Game Master starts the game
        // Note: Game Master already sets currentSongIndex when starting, so this shouldn't run often
        if (data.gameState === 'playing' && (data.currentSongIndex === undefined || data.currentSongIndex === null)) {
          const songIndexToUse = (selectedSongIndex !== null && selectedSongIndex !== undefined) ? selectedSongIndex : Math.floor(Math.random() * songs.length)
          lastCupCountRef.current = { player1: 0, player2: 0 }
          update(gameRef, {
            currentSongIndex: songIndexToUse,
            player1Cups: Array(6).fill(false),
            player2Cups: Array(6).fill(false),
            player1Guesses: 0,
            player2Guesses: 0,
            player1GuessUsed: false,
            player2GuessUsed: false,
            player1SnippetPlayed: false,
            player2SnippetPlayed: false,
            gameStatus: 'playing',
            winner: null
          })
        }
        
        // Initialize cup count ref if not already set
        if (data.player1Cups && lastCupCountRef.current.player1 === 0) {
          lastCupCountRef.current.player1 = data.player1Cups.filter(cup => cup).length
        }
        if (data.player2Cups && lastCupCountRef.current.player2 === 0) {
          lastCupCountRef.current.player2 = data.player2Cups.filter(cup => cup).length
        }
      }
    })
  }, [gameId, playerId, database, playerInfo, selectedSongIndex])

  // Handle cup sink from hardware - player hit any cup
  const handleCupSink = (player) => {
    if (gameStatus !== 'playing') {
      console.log('⚠️ Game not playing, ignoring cup sink')
      return
    }
    
    const playerKey = player === 1 ? 'player1' : 'player2'
    const now = Date.now()
    
    // Debounce: Prevent processing multiple signals within 500ms
    if (now - lastCupSinkTimeRef.current[playerKey] < 500) {
      console.log(`⚠️ Debouncing cup sink for player ${player} (too soon after last sink)`)
      return
    }
    
    // Prevent concurrent processing for the same player
    if (isProcessingCupSinkRef.current[playerKey]) {
      console.log(`⚠️ Already processing cup sink for player ${player}`)
      return
    }
    
    isProcessingCupSinkRef.current[playerKey] = true
    lastCupSinkTimeRef.current[playerKey] = now
    
    // Use functional state updates to ensure we have the latest state
    if (player === 1) {
      setPlayer1Cups(currentCups => {
        // Count how many cups are already sunk
        const sunkCount = currentCups.filter(cup => cup).length
        
        console.log(`🎯 Processing cup sink for player ${player}, current sunk count: ${sunkCount}`)
        
        // Check if all cups are already sunk
        if (sunkCount >= 6) {
          console.log(`⚠️ All cups already sunk for player ${player}`)
          isProcessingCupSinkRef.current[playerKey] = false
          return currentCups
        }

        // Find the first unsunk cup and mark it as sunk
        const newCups = [...currentCups]
        const cupToSink = newCups.findIndex(cup => !cup)
        
        if (cupToSink === -1) {
          console.log(`⚠️ No available cups to sink for player ${player}`)
          isProcessingCupSinkRef.current[playerKey] = false
          return currentCups
        }
        
        newCups[cupToSink] = true
        const newSunkCount = sunkCount + 1
        const newGuesses = newSunkCount

        console.log(`✅ Sinking cup ${cupToSink + 1} for player ${player}, new sunk count: ${newSunkCount}`)

        // Update other state
        setPlayer1Guesses(newGuesses)
        setPlayer1SnippetPlayed(false)
        
        setLastSunkCup({ 
          player, 
          cupIndex: cupToSink, 
          snippetNumber: newSunkCount,
          timestamp: now
        })

        // Update Firebase
        const gameRef = ref(database, `rooms/${gameId}`)
        update(gameRef, {
          player1Cups: newCups,
          player1Guesses: newGuesses,
          player1SnippetPlayed: false,
          lastSunkCup: { 
            player, 
            cupIndex: cupToSink, 
            snippetNumber: newSunkCount,
            timestamp: now
          }
        }).then(() => {
          console.log(`✅ Firebase updated for player ${player} cup sink`)
          isProcessingCupSinkRef.current[playerKey] = false
        }).catch((error) => {
          console.error(`❌ Error updating Firebase for player ${player}:`, error)
          isProcessingCupSinkRef.current[playerKey] = false
        })
        
        return newCups
      })
    } else {
      setPlayer2Cups(currentCups => {
        // Count how many cups are already sunk
        const sunkCount = currentCups.filter(cup => cup).length
        
        console.log(`🎯 Processing cup sink for player ${player}, current sunk count: ${sunkCount}`)
        
        // Check if all cups are already sunk
        if (sunkCount >= 6) {
          console.log(`⚠️ All cups already sunk for player ${player}`)
          isProcessingCupSinkRef.current[playerKey] = false
          return currentCups
        }

        // Find the first unsunk cup and mark it as sunk
        const newCups = [...currentCups]
        const cupToSink = newCups.findIndex(cup => !cup)
        
        if (cupToSink === -1) {
          console.log(`⚠️ No available cups to sink for player ${player}`)
          isProcessingCupSinkRef.current[playerKey] = false
          return currentCups
        }
        
        newCups[cupToSink] = true
        const newSunkCount = sunkCount + 1
        const newGuesses = newSunkCount

        console.log(`✅ Sinking cup ${cupToSink + 1} for player ${player}, new sunk count: ${newSunkCount}`)

        // Update other state
        setPlayer2Guesses(newGuesses)
        setPlayer2SnippetPlayed(false)
        
        setLastSunkCup({ 
          player, 
          cupIndex: cupToSink, 
          snippetNumber: newSunkCount,
          timestamp: now
        })

        // Update Firebase
        const gameRef = ref(database, `rooms/${gameId}`)
        update(gameRef, {
          player2Cups: newCups,
          player2Guesses: newGuesses,
          player2SnippetPlayed: false,
          lastSunkCup: { 
            player, 
            cupIndex: cupToSink, 
            snippetNumber: newSunkCount,
            timestamp: now
          }
        }).then(() => {
          console.log(`✅ Firebase updated for player ${player} cup sink`)
          isProcessingCupSinkRef.current[playerKey] = false
        }).catch((error) => {
          console.error(`❌ Error updating Firebase for player ${player}:`, error)
          isProcessingCupSinkRef.current[playerKey] = false
        })
        
        return newCups
      })
    }
  }

  const handleCorrectGuess = (player) => {
    setGameStatus('won')
    setWinner(player)

    // Save to leaderboard
    const guesses = player === 1 ? player1Guesses : player2Guesses
    const playerName = (player === 1 && playerInfo.playerNumber === 1) || (player === 2 && playerInfo.playerNumber === 2)
      ? playerInfo.name 
      : null
    const playerSchool = (player === 1 && playerInfo.playerNumber === 1) || (player === 2 && playerInfo.playerNumber === 2)
      ? playerInfo.school 
      : null

    // Update Firebase game state
    const gameRef = ref(database, `rooms/${gameId}`)
    update(gameRef, {
      gameStatus: 'won',
      winner: player,
      finishedAt: Date.now()
    })

    // Save to leaderboard
    const leaderboardRef = ref(database, 'leaderboard')
    push(leaderboardRef, {
      playerId: player === 1 ? (gameData?.player1 || playerId) : (gameData?.player2 || playerId),
      playerName: playerName || `Player ${player}`,
      playerSchool: playerSchool || '',
      gameId: gameId,
      songIndex: currentSongIndex,
      guesses: guesses,
      timestamp: Date.now()
    })

    setTimeout(() => {
      onGameEnd()
    }, 5000)
  }

  const checkGameFinished = () => {
    const allPlayer1Sunk = player1Cups.every(cup => cup)
    const allPlayer2Sunk = player2Cups.every(cup => cup)
    
    // If one player sinks all their cups, they win
    if (allPlayer1Sunk && gameStatus === 'playing') {
      setGameStatus('won')
      setWinner(1)
      
      // Save to leaderboard
      const playerName = playerInfo.playerNumber === 1 ? playerInfo.name : null
      const playerSchool = playerInfo.playerNumber === 1 ? playerInfo.school : null
      
      // Update Firebase game state
      const gameRef = ref(database, `rooms/${gameId}`)
      update(gameRef, {
        gameStatus: 'won',
        winner: 1,
        finishedAt: Date.now()
      })
      
      // Save to leaderboard
      const leaderboardRef = ref(database, 'leaderboard')
      push(leaderboardRef, {
        playerId: gameData?.player1 || playerId,
        playerName: playerName || 'Player 1',
        playerSchool: playerSchool || '',
        gameId: gameId,
        songIndex: currentSongIndex,
        guesses: player1Guesses,
        timestamp: Date.now()
      })
      
      setTimeout(() => {
        onGameEnd()
      }, 5000)
      return
    }
    
    if (allPlayer2Sunk && gameStatus === 'playing') {
      setGameStatus('won')
      setWinner(2)
      
      // Save to leaderboard
      const playerName = playerInfo.playerNumber === 2 ? playerInfo.name : null
      const playerSchool = playerInfo.playerNumber === 2 ? playerInfo.school : null
      
      // Update Firebase game state
      const gameRef = ref(database, `rooms/${gameId}`)
      update(gameRef, {
        gameStatus: 'won',
        winner: 2,
        finishedAt: Date.now()
      })
      
      // Save to leaderboard
      const leaderboardRef = ref(database, 'leaderboard')
      push(leaderboardRef, {
        playerId: gameData?.player2 || playerId,
        playerName: playerName || 'Player 2',
        playerSchool: playerSchool || '',
        gameId: gameId,
        songIndex: currentSongIndex,
        guesses: player2Guesses,
        timestamp: Date.now()
      })
      
      setTimeout(() => {
        onGameEnd()
      }, 5000)
    }
  }

  useEffect(() => {
    checkGameFinished()
  }, [player1Cups, player2Cups, gameStatus])

  const currentSong = songs[currentSongIndex] || (songs.length > 0 ? songs[0] : null)
  const myCups = isPlayer1.current ? player1Cups : player2Cups
  const opponentCups = isPlayer1.current ? player2Cups : player1Cups
  const myGuesses = isPlayer1.current ? player1Guesses : player2Guesses
  const myGuessUsed = isPlayer1.current ? player1GuessUsed : player2GuessUsed
  const mySnippetPlayed = isPlayer1.current ? player1SnippetPlayed : player2SnippetPlayed
  const mySunkCount = myCups.filter(cup => cup).length
  
  // If no song is available, show error
  if (!currentSong) {
    return (
      <div className="game-board">
        <div className="error-screen">
          <h2>⚠️ No Song Selected</h2>
          <p>There's no song available for this game.</p>
          <p>The Game Master needs to select a song and start the game.</p>
        </div>
      </div>
    )
  }
  
  // Get the snippet to play based on how many cups are sunk
  const getSnippetForPlayer = (player) => {
    const cups = player === 1 ? player1Cups : player2Cups
    const sunkCount = cups.filter(cup => cup).length
    if (sunkCount === 0 || !currentSong.snippets) return null
    // Snippet number is 1-indexed (1st cup = snippet 1)
    return currentSong.snippets[sunkCount - 1] || null
  }
  
  const mySnippet = getSnippetForPlayer(isPlayer1.current ? 1 : 2)

  return (
    <div className="game-board">
      <div className="game-info">
        <div className="player-info player-1">
          <h3>
            {playerInfo.playerNumber === 1 && playerInfo.name 
              ? `${playerInfo.name} (${playerInfo.school})` 
              : 'Player 1'}
          </h3>
          <p className="guesses">Guesses: {player1Guesses}</p>
          {isPlayer1.current === true && <span className="you-label">(YOU)</span>}
        </div>
        
        <div className="song-info">
          <p className="song-title">Guess the Song!</p>
          
          {/* Audio Player (hidden) */}
          {currentSong && (
            <AudioPlayer 
              ref={audioPlayerRef}
              songUrl={currentSong.url}
              snippet={mySnippet}
              isLastSnippet={mySunkCount === 6}
              onPlayComplete={() => {
                // Snippet finished playing
              }}
            />
          )}
          
          {mySunkCount > 0 && (
            <div className="snippet-info">
              <p>You've sunk {mySunkCount} cup{mySunkCount !== 1 ? 's' : ''} - Snippet {mySunkCount} of 6 available</p>
              
              {/* Play Snippet Button */}
              <button
                onClick={() => {
                  if (audioPlayerRef.current && mySnippet && !mySnippetPlayed && !audioPlayerRef.current.isPlaying) {
                    const success = audioPlayerRef.current.play()
                    if (success) {
                      // Mark snippet as played AND reset guess status so player can guess
                      const player = isPlayer1.current ? 1 : 2
                      if (player === 1) {
                        setPlayer1SnippetPlayed(true)
                        setPlayer1GuessUsed(false) // Reset guess status - snippet played allows a guess
                      } else {
                        setPlayer2SnippetPlayed(true)
                        setPlayer2GuessUsed(false) // Reset guess status - snippet played allows a guess
                      }
                      
                      // Update Firebase
                      const gameRef = ref(database, `rooms/${gameId}`)
                      const snippetPlayedKey = player === 1 ? 'player1SnippetPlayed' : 'player2SnippetPlayed'
                      const guessUsedKey = player === 1 ? 'player1GuessUsed' : 'player2GuessUsed'
                      update(gameRef, {
                        [snippetPlayedKey]: true,
                        [guessUsedKey]: false // Reset guess status - snippet played allows a guess
                      })
                    }
                  }
                }}
                className="play-snippet-button"
                disabled={mySunkCount === 0 || mySnippetPlayed || (audioPlayerRef.current && audioPlayerRef.current.isPlaying)}
              >
                {audioPlayerRef.current && audioPlayerRef.current.isPlaying ? '🔊 Playing...' : mySnippetPlayed ? '✅ Snippet Played' : '▶️ Play Snippet'}
              </button>
              {mySnippetPlayed && (
                <p className="snippet-hint">Sink another cup to play the next snippet!</p>
              )}
            </div>
          )}
          
          <GuessInput
            song={currentSong}
            onSubmit={(correct) => {
              // Mark guess as used IMMEDIATELY (for both correct and incorrect guesses)
              const player = isPlayer1.current ? 1 : 2
              if (player === 1) {
                setPlayer1GuessUsed(true)
              } else {
                setPlayer2GuessUsed(true)
              }
              
              // Update Firebase immediately to mark guess as used
              const gameRef = ref(database, `rooms/${gameId}`)
              const guessUsedKey = player === 1 ? 'player1GuessUsed' : 'player2GuessUsed'
              update(gameRef, {
                [guessUsedKey]: true
              })
              
              // Handle correct guess separately
              if (correct) {
                handleCorrectGuess(player)
              }
            }}
            enabled={mySnippetPlayed && !myGuessUsed && gameStatus === 'playing'}
            guessUsed={myGuessUsed}
          />
        </div>

        <div className="player-info player-2">
          <h3>
            {playerInfo.playerNumber === 2 && playerInfo.name 
              ? `${playerInfo.name} (${playerInfo.school})` 
              : 'Player 2'}
          </h3>
          <p className="guesses">Guesses: {player2Guesses}</p>
          {isPlayer1.current === false && <span className="you-label">(YOU)</span>}
        </div>
      </div>

      {/* Hardware Controller */}
      <HardwareController
        onCupSink={handleCupSink}
        playerNumber={isPlayer1.current ? 1 : 2}
      />

      {gameStatus === 'won' && (
        <div className="winner-banner">
          <h2>Player {winner} Wins! 🎉</h2>
          <p>Correct song: {currentSong.artist} - {currentSong.title}</p>
        </div>
      )}

      <div className="game-area" ref={gameAreaRef}>
        {/* Player 2 Cups (Top) */}
        <div className="cups-row cups-row-top">
          {opponentCups.map((sunk, index) => (
            <Cup
              key={`player2-${index}`}
              sunk={sunk}
              onClick={() => {}}
              player={2}
              cupIndex={index}
              interactive={false}
            />
          ))}
        </div>

        {/* Game Middle Area */}
        <div className="ball-area">
          {gameStatus === 'playing' && (
            <div className="shoot-instructions">
              <p>Sink all the cups or guess the song first to win!</p>
              <p className="shoot-hint">Alternate turns shooting the ball.</p>
              {/* Test Button - Sink a Cup (for testing without hardware) */}
              <button
                onClick={() => handleCupSink(isPlayer1.current ? 1 : 2)}
                className="test-sink-button"
                disabled={myCups.every(cup => cup)}
              >
                🎯 Test: Sink a Cup
              </button>
              {myCups.every(cup => cup) && (
                <p className="test-button-hint">All your cups are sunk!</p>
              )}
            </div>
          )}
        </div>

        {/* Player 1 Cups (Bottom) */}
        <div className="cups-row cups-row-bottom">
          {myCups.map((sunk, index) => (
            <Cup
              key={`player1-${index}`}
              sunk={sunk}
              onClick={() => {}}
              player={1}
              cupIndex={index}
              interactive={false}
            />
          ))}
        </div>
      </div>

      {gameStatus === 'playing' && (
        <div className="turn-indicator">
          Game is live! Shoot the ball whenever you're ready!
        </div>
      )}
    </div>
  )
}

export default GameBoard

