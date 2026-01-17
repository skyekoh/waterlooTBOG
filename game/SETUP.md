# Quick Setup Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
cd game
npm install
```

### Step 2: Set Up Firebase (FREE)

1. Go to https://console.firebase.google.com/
2. Click **"Add Project"**
3. Name it (e.g., "waterloo-tbog-game")
4. Enable **Realtime Database**:
   - Click "Realtime Database" in left sidebar
   - Click "Create Database"
   - Choose **"Start in test mode"** (we'll secure it later)
   - Pick closest location
   - Click "Done"

5. Get your config:
   - Click the gear icon ⚙️ → Project Settings
   - Scroll to "Your apps" section
   - Click the web icon `</>`
   - Register app (name it "Game")
   - Copy the `firebaseConfig` object

6. Paste config in `src/App.jsx` (replace the placeholder):
   ```javascript
   const firebaseConfig = {
     apiKey: "paste-your-key-here",
     authDomain: "your-project.firebaseapp.com",
     databaseURL: "https://your-project-default-rtdb.firebaseio.com/", // Important!
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   }
   ```

### Step 3: Add Songs

1. Add MP3 files to `public/songs/` folder
2. Edit `src/config/songs.js`:
   ```javascript
   {
     id: 1,
     title: "Your Song Title",
     artist: "Artist Name",
     url: "/songs/yourfile.mp3",
     snippetStart: 30,  // Start at 30 seconds
     snippetDuration: 15 // Play for 15 seconds
   }
   ```

### Step 4: Test Locally

```bash
npm run dev
```

Open the URL shown (usually `http://localhost:5173/game/`)

### Step 5: Set Up Hardware (Optional but Recommended)

1. Connect Raspberry Pi Pico to laptop via USB
2. Upload Pico code (see `HARDWARE.md` for example code)
3. Wire up IR sensors to Pico (12 sensors total - 6 per player)
4. In game, click "Connect to Raspberry Pi Pico" button
5. Select your Pico's COM port when prompted

**Note**: Hardware setup is optional - you can test the game without it first!

### Step 6: Build & Deploy

```bash
npm run build
```

Copy contents of `dist/` folder to your main website's `game/` directory, OR set up the GitHub Actions workflow (see main README.md).

## 🎮 Testing with 2 Laptops

1. Both laptops open the game URL
2. Laptop 1: Click "Create Room" → Share Room ID
3. Laptop 2: Click "Join Room" → Enter Room ID
4. Game starts automatically when both players join!

## ✅ Checklist

- [ ] Firebase project created
- [ ] Realtime Database enabled
- [ ] Firebase config added to `App.jsx`
- [ ] At least 3 songs added to `songs.js`
- [ ] MP3 files in `public/songs/` folder
- [ ] Game tested locally
- [ ] (Optional) Raspberry Pi Pico connected and tested
- [ ] (Optional) IR sensors wired and calibrated
- [ ] Built and deployed to GitHub Pages

## 🐛 Common Issues

**"Firebase: Error (auth/configuration-not-found)"**
→ Check your firebaseConfig in `App.jsx` is correct

**"Songs not playing"**
→ Check file paths in `songs.js` match actual files in `public/songs/`
→ Check browser console for errors (F12)

**"Game not syncing between laptops"**
→ Make sure both are using same Firebase project
→ Check database URL is correct

**"Cannot find module 'react'"**
→ Run `npm install` in the `game/` folder

---

Need help? Check the main README.md for more details!

