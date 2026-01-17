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
      // Request port access
      const selectedPort = await navigator.serial.requestPort()
      setPort(selectedPort)
      portRef.current = selectedPort

      // Open port with baud rate (adjust if your Pico uses different rate)
      await selectedPort.open({ baudRate: 9600 })
      setIsConnected(true)
      setStatus('Connected')

      // Set up reader
      const textDecoder = new TextDecoderStream()
      const readableStreamClosed = selectedPort.readable.pipeTo(textDecoder.writable)
      const newReader = textDecoder.readable.getReader()
      setReader(newReader)

      // Read data from serial port
      readSerialData(newReader)
    } catch (error) {
      console.error('Error connecting to device:', error)
      setStatus(`Connection error: ${error.message}`)
      setIsConnected(false)
    }
  }

  const readSerialData = async (serialReader) => {
    try {
      while (true) {
        const { value, done } = await serialReader.read()
        if (done) {
          break
        }

        if (value) {
          processSerialData(value)
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
      // Any data received means a cup was hit
      // NOTE: Arduino/Pico does NOT send player number - only sends a signal like "1"
      // The player number is already known by this laptop/browser (passed as prop from GameBoard)
      // Since each laptop connects to one Arduino (one per player), we know which player this is
      const trimmed = data.trim()
      
      // Ignore empty signals
      if (trimmed.length === 0) {
        return
      }

      // Any non-empty signal = cup hit!
      // playerNumber comes from browser context (which laptop this is), NOT from Arduino
      setStatus(`Ball sunk! Player ${playerNumber} hit a cup!`)
      
      // Trigger cup sink callback with this laptop's player number (known from browser context)
      if (onCupSink) {
        onCupSink(playerNumber)
      }
    } catch (error) {
      console.error('Error processing serial data:', error, 'Raw data:', data)
    }
  }

  const disconnectDevice = async () => {
    try {
      if (reader) {
        await reader.cancel()
        setReader(null)
      }
      if (port) {
        await port.close()
        setPort(null)
        portRef.current = null
      }
      setIsConnected(false)
      setStatus('Disconnected')
    } catch (error) {
      console.error('Error disconnecting:', error)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (portRef.current) {
        disconnectDevice()
      }
    }
  }, [])

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

