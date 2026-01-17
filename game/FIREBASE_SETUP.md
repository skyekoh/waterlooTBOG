# Firebase Setup Guide - Step by Step

Complete instructions for setting up Firebase Realtime Database for the Beer Pong Heardle game.

---

## 📋 STEP 1: Create Firebase Project

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Sign in with your Google account

2. **Create New Project**
   - Click **"Add project"** or **"Create a project"**
   - Enter project name: `waterloo-tbog-game` (or any name you prefer)
   - Click **"Continue"**

3. **Google Analytics (Optional)**
   - You can enable or disable Google Analytics
   - For this game, it's optional - click **"Continue"** either way
   - If you enabled it, select an Analytics account or create one
   - Click **"Create project"**

4. **Wait for Project Creation**
   - Firebase will set up your project (takes ~30 seconds)
   - Click **"Continue"** when done

---

## 📋 STEP 2: Enable Realtime Database

1. **Navigate to Realtime Database**
   - In the left sidebar, click **"Build"** → **"Realtime Database"**
   - (NOT "Firestore Database" - make sure it says "Realtime Database")

2. **Create Database**
   - Click **"Create Database"** button

3. **Choose Location**
   - Select the region closest to you (e.g., `us-central1`, `europe-west1`)
   - Click **"Next"**

4. **Security Rules**
   - Choose **"Start in test mode"** (we'll secure it later)
   - This allows read/write access for now (fine for testing)
   - Click **"Enable"**

5. **Database Created!**
   - You should see your database URL, something like:
   - `https://waterloo-tbog-game-default-rtdb.firebaseio.com/`
   - **Copy this URL** - you'll need it later!

---

## 📋 STEP 3: Get Firebase Configuration

1. **Go to Project Settings**
   - Click the **gear icon** ⚙️ next to "Project Overview" in the left sidebar
   - Click **"Project settings"**

2. **Scroll to "Your apps" Section**
   - You'll see a section called "Your apps" with icons for different platforms
   - If you don't have a web app yet, you'll see a `</>` icon

3. **Add Web App**
   - Click the **`</>` (Web)** icon
   - Register app:
     - **App nickname**: `Beer Pong Heardle` (or any name)
     - **Firebase Hosting**: Leave unchecked (we're using GitHub Pages)
     - Click **"Register app"**

4. **Copy Firebase Config**
   - You'll see a code block with `firebaseConfig`
   - It looks like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyC...",
     authDomain: "waterloo-tbog-game.firebaseapp.com",
     databaseURL: "https://waterloo-tbog-game-default-rtdb.firebaseio.com",
     projectId: "waterloo-tbog-game",
     storageBucket: "waterloo-tbog-game.appspot.com",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:abc123def456"
   };
   ```
   - **Copy this entire config object** (you'll paste it in the next step)

---

## 📋 STEP 4: Add Config to Your Code

1. **Open the App.jsx file**
   - Navigate to: `waterlooTBOG/game/src/App.jsx`
   - Open it in your code editor

2. **Find the Firebase Config Section**
   - Look for this section (around lines 13-28):
   ```javascript
   // FIREBASE DISABLED FOR FRONTEND TESTING
   // Uncomment below and add your Firebase config when ready for multiplayer
   /*
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     databaseURL: "YOUR_DATABASE_URL",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   }
   const app = initializeApp(firebaseConfig)
   const database = getDatabase(app)
   */
   const database = null // Firebase disabled - using local demo mode
   const ENABLE_FIREBASE = false // Set to true when Firebase is configured
   ```

3. **Replace with Your Config**
   - **Uncomment** the code (remove `/*` and `*/`)
   - **Replace** the placeholder values with your actual Firebase config
   - **Change** `ENABLE_FIREBASE` to `true`
   - **Comment out or remove** the `const database = null` line

   **Final result should look like this:**
   ```javascript
   // Firebase configuration
   const firebaseConfig = {
     apiKey: "AIzaSyC...",  // ← Paste your actual API key
     authDomain: "waterloo-tbog-game.firebaseapp.com",  // ← Your auth domain
     databaseURL: "https://waterloo-tbog-game-default-rtdb.firebaseio.com",  // ← Your database URL (IMPORTANT!)
     projectId: "waterloo-tbog-game",  // ← Your project ID
     storageBucket: "waterloo-tbog-game.appspot.com",  // ← Your storage bucket
     messagingSenderId: "123456789012",  // ← Your sender ID
     appId: "1:123456789012:web:abc123def456"  // ← Your app ID
   }
   const app = initializeApp(firebaseConfig)
   const database = getDatabase(app)
   const ENABLE_FIREBASE = true // ← Changed to true!
   ```

4. **Uncomment Firebase Imports**
   - At the top of the file (around line 2-3), you should see:
   ```javascript
   // import { initializeApp } from 'firebase/app'
   // import { getDatabase, ref, onValue, set, push } from 'firebase/database'
   ```
   - **Uncomment these lines** (remove the `//`):
   ```javascript
   import { initializeApp } from 'firebase/app'
   import { getDatabase, ref, onValue, set, push } from 'firebase/database'
   ```

---

## 📋 STEP 5: Verify Setup

1. **Test Locally**
   ```bash
   cd waterlooTBOG/game
   npm run dev
   ```

2. **Check Browser Console**
   - Open browser DevTools (F12)
   - Go to Console tab
   - Look for any Firebase errors
   - Should see no errors if setup is correct

3. **Test Game**
   - Create a room as Game Master
   - Try joining as a player
   - Check if Firebase is connecting (no errors in console)

---

## 📋 STEP 6: Secure Your Database (Optional but Recommended)

1. **Go to Realtime Database Rules**
   - In Firebase Console, go to **"Realtime Database"**
   - Click **"Rules"** tab at the top

2. **Update Security Rules**
   - Replace the test mode rules with:
   ```json
   {
     "rules": {
       "rooms": {
         ".read": true,
         ".write": true
       },
       "leaderboard": {
         ".read": true,
         ".write": true
       }
     }
   }
   ```
   - Click **"Publish"**

   **Note**: These rules allow anyone to read/write. For production, you'd want to add authentication, but for a competition event, this is fine.

---

## ✅ Checklist

Before you're done, make sure:

- [ ] Firebase project created
- [ ] Realtime Database enabled (not Firestore)
- [ ] Database URL copied
- [ ] Web app registered in Firebase
- [ ] Firebase config copied from Firebase Console
- [ ] Config pasted into `src/App.jsx`
- [ ] Firebase imports uncommented
- [ ] `ENABLE_FIREBASE` set to `true`
- [ ] `database = null` line removed/commented out
- [ ] Tested locally - no console errors
- [ ] Game connects to Firebase successfully

---

## 🔧 Troubleshooting

### Error: "Cannot parse Firebase url"
- **Problem**: `databaseURL` is incorrect or missing
- **Fix**: Make sure you copied the full URL from Firebase Console (should end with `.firebaseio.com`)

### Error: "Permission denied"
- **Problem**: Database rules are too restrictive
- **Fix**: Go to Database → Rules, make sure test mode is enabled or rules allow read/write

### Error: "Firebase app not initialized"
- **Problem**: Imports not uncommented or config not set
- **Fix**: Check that `initializeApp` and `getDatabase` imports are uncommented

### No real-time sync between players
- **Problem**: `ENABLE_FIREBASE` is still `false`
- **Fix**: Change `ENABLE_FIREBASE = true` in `App.jsx`

---

## 📍 File Locations Summary

**Where to put Firebase config:**
- File: `waterlooTBOG/game/src/App.jsx`
- Lines: ~13-29 (replace the commented section)

**What to change:**
1. Uncomment Firebase imports (lines ~2-3)
2. Uncomment and fill in `firebaseConfig` object
3. Set `ENABLE_FIREBASE = true`
4. Remove/comment out `const database = null`

---

## 🎉 You're Done!

Once you've completed these steps, your game will:
- ✅ Sync game state between players in real-time
- ✅ Save leaderboard scores to Firebase
- ✅ Allow multiple players to join the same room
- ✅ Work across different laptops/browsers

Test it by opening the game on two different browsers and creating/joining a room!




