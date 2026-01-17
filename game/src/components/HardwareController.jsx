import React, { useState, useEffect, useRef } from 'react'
import './HardwareController.css'

/**
 * Hardware Controller for Raspberry Pi Pico Integration
 * 
 * Each laptop connects to one Pico (one per player)
 * Since we know which player this laptop is, we only need a simple signal from the Pico
 * 
 * Expected serial data format from Pico:
 * - Any signal/string indicates a cup was hit
 * - Examples: "1", "hit", "CUP", or just any text
 * - The player number is determined by which laptop/browser this is
 * 
 * Note: It doesn't matter which specific cup was hit - any cup hit removes one cup
 * and plays the next snippet in sequence.
 */
function HardwareController({ onCupSink, playerNumber }) {
  const [isConnected, setIsConnected] = useState(false)
  const [port, setPort] = useState(null)
  const [reader, setReader] = useState(null)
  const [status, setStatus] = useState('Disconnected')
  const portRef = useRef(null)

  // Check if Web Serial API is available
  const isSerialSupported = 'serial' in navigator

  const connectToDevice = async () => {
    if (!isSerialSupported) {
      alert('Web Serial API is not supported in this browser. Please use Chrome or Edge.')
      return
    }

    try {
      // First, ensure any existing connection is properly closed
      if (portRef.current) {
        try {
          if (portRef.current.readable) {
            // Port might be open, try to close it
            await portRef.current.close()
          }
        } catch (closeError) {
          console.warn('Error closing existing port:', closeError)
          // Continue anyway - might already be closed
        }
        portRef.current = null
        setPort(null)
      }

      if (reader) {
        try {
          await reader.cancel()
        } catch (cancelError) {
          console.warn('Error canceling reader:', cancelError)
        }
        setReader(null)
      }

      // Request port access
      const selectedPort = await navigator.serial.requestPort()
      
      // Check if port is already open
      if (selectedPort.readable) {
        setStatus('Port already in use. Please disconnect and try again.')
        setIsConnected(false)
        return
      }

      setPort(selectedPort)
      portRef.current = selectedPort

      // Open port with baud rate (115200 is common for modern MCUs like Pico)
      await selectedPort.open({ baudRate: 115200 })
      setIsConnected(true)
      setStatus('Connected')

      // Set up reader using pipeThrough (simpler and more reliable than pipeTo)
      // This matches the working example: port.readable.pipeThrough(new TextDecoderStream()).getReader()
      const newReader = selectedPort.readable
        .pipeThrough(new TextDecoderStream())
        .getReader()
      setReader(newReader)

      // Read data from serial port
      readSerialData(newReader)
    } catch (error) {
      console.error('Error connecting to device:', error)
      
      // Provide more specific error messages
      let errorMessage = 'Connection error: '
      if (error.name === 'NetworkError') {
        errorMessage += 'Failed to open serial port. The port may be in use by another application. Please close other programs using the serial port and try again.'
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'Device not found. Please ensure your MCU is connected and try again.'
      } else if (error.name === 'SecurityError') {
        errorMessage += 'Permission denied. Please grant serial port access and try again.'
      } else {
        errorMessage += error.message || 'Unknown error occurred'
      }
      
      setStatus(errorMessage)
      setIsConnected(false)
      
      // Clean up on error
      if (portRef.current) {
        portRef.current = null
        setPort(null)
      }
    }
  }

  const readSerialData = async (serialReader) => {
    try {
      console.log('📡 Starting to read serial data...')
      while (true) {
        const { value, done } = await serialReader.read()
        if (done) {
          console.log('📡 Serial reader done')
          break
        }

        if (value) {
          console.log('📡 Received value from serial reader')
          processSerialData(value)
        } else {
          console.log('📡 Received empty value')
        }
      }
    } catch (error) {
      console.error('Error reading serial data:', error)
      setStatus('Read error - check connection')
      setIsConnected(false)
    }
  }

  const processSerialData = (data) => {
    try {
      // DEBUG: Log raw data received
      console.log('📥 Raw serial data received:', data, 'Type:', typeof data, 'Length:', data.length)
      console.log('📥 Character codes:', Array.from(data).map(c => c.charCodeAt(0)))
      
      // Any data received means a cup was hit
      // NOTE: Arduino/Pico does NOT send player number - only sends a signal like "1"
      // The player number is already known by this laptop/browser (passed as prop from GameBoard)
      // Since each laptop connects to one Arduino (one per player), we know which player this is
      
      // Split by newlines in case multiple signals came in one chunk
      const lines = data.split('\n').map(line => line.trim()).filter(line => line.length > 0)
      
      // Process each line (each cup hit)
      for (const line of lines) {
        if (line.length === 0) {
          continue
        }

        // DEBUG: Log processed line
        console.log('✅ Processed line:', line)
        
        // Any non-empty signal = cup hit!
        // playerNumber comes from browser context (which laptop this is), NOT from Arduino
        setStatus(`Ball sunk! Player ${playerNumber} hit a cup!`)
        
        // Trigger cup sink callback with this laptop's player number (known from browser context)
        if (onCupSink) {
          onCupSink(playerNumber)
        }
      }
    } catch (error) {
      console.error('Error processing serial data:', error, 'Raw data:', data)
    }
  }

  const disconnectDevice = async () => {
    try {
      // Cancel reader first
      if (reader) {
        try {
          await reader.cancel()
        } catch (cancelError) {
          console.warn('Error canceling reader:', cancelError)
        }
        setReader(null)
      }

      // Close port
      const portToClose = port || portRef.current
      if (portToClose) {
        try {
          // Check if port is open before closing
          if (portToClose.readable || portToClose.writable) {
            await portToClose.close()
          }
        } catch (closeError) {
          console.warn('Error closing port:', closeError)
          // Port might already be closed, continue anyway
        }
        setPort(null)
        portRef.current = null
      }

      setIsConnected(false)
      setStatus('Disconnected')
    } catch (error) {
      console.error('Error disconnecting:', error)
      // Force reset state even if cleanup fails
      setIsConnected(false)
      setStatus('Disconnected')
      setPort(null)
      setReader(null)
      portRef.current = null
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup function - don't call async disconnectDevice directly
      const cleanup = async () => {
        try {
          if (reader) {
            try {
              await reader.cancel()
            } catch (e) {
              // Ignore cleanup errors
            }
          }
          if (portRef.current) {
            try {
              const portToClose = portRef.current
              if (portToClose.readable || portToClose.writable) {
                await portToClose.close()
              }
            } catch (e) {
              // Ignore cleanup errors
            }
          }
        } catch (error) {
          // Ignore cleanup errors
        }
      }
      cleanup()
    }
  }, [reader, port])

  if (!isSerialSupported) {
    return (
      <div className="hardware-controller">
        <div className="hardware-status error">
          <i className="fas fa-exclamation-triangle"></i>
          <span>Web Serial API not supported. Please use Chrome or Edge browser.</span>
        </div>
      </div>
    )
  }

  return (
    <div className="hardware-controller">
      <div className="hardware-header">
        <h3>Hardware Connection</h3>
        <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
          <span className="status-dot"></span>
          {status}
        </div>
      </div>

      {!isConnected ? (
        <button onClick={connectToDevice} className="btn-connect">
          <i className="fas fa-usb"></i>
          Connect to Raspberry Pi Pico
        </button>
      ) : (
        <div className="hardware-controls">
          <button onClick={disconnectDevice} className="btn-disconnect">
            <i className="fas fa-unlink"></i>
            Disconnect
          </button>
          <div className="hardware-info">
            <p><strong>Player {playerNumber}</strong> hardware active</p>
            <p className="hardware-hint">Listening for sensor signals...</p>
          </div>
        </div>
      )}

    </div>
  )
}

export default HardwareController

