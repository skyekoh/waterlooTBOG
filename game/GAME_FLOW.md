# Complete Game Flow Explanation

## 🎮 GAME OVERVIEW

**Beer Pong Heardle** is a 1v1 multiplayer music guessing game with physical hardware integration. Players shoot real balls into cups, and each cup sunk unlocks a snippet of a hidden song. The first player to correctly guess the song wins!

---

## 🏗️ SYSTEM ARCHITECTURE

### Three Roles:
1. **Game Master** - Controls the game, selects songs, monitors players
2. **Player 1** - Competes to guess the song first
3. **Player 2** - Competes to guess the song first

### Three Laptops:
- **Laptop 1**: Game Master (optional) or Player 1
- **Laptop 2**: Player 1 or Player 2
- **Laptop 3**: Player 2 (if Game Master is separate)

### Hardware Setup:
- **12 IR Sensors** (6 per player)
- **2 Raspberry Pi Picos** (one per player's cup setup)
- **USB connections** from Picos to laptops

---

## 📋 DETAILED GAME MECHANICS

### Setup Phase:
1. **Song Selection**: Game Master (or system) randomly selects a song from the library
2. **Room Creation**: Game Master creates a room and gets a Room ID
3. **Player Joining**: Players join using the Room ID
4. **Hardware Connection**: Each player connects their Pico via USB (Web Serial API)
5. **Game Initialization**: System sets up 12 cups (6 per player), all empty

### Game Rules:
- **6 cups per player** (12 total cups)
- **6 song snippets per song** (each snippet is 10-15 seconds)
- **Snippets play in order**: 1st cup = snippet 1, 2nd cup = snippet 2, etc.
- **Any cup hit** removes the first available cup (doesn't matter which specific cup)
- **Alternating turns**: Player 1 shoots, then Player 2, repeat
- **Guessing**: Players can guess after sinking at least one cup
- **Win condition**: First correct guess OR all 12 cups sunk (game ends)

### Cup Sinking Mechanics:
1. Player shoots a physical ball
2. Ball breaks IR sensor beam in any cup
3. Sensor sends signal to Pico
4. Pico processes signal and sends `{"player": 1}` or `{"player": 2}` via USB serial
5. Browser receives serial data
6. Game finds first unsunk cup for that player
7. Marks cup as sunk
8. Increments guess counter (Player now has 1 guess available)
9. Calculates which snippet to play (based on cups sunk count)
10. Plays appropriate song snippet automatically
11. Switches turn to other player

### Snippet System:
- **Snippet 1**: Plays when 1st cup is sunk (any cup)
- **Snippet 2**: Plays when 2nd cup is sunk
- **Snippet 3**: Plays when 3rd cup is sunk
- ...continues to Snippet 6

**Important**: The snippet number depends on HOW MANY cups are sunk, NOT which specific cup.

Example:
- Player 1 sinks cup #3 → Plays Snippet 1 (first cup sunk)
- Player 1 sinks cup #1 → Plays Snippet 2 (second cup sunk)
- Player 2 sinks cup #5 → Plays Snippet 1 (Player 2's first cup)

### Guessing System:
- Players can input song title or artist name
- Validation is case-insensitive and accepts partial matches
- Only enabled after player has sunk at least one cup
- Correct guess immediately ends game
- Incorrect guess allows player to keep trying

---

## 🎬 COMPLETE GAME SCENARIO

Let's walk through a full game from start to finish:

### **Setup Phase (Before Game Starts)**

**Game Master (Laptop 1):**
1. Opens game in browser (Chrome/Edge)
2. Clicks "Game Master" button
3. Control panel appears
4. Selects song: "Bohemian Rhapsody - Queen"
5. Gets Room ID: `gm_1736234567_abc123xyz`
6. Shares Room ID with players

**Player 1 (Laptop 2):**
1. Opens game in browser
2. Clicks "Join Room"
3. Enters Room ID: `gm_1736234567_abc123xyz`
4. Connects their Pico via USB
5. Clicks "Connect to Raspberry Pi Pico"
6. Selects COM port from browser popup
7. Status shows "Connected" - ready!

**Player 2 (Laptop 3):**
1. Opens game in browser
2. Clicks "Join Room"
3. Enters same Room ID: `gm_1736234567_abc123xyz`
4. Connects their Pico via USB
5. Clicks "Connect to Raspberry Pi Pico"
6. Selects COM port
7. Status shows "Connected" - ready!

**Game Master:**
- Sees both players show as "✅ Joined" in status panel
- Clicks "Start Game"
- Game begins!

---

### **Turn 1: Player 1 Shoots**

**Physical Action:**
- Player 1 physically shoots a ping pong ball toward their cups
- Ball breaks IR sensor beam on cup #4

**Hardware Flow:**
1. IR sensor detects beam break (sensor goes LOW)
2. Pico detects signal change on GPIO pin
3. Pico code checks: "Which player's sensor was triggered?" → Player 1
4. Pico sends via USB serial: `{"player": 1}` (or `"P1"` or `"1"`)

**Browser/Game Flow:**
1. Player 1's browser receives serial data
2. `HardwareController` component parses: `{"player": 1}`
3. Calls `handleCupSink(1)` in GameBoard
4. Game checks: Player 1 cups = `[false, false, false, false, false, false]`
5. Finds first unsunk cup (index 0)
6. Marks cup as sunk: `[true, false, false, false, false, false]`
7. Calculates: Cups sunk = 1 → Plays Snippet 1
8. Increments Player 1 guesses: `player1Guesses = 1`
9. Gets snippet from song config:
   ```javascript
   snippets[0] = { start: 0, duration: 10 }  // First 10 seconds of song
   ```
10. `AudioPlayer` component receives snippet info
11. Loads song: `/songs/bohemian_rhapsody.mp3`
12. Sets `audio.currentTime = 0` (start of song)
13. Plays audio for 10 seconds
14. Stops automatically after 10 seconds
15. Updates UI: Shows "You've heard snippet 1 of 6"
16. Switches turn: `currentPlayer = 2`

**Player 1's Screen:**
- Cup #1 (first cup) now shows as sunk (filled with gold)
- Audio plays: "Is this the real life? Is this just fantasy?" (first 10 seconds)
- Guess input becomes enabled (green border)
- Status shows: "Game is live! Shoot the ball whenever you're ready!"

**Player 2's Screen:**
- No audio plays (only Player 1 hears their snippets)
- Status shows: "Game is live! Shoot the ball whenever you're ready!"
- Game board shows Player 1 has 1 guess used
- Player 2 can shoot at any time (no turn restriction)

**Game Master's Screen:**
- Sees Player 1: "Cups Sunk: 1/6, Guesses: 1"
- Sees Player 2: "Cups Sunk: 0/6, Guesses: 0"
- Can see answer: "Queen - Bohemian Rhapsody"

---

### **Turn 2: Player 2 Shoots**

**Physical Action:**
- Player 2 shoots ball toward their cups
- Ball breaks IR sensor beam on cup #2

**Hardware Flow:**
1. Player 2's Pico detects sensor trigger
2. Pico sends: `{"player": 2}`

**Browser/Game Flow:**
1. Player 2's browser receives: `{"player": 2}`
2. Calls `handleCupSink(2)`
3. Marks Player 2's first cup as sunk
4. Plays Snippet 1 for Player 2 (their first snippet)
5. Player 2 guesses available: 1
6. Switches turn: `currentPlayer = 1`

**Player 2's Screen:**
- Audio plays: First 10 seconds of Bohemian Rhapsody
- Can now guess!

---

### **Turn 3: Player 1 Shoots Again**

**Physical Action:**
- Player 1 shoots, ball hits cup #1 (different cup than before)

**Game Flow:**
1. Cup #2 (second unsunk cup) gets marked as sunk
2. Player 1 cups: `[true, true, false, false, false, false]`
3. Cups sunk = 2 → Plays Snippet 2
4. Gets snippet: `snippets[1] = { start: 15, duration: 10 }`
5. Audio plays from 15 seconds: "Caught in a landslide, no escape from reality..."
6. Player 1 guesses now: 2 available

**Player 1's Screen:**
- Two cups now sunk
- Audio plays new snippet (15-25 seconds of song)
- Message: "You've heard snippet 2 of 6"

---

### **Player 1 Attempts a Guess**

**Action:**
- Player 1 types into guess input: "Bohemian Rhapsody"

**Game Flow:**
1. `GuessInput` component receives input
2. Normalizes: "bohemianrhapsody" (lowercase, no spaces)
3. Normalizes song title: "bohemianrhapsody"
4. Compares: Match! ✅
5. Calls `handleCorrectGuess(1)`
6. Sets `gameStatus = 'won'`
7. Sets `winner = 1`
8. Displays winner banner: "Player 1 Wins! 🎉"
9. Shows answer: "Correct song: Queen - Bohemian Rhapsody"
10. After 5 seconds, returns to lobby

**All Screens:**
- Winner banner appears
- Game ends
- Leaderboard updates (if Firebase enabled)

---

## 🔄 ALTERNATIVE SCENARIO: Player Sinks All Cups

What if a player sinks all 6 of their cups before guessing correctly?

### **Game Progression:**
- Player 1 sinks 4 cups, Player 2 sinks 3 cups
- Player 1 sinks their 5th cup → Now has 5/6 cups sunk
- Player 1 sinks their 6th cup → **PLAYER 1 WINS!**

**Game Flow:**
1. When Player 1 sinks their 6th cup:
   - `player1Cups = [true, true, true, true, true, true]` (all 6 sunk)
   - `player2Cups = [true, true, true, false, false, false]` (only 3 sunk)
2. `checkGameFinished()` function detects Player 1 has all cups sunk
3. Sets `gameStatus = 'won'`
4. Sets `winner = 1`
5. Displays: "Player 1 Wins! 🎉"
6. Shows answer: "Correct song: [Song Name]"
7. Player 1 has heard all 6 snippets but didn't need to guess
8. Returns to lobby after 5 seconds
9. Leaderboard updated with Player 1's score

**Key Point**: The first player to sink all 6 cups wins immediately - they don't need to guess the song!

---

## 📊 REAL-TIME STATE SYNCHRONIZATION

### With Firebase (Multiplayer):
- All game state stored in Firebase Realtime Database
- When Player 1 sinks a cup → Firebase updates
- Player 2's browser listens to Firebase → Updates automatically
- Both players see the same game state in real-time

### Without Firebase (Demo Mode):
- Each laptop has independent game state
- No synchronization between players
- Good for testing single-player functionality

---

## 🎯 KEY DATA STRUCTURES

### Game State (in Firebase/Demo):
```javascript
{
  gameId: "gm_1736234567_abc123xyz",
  currentSongIndex: 0,  // Which song from library
  player1Cups: [true, true, false, false, false, false],
  player2Cups: [true, false, false, false, false, false],
  player1Guesses: 2,
  player2Guesses: 1,
  currentPlayer: 1,  // Whose turn (1 or 2)
  gameStatus: "playing",  // "playing" | "won" | "finished"
  winner: null,  // 1 or 2 if won
  lastSunkCup: {
    player: 1,
    cupIndex: 1,
    snippetNumber: 2,
    timestamp: 1736234598000
  }
}
```

### Song Structure:
```javascript
{
  id: 1,
  title: "Bohemian Rhapsody",
  artist: "Queen",
  url: "/songs/bohemian_rhapsody.mp3",
  snippets: [
    { start: 0, duration: 10 },    // Snippet 1: 0-10 seconds
    { start: 15, duration: 10 },   // Snippet 2: 15-25 seconds
    { start: 30, duration: 10 },   // Snippet 3: 30-40 seconds
    { start: 45, duration: 10 },   // Snippet 4: 45-55 seconds
    { start: 60, duration: 10 },   // Snippet 5: 60-70 seconds
    { start: 75, duration: 10 }    // Snippet 6: 75-85 seconds
  ]
}
```

---

## 🔌 HARDWARE SIGNAL FLOW

```
Physical Ball
    ↓
IR Sensor (detects beam break)
    ↓
GPIO Pin on Pico (signal change: HIGH → LOW)
    ↓
Pico Firmware (detects which player's sensor)
    ↓
USB Serial Output: {"player": 1}
    ↓
Browser Web Serial API (reads data)
    ↓
HardwareController Component (parses data)
    ↓
GameBoard.handleCupSink(1) (game logic)
    ↓
Cup marked as sunk → Snippet plays → Turn switches
```

---

## 🎵 SNIPPET PLAYBACK DETAILS

### How Snippets Work:
1. **Song file**: One MP3 file per song (e.g., `/songs/bohemian_rhapsody.mp3`)
2. **Snippet configuration**: Defines start time and duration for each of 6 snippets
3. **Dynamic playback**: When cup is sunk, AudioPlayer:
   - Loads the full song file
   - Sets `audio.currentTime = snippet.start`
   - Plays for `snippet.duration` seconds
   - Automatically stops after duration

### Example Snippet Playback:
- **Snippet 1**: Start at 0s, play for 10s → Plays 0-10 seconds
- **Snippet 2**: Start at 15s, play for 10s → Plays 15-25 seconds
- **Snippet 3**: Start at 30s, play for 10s → Plays 30-40 seconds

**Note**: There's a 5-second gap between snippet 1 and 2 (10-15 seconds). This is intentional - each snippet reveals a different part of the song.

---

## 🏆 WIN CONDITIONS

### Condition 1: Correct Guess (Winner)
- Any player guesses song correctly
- Game immediately ends
- Winner is declared
- Answer is revealed to all players
- Leaderboard updated (if enabled)

### Condition 2: All Cups Sunk (Winner)
- **If one player sinks all 6 of their cups** → That player wins immediately!
- Game immediately ends when 6th cup is sunk
- Winner is declared (the player who completed all cups)
- Answer is revealed
- Leaderboard updated (if enabled)
- **Important**: First player to sink all 6 cups wins, even if other player hasn't finished

---

## 💡 STRATEGY ELEMENTS

### For Players:
- **Timing**: Guess early with fewer snippets (harder but faster)
- **Cup management**: Don't waste shots - each cup unlocks valuable audio
- **Listening**: Pay attention to each snippet - they reveal different parts

### For Game Master:
- **Song selection**: Choose appropriate difficulty level
- **Monitoring**: Watch player progress, intervene if needed
- **Control**: Can end game early if needed

---

This is the complete game flow! The system integrates physical hardware, real-time synchronization, audio playback, and competitive gameplay into one cohesive experience.

