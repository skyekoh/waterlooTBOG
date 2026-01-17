// Song library configuration
// Add your song files to: waterlooTBOG/game/public/songs/
// Update this array with your songs
// Each song has 6 snippets that play in order (1st cup hit = snippet 1, 2nd cup = snippet 2, etc.)

// Get base URL for proper asset paths
const BASE_URL = import.meta.env.BASE_URL || '/'

export const songs = [
  {
    id: 1,
    title: "Party Rock Anthem",
    artist: "LMFAO, Lauren Bennett, GoonRock",
    url: `${BASE_URL}songs/party-rock-anthem.mp3`,
    snippets: [
      { start: 0, duration: 5 },    // Snippet 1 (plays when 1st cup is hit): 0-5 seconds
      { start: 5, duration: 5 },    // Snippet 2 (plays when 2nd cup is hit): 5-10 seconds
      { start: 10, duration: 5 },   // Snippet 3 (plays when 3rd cup is hit): 10-15 seconds
      { start: 15, duration: 5 },   // Snippet 4 (plays when 4th cup is hit): 15-20 seconds
      { start: 20, duration: 5 },   // Snippet 5 (plays when 5th cup is hit): 20-25 seconds
      { start: 25, duration: 5 }    // Snippet 6 (plays when 6th cup is hit): 25-30 seconds
    ]
  },
  {
    id: 2,
    title: "Dynamite",
    artist: "Taio Cruz",
    url: `${BASE_URL}songs/dynamite.mp3`,
    snippets: [
      { start: 0, duration: 5 },    // Snippet 1 (plays when 1st cup is hit): 0-5 seconds
      { start: 5, duration: 5 },    // Snippet 2 (plays when 2nd cup is hit): 5-10 seconds
      { start: 10, duration: 5 },   // Snippet 3 (plays when 3rd cup is hit): 10-15 seconds
      { start: 15, duration: 5 },   // Snippet 4 (plays when 4th cup is hit): 15-20 seconds
      { start: 20, duration: 5 },   // Snippet 5 (plays when 5th cup is hit): 20-25 seconds
      { start: 25, duration: 5 }    // Snippet 6 (plays when 6th cup is hit): 25-30 seconds
    ]
  }
  // Add more songs here...
  // {
  //   id: 3,
  //   title: "Your Song Title",
  //   artist: "Artist Name",
  //   url: "/songs/yoursong.mp3",
  //   snippets: [
  //     { start: 0, duration: 5 },     // Snippet 1: 0-5 seconds
  //     { start: 5, duration: 5 },     // Snippet 2: 5-10 seconds
  //     { start: 10, duration: 5 },    // Snippet 3: 10-15 seconds
  //     { start: 15, duration: 5 },    // Snippet 4: 15-20 seconds
  //     { start: 20, duration: 5 },    // Snippet 5: 20-25 seconds
  //     { start: 25, duration: 5 }     // Snippet 6: 25-30 seconds
  //   ]
  // }
]

