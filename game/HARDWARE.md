# Hardware Integration Guide

This game integrates with your physical beer pong setup using Raspberry Pi Pico and IR sensors.

## Hardware Components

- **IR Sensors**: DC5V Infrared Beam Sensor Detector (1m detection distance)
- **Microcontroller**: Raspberry Pi Pico (RP2040) - **TWO Picos needed (one per player)**
- **Communication**: USB Serial connection to laptop

## How It Works

1. IR sensor detects when ball passes through (breaks the beam)
2. Pico receives sensor signal and processes it
3. Pico sends simple signal to laptop via USB (just indicates "cup hit")
4. Browser reads serial data using Web Serial API
5. Game automatically sinks the corresponding cup and plays audio

## Important: Two Separate Picos

**Each player needs their own Pico:**
- **Player 1's Pico** → Connected to Laptop 1 (Player 1's browser)
- **Player 2's Pico** → Connected to Laptop 2 (Player 2's browser)

**The player number is determined by which laptop/Pico connection it is, NOT by what the Pico sends!**

## Pico Code Requirements

Since each Pico connects to one laptop (one per player), you only need to send a simple signal when a cup is hit.

### Data Format (Very Simple!)
**Any signal/string works!** Examples:
- `"1"`
- `"hit"`
- `"CUP"`
- `"ball"`
- Or literally any text string

**How it works:**
- **Player 1's Pico** → Connected to Laptop 1 → Sends signal when cup hit
- **Player 2's Pico** → Connected to Laptop 2 → Sends signal when cup hit
- The laptop/browser already knows which player it is, so the Pico just needs to signal "cup hit!"

## Pico Example Code (MicroPython)

**Important**: Each Pico is for ONE player only. Upload this same code to both Picos (one per player).

```python
from machine import Pin
import time

# Configure IR sensors (6 sensors for this player's 6 cups)
# Adjust pins to match your setup
cup_sensors = [
    Pin(0, Pin.IN, Pin.PULL_UP),  # Cup 0
    Pin(1, Pin.IN, Pin.PULL_UP),  # Cup 1
    Pin(2, Pin.IN, Pin.PULL_UP),  # Cup 2
    Pin(3, Pin.IN, Pin.PULL_UP),  # Cup 3
    Pin(4, Pin.IN, Pin.PULL_UP),  # Cup 4
    Pin(5, Pin.IN, Pin.PULL_UP),  # Cup 5
]

# Track last trigger to avoid duplicate signals (debounce)
last_trigger_time = 0
DEBOUNCE_TIME = 2.0  # Seconds between allowed triggers

def send_cup_sink():
    # Send any signal - laptop knows which player based on USB port/connection
    print("1")  # Simple signal works! Could be any text: "hit", "CUP", etc.

def check_sensors():
    global last_trigger_time
    
    # Check if any sensor detected a cup hit
    cup_hit = False
    for sensor in cup_sensors:
        # Sensor goes LOW when beam is broken (adjust if your sensor works differently)
        if sensor.value() == 0:
            cup_hit = True
            break
    
    # If cup hit and enough time has passed (debounce)
    current_time = time.time()
    if cup_hit and (current_time - last_trigger_time) > DEBOUNCE_TIME:
        send_cup_sink()
        last_trigger_time = current_time

# Main loop
while True:
    check_sensors()
    time.sleep(0.05)  # Check every 50ms
```

## Connection Steps

1. **Upload code to Pico**: Copy the MicroPython code above and modify for your pin configuration
   - Upload the SAME code to both Picos (one for Player 1, one for Player 2)
2. **Connect Pico 1 to Laptop 1**: Use USB cable
3. **Connect Pico 2 to Laptop 2**: Use USB cable
4. **Open game in browser**: Chrome or Edge (Web Serial API support)
5. **Connect hardware**: 
   - On Laptop 1: Click "Connect to Raspberry Pi Pico" → Select Player 1's Pico COM port
   - On Laptop 2: Click "Connect to Raspberry Pi Pico" → Select Player 2's Pico COM port
6. **Test**: Break an IR sensor beam - cup should sink in game!

## How Player Identification Works

The system identifies which player hit a cup based on **which laptop/Pico connection received the signal**:

- **Laptop 1** (Player 1's browser) connected to **Pico 1** → Any signal = Player 1 hit
- **Laptop 2** (Player 2's browser) connected to **Pico 2** → Any signal = Player 2 hit

The Pico doesn't need to send player information - the laptop already knows!

## Troubleshooting

### Pico not detected
- Check USB connection
- Ensure Pico is powered on
- Try different USB port
- Check Device Manager (Windows) or `ls /dev/tty*` (Mac/Linux) for COM port

### No data received
- Check baud rate matches (default: 9600)
- Verify Pico code is running (check Serial Monitor)
- Check sensor wiring and power
- Verify sensor logic (HIGH/LOW when beam broken)

### Wrong player triggered
- Make sure each Pico is connected to the correct laptop
- Player 1's Pico → Laptop 1 (Player 1's browser)
- Player 2's Pico → Laptop 2 (Player 2's browser)
- The laptop determines the player number, not the Pico

### Browser compatibility
- **Chrome/Edge**: Full support ✅
- **Firefox**: Not supported ❌
- **Safari**: Not supported ❌

## Sensor Wiring Notes

Your IR sensors likely have:
- **VCC**: Connect to 5V (or 3.3V depending on sensor)
- **GND**: Connect to ground
- **OUT**: Connect to Pico GPIO pin (with pull-up resistor if needed)

NPN NO (Normally Open) sensors typically:
- Output LOW when beam is broken (ball passes through)
- Output HIGH when beam is intact

Adjust the sensor reading logic in the Pico code to match your sensor type.

## Serial Communication Settings

Default settings:
- **Baud Rate**: 9600
- **Data Bits**: 8
- **Stop Bits**: 1
- **Parity**: None

To change baud rate, update both:
1. Pico code: `Serial(baudrate=115200)` (or your desired rate)
2. Browser code: `hardwareController.jsx` → `baudRate: 115200`

## Setup Summary

### For Player 1:
1. Connect Player 1's Pico (with 6 sensors) to Laptop 1
2. Player 1 opens game in browser on Laptop 1
3. Player 1 clicks "Connect to Raspberry Pi Pico"
4. Player 1 selects their Pico's COM port
5. Done! Any signal from this Pico = Player 1 hit

### For Player 2:
1. Connect Player 2's Pico (with 6 sensors) to Laptop 2
2. Player 2 opens game in browser on Laptop 2
3. Player 2 clicks "Connect to Raspberry Pi Pico"
4. Player 2 selects their Pico's COM port
5. Done! Any signal from this Pico = Player 2 hit

---

Need help? Check the browser console (F12) for error messages!
