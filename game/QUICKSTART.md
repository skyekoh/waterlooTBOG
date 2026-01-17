# Quick Start - Running the Game Locally

## Prerequisites
- Node.js installed (v16 or higher recommended)
- npm (comes with Node.js)

## Step-by-Step Instructions

### 1. Open Terminal/Command Prompt
Navigate to the game directory:
```bash
cd waterlooTBOG/game
```

### 2. Install Dependencies
First time only - installs all required packages:
```bash
npm install
```

This will create a `node_modules` folder and install:
- React
- Vite (development server)
- Firebase
- All other dependencies

**Wait for this to complete** - may take 1-2 minutes.

### 3. Start Development Server
```bash
npm run dev
```

You should see output like:
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/game/
  ➜  Network: use --host to expose
```

### 4. Open in Browser
Open your browser and go to:
```
http://localhost:5173/game/
```

**Note**: The game will work for testing, but you'll need Firebase setup for the full multiplayer experience.

## Testing Without Firebase (Basic UI Test)

The game UI will load, but:
- ❌ Can't create/join rooms (needs Firebase)
- ❌ Can't sync between two laptops (needs Firebase)
- ✅ Can see all UI components
- ✅ Can see the game board and cups
- ✅ Can test hardware connection (if Pico is connected)

## Testing With Firebase (Full Functionality)

1. Set up Firebase (see `SETUP.md` or `README.md`)
2. Add your Firebase config to `src/App.jsx`
3. Restart dev server:
   ```bash
   # Press Ctrl+C to stop, then:
   npm run dev
   ```
4. Now you can:
   - ✅ Create/join rooms
   - ✅ Test multiplayer on two laptops
   - ✅ Test hardware integration

## Troubleshooting

### Port Already in Use
If port 5173 is busy, Vite will automatically use the next available port (5174, 5175, etc.).
Check the terminal output for the actual URL.

### "npm: command not found"
- Install Node.js from https://nodejs.org/
- Restart your terminal after installing

### "Cannot find module 'react'"
- Make sure you ran `npm install` first
- Delete `node_modules` folder and `package-lock.json`, then run `npm install` again

### Browser Shows Blank Page
- Check browser console (F12) for errors
- Make sure you're using the URL from the terminal (with `/game/` at the end)
- Try hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### Game Loads But Can't Connect Hardware
- Web Serial API only works in Chrome or Edge
- Make sure you click "Connect to Raspberry Pi Pico" button
- Pico must be connected via USB

## Stopping the Server

Press `Ctrl+C` in the terminal to stop the development server.

## Next Steps

- See `SETUP.md` for complete setup instructions
- See `HARDWARE.md` for hardware integration
- See `README.md` for full documentation









