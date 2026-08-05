const fs = require('fs');
const path = require('path');

// Helper to load env files manually
function loadEnv() {
  const envPath = path.join(__dirname, '..', '..', '.env.local');
  if (fs.existsSync(envPath)) {
    console.log('Loading env from:', envPath);
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
          value = value.slice(1, -1);
        }
        process.env[key] = value;
      }
    });
  }
}

loadEnv();

const openRouterKey = process.env.OPENROUTER_API_KEY;
console.log('API Key loaded (first 5 chars):', openRouterKey ? openRouterKey.substring(0, 5) + '...' : 'undefined');

if (!openRouterKey) {
  console.error('Error: OPENROUTER_API_KEY is not defined in env files!');
  process.exit(1);
}

async function runTest() {
  const model = "openrouter/free"; // Test auto-routing free meta-model
  console.log(`Testing model: ${model}...`);
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openRouterKey}`,
        "HTTP-Referer": "https://spotiglory.vercel.app",
        "X-Title": "SpotiGlory Test"
      },
      body: JSON.stringify({
        model: model,
        temperature: 0.5,
        messages: [
          { role: "system", content: "You are a precise JSON generator that returns Spotify/Google playlists." },
          { role: "user", content: "Return a JSON object with one playlist named 'Cool Vibe'." }
        ],
        response_format: { type: "json_object" }
      })
    });

    console.log('Response Status:', res.status);
    console.log('Response Status Text:', res.statusText);
    const body = await res.text();
    console.log('Response Body:', body);
  } catch (e) {
    console.error('Fetch error:', e);
  }
}

runTest();
