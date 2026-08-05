const fs = require('fs');
const path = require('path');

console.log('Script started');

const envPath = path.join(__dirname, '..', '..', '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  });
}

const openRouterKey = process.env.OPENROUTER_API_KEY;

const targetLang = "English";
const roomSlug = "default-electronic";
const recentTracks = []; // Empty recent tracks

const prompt = `You are a Google RAG Agent. A user is currently listening to these 3 recent songs:
${recentTracks.length > 0 
  ? recentTracks.map((t, i) => `${i+1}. "${t.name}" by ${t.artist} (Album: ${t.album})`).join("\n") 
  : "No recent track history available."}

Primary Language: "${targetLang}"

Identify the song genres and languages of these 3 recent songs. Based ONLY on the name, artist, album, genre, and language of these 3 songs, simulate retrieving 3 distinct, highly curated thematic playlists from Google/Spotify.
Do NOT match or blend the results with any room's aesthetic theme or vibe. The playlists must be generated purely from the characteristics of these 3 source tracks.
Each of the 3 playlists must represent a different music sub-genre or listening style corresponding to the source tracks' vibes.

Format your output STRICTLY as a raw JSON object matching the TypeScript shape below. DO NOT wrap in markdown \`\`\`json blocks. Do not add comments or extra text.

Shape:
{
  "playlists": [
    {
      "title": "A descriptive, stylish playlist title (e.g. 'Tamil Indie Pop Hits' or 'Soothing Acoustic Melodies')",
      "description": "Short explanation of the vibe of this playlist.",
      "tracks": [
        {
          "id": "uniquely_generated_id_string_1",
          "name": "Actual, real popular track name in the matching genre/language",
          "artist": "Real artist name",
          "album": "Real album name",
          "durationMs": 180000
        }
      ]
    }
  ]
}`;

async function testRag() {
  console.log('testRag function called');
  try {
    console.log('Sending fetch request...');
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openRouterKey}`,
        "HTTP-Referer": "https://spotiglory.vercel.app",
        "X-Title": "SpotiGlory Test"
      },
      body: JSON.stringify({
        model: "openrouter/free",
        temperature: 0.5,
        messages: [
          { role: "system", content: "You are a precise JSON generator that returns Spotify/Google playlists." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      })
    });

    console.log('Fetch completed. Status:', res.status);
    const text = await res.text();
    console.log('Text content:', text);

    const body = JSON.parse(text);
    const content = body.choices?.[0]?.message?.content || "";
    const cleaned = content.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    console.log('Parsed successfully! Playlists count:', parsed?.playlists?.length);
  } catch (e) {
    console.log('Caught error in testRag:', e.message);
  }
}

testRag();
