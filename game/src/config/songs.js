// Song library configuration
// Add your song files to: waterlooTBOG/game/public/songs/
// Update this array with your songs
// Each song has 6 snippets that play in order (1st cup hit = snippet 1, 2nd cup = snippet 2, etc.)

// Get base URL for proper asset paths
const BASE_URL = import.meta.env.BASE_URL || '/'

const snippetTemplate = [
  { start: 0, duration: 5 },
  { start: 5, duration: 5 },
  { start: 10, duration: 5 },
  { start: 15, duration: 5 },
  { start: 20, duration: 5 },
  { start: 25, duration: 5 }
]

export const songs = [
  {
    id: 1,
    title: "Party Rock Anthem",
    artist: "LMFAO",
    url: `${BASE_URL}songs/party-rock-anthem.mp3`,
    snippets: [...snippetTemplate]
  },
  {
    id: 2,
    title: "Dynamite",
    artist: "Taio Cruz",
    url: `${BASE_URL}songs/dynamite.mp3`,
    snippets: [...snippetTemplate]
  },
  {
    id: 3,
    title: "I Gotta Feeling",
    artist: "Black Eyed Peas",
    url: `${BASE_URL}songs/${encodeURIComponent('Black Eyed Peas - I Gotta Feeling.mp3')}`,
    snippets: [...snippetTemplate]
  },
  {
    id: 4,
    title: "Rock That Body",
    artist: "Black Eyed Peas",
    url: `${BASE_URL}songs/${encodeURIComponent('Black Eyed Peas - Rock That Body.mp3')}`,
    snippets: [...snippetTemplate]
  },
  {
    id: 5,
    title: "Like A G6",
    artist: "Far East Movement",
    url: `${BASE_URL}songs/${encodeURIComponent('Far East Movement, The Cataracs, DEV - Like A G6.mp3')}`,
    snippets: [...snippetTemplate]
  },
  {
    id: 6,
    title: "My House",
    artist: "Flo Rida",
    url: `${BASE_URL}songs/${encodeURIComponent('Flo Rida - My House.mp3')}`,
    snippets: [...snippetTemplate]
  },
  {
    id: 7,
    title: "Teenage Dream",
    artist: "Katy Perry",
    url: `${BASE_URL}songs/${encodeURIComponent('Katy Perry - Teenage Dream.mp3')}`,
    snippets: [...snippetTemplate]
  },
  {
    id: 8,
    title: "TiK ToK",
    artist: "Kesha",
    url: `${BASE_URL}songs/${encodeURIComponent('Kesha - TiK ToK.mp3')}`,
    snippets: [...snippetTemplate]
  },
  {
    id: 9,
    title: "Sexy And I Know It",
    artist: "LMFAO",
    url: `${BASE_URL}songs/${encodeURIComponent('LMFAO - Sexy And I Know It.mp3')}`,
    snippets: [...snippetTemplate]
  },
  {
    id: 10,
    title: "Sorry For Party Rocking",
    artist: "LMFAO",
    url: `${BASE_URL}songs/${encodeURIComponent('LMFAO - Sorry For Party Rocking.mp3')}`,
    snippets: [...snippetTemplate]
  },
  {
    id: 11,
    title: "Can't Hold Us",
    artist: "Macklemore & Ryan Lewis",
    url: `${BASE_URL}songs/${encodeURIComponent("Macklemore, Ryan Lewis, Macklemore & Ryan Lewis, Ray Dalton - Can't Hold Us (feat. Ray Dalton).mp3")}`,
    snippets: [...snippetTemplate]
  },
  {
    id: 12,
    title: "Eenie Meenie",
    artist: "Sean Kingston & Justin Bieber",
    url: `${BASE_URL}songs/${encodeURIComponent('Sean Kingston, Justin Bieber - Eenie Meenie.mp3')}`,
    snippets: [...snippetTemplate]
  },
  {
    id: 13,
    title: "Shut Up and Dance",
    artist: "WALK THE MOON",
    url: `${BASE_URL}songs/${encodeURIComponent('WALK THE MOON - Shut Up and Dance.mp3')}`,
    snippets: [...snippetTemplate]
  }
]

