import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react'
import './AudioPlayer.css'

const AudioPlayer = forwardRef(({ songUrl, snippet = null, isLastSnippet = false, onPlayComplete }, ref) => {
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const timeoutRef = useRef(null)
  const playPromiseRef = useRef(null)

  const playSnippet = () => {
    if (!audioRef.current || !snippet || !songUrl) return false
    
    const audio = audioRef.current
    
    // If already playing, don't interrupt
    if (isPlaying) {
      return false
    }
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    
    // Set error handler
    audio.onerror = (e) => {
      console.error('Audio loading error:', e)
      console.error('Failed to load:', songUrl)
      setIsPlaying(false)
      playPromiseRef.current = null
    }
    
    const playAudio = () => {
      try {
        // Set the start time
        audio.currentTime = snippet.start || 0
        
        // Pause first to ensure clean state
        audio.pause()
        
        // Wait a tiny bit before playing to ensure state is clean
        setTimeout(() => {
          if (!audioRef.current) return
          
          playPromiseRef.current = audio.play()
          
          if (playPromiseRef.current !== undefined) {
            playPromiseRef.current
              .then(() => {
                if (!audioRef.current) return
                setIsPlaying(true)
                
                if (isLastSnippet) {
                  // For the last snippet, play until the end of the song
                  // Listen for when the song ends naturally
                  const onEnded = () => {
                    if (audioRef.current) {
                      setIsPlaying(false)
                      playPromiseRef.current = null
                      if (onPlayComplete) onPlayComplete()
                    }
                    audioRef.current.removeEventListener('ended', onEnded)
                  }
                  audioRef.current.addEventListener('ended', onEnded)
                } else {
                  // For regular snippets, stop after snippet duration
                  const duration = snippet.duration || 5
                  timeoutRef.current = setTimeout(() => {
                    if (audioRef.current) {
                      audioRef.current.pause()
                      setIsPlaying(false)
                      playPromiseRef.current = null
                      if (onPlayComplete) onPlayComplete()
                    }
                  }, duration * 1000)
                }
              })
              .catch(err => {
                // AbortError is expected when audio is interrupted - ignore it
                if (err.name !== 'AbortError') {
                  console.error('Error playing audio:', err)
                }
                setIsPlaying(false)
                playPromiseRef.current = null
              })
          }
        }, 50)
        
        return true
      } catch (error) {
        console.error('Error in playAudio:', error)
        setIsPlaying(false)
        playPromiseRef.current = null
        return false
      }
    }
    
    // Load the audio first
    audio.load()
    
    // Wait for audio to be ready
    if (audio.readyState >= 2) {
      return playAudio()
    } else {
      const canPlayHandler = () => {
        audio.removeEventListener('canplay', canPlayHandler)
        playAudio()
      }
      audio.addEventListener('canplay', canPlayHandler)
      
      // Fallback timeout
      setTimeout(() => {
        if (audio.readyState >= 2 && !isPlaying && audioRef.current) {
          audio.removeEventListener('canplay', canPlayHandler)
          playAudio()
        }
      }, 500)
      
      return true
    }
  }

  // Expose playSnippet via ref
  useImperativeHandle(ref, () => ({
    play: playSnippet,
    isPlaying: isPlaying
  }))

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (audioRef.current) {
        audioRef.current.pause()
      }
      playPromiseRef.current = null
    }
  }, [])

  return (
    <audio
      ref={audioRef}
      src={songUrl}
      preload="auto"
      style={{ display: 'none' }}
    />
  )
})

AudioPlayer.displayName = 'AudioPlayer'

export default AudioPlayer
