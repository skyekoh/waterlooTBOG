# Beer Pong Heardle Game - UWTBOG

A 1v1 beer pong style Heardle game for the University of Waterloo Concrete Toboggan Team competition.

## 🎮 How It Works

- **2 Players**: Each player has 6 cups (12 total)
- **Physical Hardware**: IR sensors detect when balls sink into cups
- **Raspberry Pi Pico**: Processes sensor signals and sends to laptop via USB
- **Shoot to Unlock**: Sink a cup to unlock a song snippet guess
- **Win Condition**: First player to guess the song correctly wins
- **Leaderboard**: Tracks best scores (least guesses)

### Hardware Integration
The game uses **Web Serial API** to communicate with a Raspberry Pi Pico that's connected to IR sensors. When a ball breaks the IR beam, the Pico sends a signal to the browser, which automatically sinks the cup and plays the song snippet.

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
cd game
npm install
```

### 2. Firebase Setup (FREE)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project" or select existing project
3. Enable **Realtime Database** (not Firestore)
   - Go to Build → Realtime Database
   - Click "Create Database"
   - Start in **test mode** (for now - you can secure it later)
   - Choose a location (closest to you)
4. Get your Firebase config:
   - Go to Project Settings (gear icon)
   - Scroll down to "Your apps"
   - Click "Web" icon (`</>`) if you don't have a web app yet
   - Copy the `firebaseConfig` object

5. Update `src/App.jsx`:
   - Replace the placeholder config with your actual Firebase config:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     databaseURL: "YOUR_DATABASE_URL", // Important: Realtime Database URL
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   }
   ```

### 3. Add Songs

1. Create a `public/songs/` folder:
   ```bash
   mkdir -p public/songs
   ```

2. Add your MP3 files to `public/songs/`

3. Update `src/config/songs.js` with your songs:
   ```javascript
   {
     id: 1,
     title: "Song Title",
     artist: "Artist Name",
     url: "/songs/yourfile.mp3", // Path from public folder
     snippetStart: 30, // Start time in seconds
     snippetDuration: 15 // Duration in seconds
   }
   ```

### 4. Development

```bash
npm run dev
```

Visit `http://localhost:5173/game/` (or the port shown)

### 5. Build for Production

```bash
npm run build
```

This creates a `dist/` folder with all the built files.

### 6. Deploy to GitHub Pages

#### Option A: Deploy to `/game` subdirectory (Recommended)

1. After building, copy contents of `dist/` to `../game/` (one level up from your repo root)
2. OR set up GitHub Actions to auto-build and deploy

#### Option B: Manual Deployment

1. Build the app: `npm run build`
2. Copy all files from `game/dist/` to `waterlooTBOG/game/`
3. Commit and push to GitHub
4. Your game will be available at `https://yourusername.github.io/waterlooTBOG/game/`

#### Option C: GitHub Actions (Automatic)

Create `.github/workflows/deploy-game.yml`:

```yaml
name: Deploy Game

on:
  push:
    branches: [ main ]
    paths:
      - 'game/**'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install and build
        run: |
          cd game
          npm install
          npm run build
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./game/dist
          destination_dir: ./game
```

## 🎯 Game Flow

1. **Hardware Setup**: Connect Raspberry Pi Pico to laptop via USB
2. **Connect Hardware**: Click "Connect to Raspberry Pi Pico" in game
3. **Lobby**: Player 1 creates a room, Player 2 joins with Room ID
4. **Game**: Players physically shoot balls - IR sensors detect when cups are hit
5. **Snippet Play**: When a cup is sunk (sensor triggered), a song snippet plays automatically
6. **Guessing**: Players can guess the song (only after sinking at least one cup)
7. **Victory**: First correct guess wins!

## 🎨 Customization

- Colors: Edit CSS variables in `src/index.css` (Waterloo Gold theme)
- Songs: Update `src/config/songs.js`
- Game rules: Modify components in `src/components/`

## 📝 Notes

- **Free Firebase Tier**: Should be plenty for your competition
- **Songs**: Store MP3 files in `public/songs/` (committed to repo)
- **Browser Support**: 
  - **Chrome/Edge**: Full support (including hardware via Web Serial API) ✅
  - **Firefox/Safari**: Game works but no hardware connection ❌
- **Hardware**: Requires Raspberry Pi Pico with IR sensors (see `HARDWARE.md`)
- **Mobile**: Game works but optimized for laptop/desktop displays

## 🐛 Troubleshooting

- **Firebase not connecting**: Check your config in `App.jsx`
- **Songs not playing**: Check file paths in `songs.js` match your files
- **Game not syncing**: Ensure both players are using the same Firebase project

## 🔌 Hardware Setup

See **`HARDWARE.md`** for complete hardware integration guide, including:
- Pico code examples (MicroPython)
- Sensor wiring diagrams
- Serial communication setup
- Troubleshooting tips

## 📧 Support

For issues, check:
- Firebase console for database errors
- Browser console (F12) for JavaScript errors
- Network tab for failed requests
- `HARDWARE.md` for hardware-specific issues

---

Made for UWTBOG Competition 🎉🏔️

