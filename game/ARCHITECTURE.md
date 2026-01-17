# Complete Game Architecture & File Reference

## 🎮 GAME OVERVIEW

**Beer Pong Heardle** - A 1v1 multiplayer game where players physically shoot balls into cups (via IR sensors + Raspberry Pi Pico). Each cup sunk unlocks the next snippet of a song in sequence. First player to guess the song correctly wins!

### Game Flow:
1. Players connect hardware (Pico via USB)
2. Player 1 creates room, Player 2 joins
3. Players take turns shooting balls
4. IR sensors detect ball → Pico sends signal → Browser sinks cup
5. Song snippet plays automatically (1st cup = snippet 1, 2nd cup = snippet 2, etc.)
6. Players can guess the song after sinking at least one cup
7. First correct guess wins!

---

## 📁 COMPLETE FILE STRUCTURE

```
game/
├── public/                          # Static assets (served directly)
│   ├── icon.png                     # UWTBOG logo
│   └── songs/                       # MP3 song files go here
│       └── .gitkeep
│
├── src/                             # React source code
│   ├── components/                  # React components
│   │   ├── App.jsx                  # Main app component
│   │   ├── GameBoard.jsx            # Game play area & logic
│   │   ├── Lobby.jsx                # Room creation/joining UI
│   │   ├── Cup.jsx                  # Individual cup component
│   │   ├── Ball.jsx                 # Ball component (deprecated - not used)
│   │   ├── AudioPlayer.jsx          # Plays song snippets
│   │   ├── GuessInput.jsx           # Song guessing interface
│   │   ├── HardwareController.jsx   # Pico serial communication
│   │   ├── Leaderboard.jsx          # High scores display
│   │   ├── App.css                  # Main app styles
│   │   ├── GameBoard.css            # Game board styles
│   │   ├── Lobby.css                # Lobby styles
│   │   ├── Cup.css                  # Cup animation styles
│   │   ├── Ball.css                 # Ball styles (deprecated)
│   │   ├── AudioPlayer.css          # Audio player styles
│   │   ├── GuessInput.css           # Guess input styles
│   │   ├── HardwareController.css   # Hardware controller styles
│   │   └── Leaderboard.css          # Leaderboard styles
│   │
│   ├── config/
│   │   └── songs.js                 # Song library configuration
│   │
│   ├── App.jsx                      # Root component (entry point)
│   ├── App.css                      # Global app styles
│   ├── main.jsx                     # React DOM mounting point
│   └── index.css                    # Global CSS variables & resets
│
├── .github/
│   └── workflows/
│       └── deploy-game.yml          # GitHub Actions auto-deploy
│
├── index.html                       # HTML entry point
├── package.json                     # Dependencies & scripts
├── vite.config.js                   # Vite build configuration
├── .gitignore                       # Git ignore rules
│
└── Documentation:
    ├── README.md                    # Main documentation
    ├── SETUP.md                     # Setup instructions
    ├── QUICKSTART.md                # Quick start guide
    ├── HARDWARE.md                  # Hardware integration guide
    └── NAVIGATION.md                # Adding game to main site
```

---

## 📄 DETAILED FILE DESCRIPTIONS

### 🎯 CONFIGURATION FILES

#### `package.json`
**Purpose**: Node.js project configuration
- **Dependencies**: React, Firebase, Vite
- **Scripts**:
  - `npm run dev` - Start development server
  - `npm run build` - Build for production
  - `npm run preview` - Preview production build

#### `vite.config.js`
**Purpose**: Vite build tool configuration
- Sets base path to `/game/` for GitHub Pages
- Configures React plugin
- Sets server port (5173)

#### `.gitignore`
**Purpose**: Excludes files from Git
- `node_modules/`, `dist/`, `.env` files, IDE configs

---

### 🌐 ENTRY POINTS

#### `index.html`
**Purpose**: HTML entry point
- Loads React app into `<div id="root">`
- Includes fonts (Inter from Google Fonts)
- Sets favicon
- Links to `main.jsx`

#### `src/main.jsx`
**Purpose**: React application entry point
- Mounts React app to DOM
- Imports global CSS
- Wraps app in React.StrictMode

---

### 🎨 STYLES

#### `src/index.css`
**Purpose**: Global CSS variables and base styles
- Defines Waterloo TBOG color scheme:
  - `--waterloo-gold`: #FFD100
  - `--waterloo-black`: #000000
  - `--waterloo-white`: #ffffff
- Global resets, scrollbar styling
- Base body/root styles

#### `src/App.css`
**Purpose**: Main app layout styles
- App container layout
- Header styling (logo, title, navigation)
- Main content area
- Leaderboard sidebar positioning
- Responsive breakpoints

---

### 🧩 CORE COMPONENTS

#### `src/App.jsx`
**Purpose**: Root component, application state management
**Key Features**:
- Manages game state (lobby/playing/finished)
- Handles room creation/joining (Firebase or demo mode)
- Renders: Header, Lobby, GameBoard, Leaderboard
- Player ID generation/storage
- Firebase initialization (currently disabled for frontend testing)

**State**:
- `gameState`: 'lobby' | 'playing' | 'finished'
- `playerId`: Unique player identifier
- `gameId`: Current game room ID
- `roomId`: Room ID for joining

#### `src/components/Lobby.jsx`
**Purpose**: Room creation and joining interface
**Features**:
- "Create Room" button
- "Join Room" button with room ID input
- Displays room ID after creation
- Instructions on how to play
- Player ID display

**Props**:
- `playerId`: Current player's ID
- `onCreateRoom`: Function to create new room
- `onJoinRoom`: Function to join existing room
- `roomId`: Current room ID (if created)

#### `src/components/GameBoard.jsx`
**Purpose**: Main game play area and logic
**Features**:
- Manages game state (cups, guesses, current player)
- Displays 12 cups (6 per player, top/bottom rows)
- Integrates HardwareController
- Handles cup sinking from hardware signals
- Manages song snippet playback
- Guess input integration
- Win/loss detection

**State**:
- `player1Cups`: Array of 6 booleans (sunk status)
- `player2Cups`: Array of 6 booleans (sunk status)
- `player1Guesses`: Number of guesses used
- `player2Guesses`: Number of guesses used
- `currentPlayer`: 1 or 2 (whose turn)
- `currentSongIndex`: Which song from library
- `gameStatus`: 'playing' | 'won' | 'finished'
- `lastSunkCup`: Info about last cup sunk
- `winner`: Winning player number

**Key Functions**:
- `handleCupSink(player)`: Processes hardware signal, removes cup, plays snippet
- `handleCorrectGuess(player)`: Handles win condition
- `checkGameFinished()`: Checks if all cups sunk
- `getSnippetForPlayer(player)`: Returns correct snippet based on cups sunk

#### `src/components/Cup.jsx`
**Purpose**: Individual cup visual component
**Features**:
- Renders cup with rim, body, base
- Shows "water" (gold) when sunk
- Animations for sinking
- Hover effects

**Props**:
- `sunk`: Boolean - is cup sunk?
- `player`: 1 or 2
- `cupIndex`: 0-5 (which cup)
- `onClick`: Click handler (not used in hardware mode)
- `interactive`: Boolean - is clickable

#### `src/components/AudioPlayer.jsx`
**Purpose**: Plays song snippets automatically
**Features**:
- Plays audio when cup is sunk
- Plays correct snippet based on sequence (1-6)
- Auto-stops after snippet duration
- Visual feedback when playing

**Props**:
- `songUrl`: Path to MP3 file
- `snippet`: Object with `start` and `duration`
- `enabled`: Boolean - should play for this player?
- `trigger`: Unique ID to trigger replay on new cup

**How it works**:
- When `trigger` changes (new cup sunk), resets and plays
- Sets `audio.currentTime` to snippet start
- Plays for `snippet.duration` seconds
- Only plays once per trigger

#### `src/components/GuessInput.jsx`
**Purpose**: Song guessing interface
**Features**:
- Text input for song/artist name
- Submit button
- Validation against song title/artist
- Correct/incorrect feedback
- Case-insensitive matching
- Disabled until player has sunk at least one cup

**Props**:
- `song`: Song object from library
- `onSubmit`: Callback with correct/incorrect
- `enabled`: Boolean - can player guess?

**Validation Logic**:
- Normalizes strings (lowercase, removes special chars)
- Matches against title, artist, or both
- Partial matches accepted

#### `src/components/HardwareController.jsx`
**Purpose**: Connects to Raspberry Pi Pico via Web Serial API
**Features**:
- "Connect to Raspberry Pi Pico" button
- Serial port selection
- Reads data from Pico
- Parses player number from signals
- Status indicators (connected/disconnected)
- Error handling

**Expected Pico Data Format**:
- JSON: `{"player": 1}`
- Simple: `"P1"` or `"1"`
- Player: 1 or 2

**Props**:
- `onCupSink`: Callback with player number
- `playerNumber`: Current player (1 or 2)

**How it works**:
1. User clicks "Connect" → Browser requests serial port
2. User selects Pico's COM port
3. Opens serial connection (9600 baud)
4. Reads incoming data
5. Parses player number
6. Calls `onCupSink(player)` to trigger cup sink

#### `src/components/Leaderboard.jsx`
**Purpose**: Displays top scores
**Features**:
- Shows top 10 scores (least guesses)
- Displays guess count and timestamp
- Empty state when no scores
- Loading state
- Firebase integration (currently disabled)

**Props**:
- `database`: Firebase database reference

**Data Structure** (Firebase):
```
leaderboard/
  {scoreId}/
    playerId: string
    gameId: string
    songIndex: number
    guesses: number
    timestamp: number
```

#### `src/components/Ball.jsx` (DEPRECATED)
**Purpose**: Ball component for click-to-shoot (not used)
**Status**: Currently unused - hardware handles ball detection

---

### 🎵 CONFIGURATION

#### `src/config/songs.js`
**Purpose**: Song library configuration
**Structure**:
```javascript
{
  id: number,
  title: string,
  artist: string,
  url: string,              // Path to MP3 file
  snippets: [               // Array of 6 snippets
    { start: number,        // Start time in seconds
      duration: number },   // Duration in seconds
    // ... 5 more snippets
  ]
}
```

**Example**:
- Snippet 1: Plays when 1st cup is sunk
- Snippet 2: Plays when 2nd cup is sunk
- ...up to Snippet 6

**To Add Songs**:
1. Add MP3 file to `public/songs/`
2. Add entry to `songs` array
3. Define 6 snippet start times/durations

---

### 🎨 STYLESHEETS (Component-Specific)

#### `src/components/App.css`
- Header layout and styling
- Main content area
- Footer/leaderboard sidebar
- Responsive breakpoints

#### `src/components/GameBoard.css`
- Game area layout
- Player info panels
- Cup rows (top/bottom)
- Winner banner
- Turn indicator

#### `src/components/Lobby.css`
- Lobby card styling
- Room creation/join buttons
- Room ID display
- Instructions panel

#### `src/components/Cup.css`
- Cup 3D appearance
- Rim, body, base styling
- "Water" fill animation
- Hover effects
- Responsive sizing

#### `src/components/AudioPlayer.css`
- Audio status indicators
- Playback feedback

#### `src/components/GuessInput.css`
- Input field styling
- Submit button
- Correct/incorrect states
- Animations

#### `src/components/HardwareController.css`
- Connection status indicators
- Connect/disconnect buttons
- Status messages
- Format documentation panel

#### `src/components/Leaderboard.css`
- Score list styling
- Rank numbers
- Score display
- Hover effects

---

### 🔧 BUILD & DEPLOYMENT

#### `.github/workflows/deploy-game.yml`
**Purpose**: GitHub Actions workflow for auto-deployment
**Triggers**: Push to main branch (when files in `game/` change)
**Steps**:
1. Checkout code
2. Setup Node.js
3. Install dependencies
4. Build game (`npm run build`)
5. Deploy to GitHub Pages

#### `public/`
**Purpose**: Static assets served directly
- Files here are copied to root during build
- Accessible via `/filename` or `/game/filename`
- Contains: `icon.png`, `songs/` folder

---

## 🔄 DATA FLOW

### Hardware → Game:
1. Ball breaks IR sensor beam
2. Pico detects signal
3. Pico sends `{"player": 1}` via USB serial
4. Browser (HardwareController) reads serial data
5. `handleCupSink(1)` called in GameBoard
6. Cup marked as sunk (first available cup)
7. Snippet number calculated (cups sunk count)
8. AudioPlayer plays correct snippet
9. Guess counter incremented
10. Turn switches to other player

### Firebase Sync (when enabled):
1. Game state changes in one browser
2. Firebase Realtime Database updated
3. Other browser's listener detects change
4. Local state updates automatically
5. UI re-renders with new state

### Game State (Demo Mode):
- All state stored locally in React state
- No synchronization between browsers
- Works for single-player testing

---

## 🎯 KEY CONCEPTS

### Snippet Sequence:
- **NOT** based on which specific cup was hit
- Based on **how many cups** have been sunk
- 1st cup sunk → plays snippet 1
- 2nd cup sunk → plays snippet 2
- ...up to snippet 6

### Cup Removal:
- Any cup hit removes the **first available cup**
- Cups removed in order (0, 1, 2, 3, 4, 5)
- No strategy in cup selection

### Turn System:
- Alternates between players
- Player 1 shoots → Player 2 shoots → repeat
- Continues until song guessed or all cups sunk

### Win Conditions:
1. **Correct Guess**: First player to guess song wins
2. **All Cups Sunk**: Game ends if all 12 cups sunk (no winner)

---

## 🔌 HARDWARE INTEGRATION

### Components:
- **IR Sensors**: Detect ball passing through (12 total - 6 per player)
- **Raspberry Pi Pico**: Processes sensor signals
- **USB Serial**: Communication to laptop browser

### Communication Protocol:
- **Baud Rate**: 9600
- **Format**: JSON or simple string
- **Data**: Player number only (1 or 2)
- **Browser**: Web Serial API (Chrome/Edge only)

### Signal Flow:
```
Sensor → Pico GPIO → Pico Code → USB Serial → Browser → Game
```

---

## 📦 DEPENDENCIES

### Production:
- **react**: UI framework
- **react-dom**: React DOM rendering
- **firebase**: Real-time database (disabled for testing)

### Development:
- **vite**: Build tool & dev server
- **@vitejs/plugin-react**: React support for Vite

---

## 🚀 DEPLOYMENT

### Development:
```bash
npm run dev
# Opens http://localhost:5173/game/
```

### Production Build:
```bash
npm run build
# Creates dist/ folder with static files
```

### Deployment Options:
1. **GitHub Pages**: Copy `dist/` contents to `game/` folder
2. **Auto-deploy**: Use GitHub Actions workflow
3. **Custom Hosting**: Upload `dist/` contents to web server

---

## 📝 CONFIGURATION CHECKLIST

Before running:
- [ ] Install dependencies: `npm install`
- [ ] Add songs to `public/songs/`
- [ ] Update `src/config/songs.js`
- [ ] (Optional) Setup Firebase in `src/App.jsx`
- [ ] (Optional) Connect Pico hardware

---

This is the complete architecture of the Beer Pong Heardle game!







