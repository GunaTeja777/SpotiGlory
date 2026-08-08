# 🎵 SpotiGlory

> ** Spotify Audio Analytics, Psychometric Personality Profiler, ML Retraining Engine, Telegram AI Bot & Agentic RAG Pipeline**

[![Next.js](https://img.shields.io/badge/Next.js-16_App_Router-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.0-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Spotify API](https://img.shields.io/badge/Spotify_API-OAuth_2.0-1DB954?style=for-the-badge&logo=spotify)](https://developer.spotify.com/)
[![OpenRouter AI](https://img.shields.io/badge/OpenRouter-Free_Models_&_Claude_3.5-7C3AED?style=for-the-badge&logo=anthropic)](https://openrouter.ai/)
[![Telegram Bot](https://img.shields.io/badge/Telegram_Bot-@SpotiGlory__Bot-26A5E4?style=for-the-badge&logo=telegram)](https://t.me/SpotiGlory_Bot)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

---

## 🌟 Overview

**SpotiGlory** is a full-stack, state-of-the-art Web application built with **Next.js 16 (App Router, Turbopack)** that transforms Spotify streaming data into a psychometric **Big Five (OCEAN)** personality profile, behavioral feature matrix, ground-truth validated ML model, dynamic Jam Rooms recommendation engine, and OpenRouter AI narrative pipeline.

Designed with an ultra-premium **Liquid Glass** design system—featuring specular refractions, dynamic glassmorphic panels, and Framer Motion micro-animations—SpotiGlory connects securely to Spotify via OAuth 2.0 PKCE. It processes listening data both through live Web API calls and in-browser extraction of **Extended Streaming History** archives (`my_spotify_data.zip`), producing empirical psychometric metrics without compromising user privacy.

---

## ✨ Key Features

### 1. 🎛️ Dynamic Jam Room Recommendation Engine (`src/lib/dynamicRoomEngine.ts`)
- **100% Dynamic Room Card Generation**: Evaluates user's live Spotify top tracks, top artists, and recent listening history to dynamically calculate genre clusters, match scores, and room titles.
- **Real Artist Feature Integration**: Automatically extracts top listened artists (e.g. *Neoni*, *Sia*, *Ed Sheeran*) and embeds them into custom room descriptions and vibe tags.
- **Dynamic Language Resolution**: Automatically infers listening language preferences from artist metadata (`inferLanguageFromArtists`), discarding hardcoded strings or static template rules.
- **Upstash Redis Cache Purging & Validation**: Automatically invalidates stale cached room catalogs (`room-catalog:{userId}`) whenever listening profile language or artist stream distributions change.

### 2. 🤖 Agentic RAG Playlist & Track Sourcing (`src/lib/roomPlaylistSource.ts`)
- **Context-Guided Vector Space Search**: Maps user recent tracks, room tags, and listening context into a binary tag vector space using Ochiai cosine similarity:
  $$\text{Similarity}(Q, D) = \frac{|Q \cap D|}{\sqrt{|Q| \times |D|}}$$
- **Anti-Hallucination Prompting**: Enforces strict LLM constraints so AI models never fabricate non-existent song titles or translate artist names into regional languages.
- **Free Model Routing**: Routes LLM requests through cost-free models via OpenRouter (`openrouter/free`).

### 3. 💬 Live Telegram Bot Integration (`src/app/api/telegram/webhook/route.ts`)
- **Telegram Bot Webhook**: Fully integrated with `@SpotiGlory_Bot` on Telegram ([t.me/SpotiGlory_Bot](https://t.me/SpotiGlory_Bot)).
- **Real-Time Music Search & Playlist Delivery**: Responds to user `/start` commands and vibe search queries by executing the Agentic RAG engine in real time to return Markdown playlists directly inside Telegram chats.

### 4. 👥 Multi-Vector Suggested People Matching (`src/data/syntheticUsers.json` & `src/lib/jamMatching.ts`)
- **Psychometric Cosine Distance Matrix**: Calculates multi-vector distance across OCEAN vectors, MUSIC clusters, and mood states to match compatible listeners.
- **Real Photo Avatars & Balanced Candidates**: Displays top 3 candidate listener matches (2 male, 1 female) with realistic human portrait avatars.

### 5. 🎨 Liquid Glass Design System
- Custom **Liquid Glass UI** featuring dynamic specular highlights, backdrop blur refractions, interactive hover glow states, and HSL tailored dark-mode color palettes.
- Fully responsive navigation with a desktop fixed glass sidebar, mobile drawer, and interactive **Dev Tools Toggle** (`🔒 Dev Tools Hidden / 🔧 Dev Tools Active`).

### 6. 🔑 Spotify OAuth 2.0 & NextAuth.js Integration
- Secure authentication via NextAuth.js (Auth.js) requesting read-only scopes: `user-top-read`, `user-read-recently-played`, `user-read-email`, `user-read-private`.
- Automatic 1-hour access token refresh rotation handling Spotify token expirations server-side with 429 rate limit exponential backoff.

### 7. 📊 Behavioral Feature Engineering Engine (`src/lib/features.ts`)
Calculates pure mathematical signals from streaming records:
- **Calibrated Shannon Genre Entropy**:
  $$H = -\sum_{i=1}^n p_i \log_2(p_i), \quad H_{\text{norm}} = \frac{H}{\log_2(n)}$$
- **Explicit State Machine**: Distinguishes `"NO_DATA"` ($n=0$), `"SINGLE_GENRE"` ($n=1$, hyper-focused 0 entropy), and `"MULTI_GENRE"` ($n > 1$).
- **Acoustic Keyword Scanner**: Recovers genre signals from track/artist metadata if Spotify API returns empty `genres: []`.
- **24-Hour & 7-Day Circadian Stream Bucketing**: Powers an interactive 7x24 heatmap grid and late-night listener ratio gauge (10:00 PM to 5:00 AM UTC).
- **Artist Loyalty Index**: Ratio of unique artists to total track artist appearances.
- **Average Artist Popularity**: 0–100 mainstream vs. niche score recovery.
- **Jaccard Genre Taste Stability Score**:
  $$J = \frac{|S_{\text{short}} \cap S_{\text{long}}|}{|S_{\text{short}} \cup S_{\text{long}}|}$$

### 8. 🧠 Rentfrow & Gosling MUSIC Model & Big Five Scoring Engine (`src/lib/genreClusters.ts` & `src/lib/oceanScoring.ts`)
- Empirical grouping of Spotify genre strings into 4 **MUSIC clusters** (Rentfrow & Gosling, 2003):
  - **Reflective & Complex**: Jazz, Classical, Blues, Folk, World, Singer-Songwriter.
  - **Intense & Rebellious**: Rock, Metal, Punk, Alternative, Grunge, Emo.
  - **Upbeat & Conventional**: Pop, Country, Soundtracks, Gospel.
  - **Energetic & Rhythmic**: Hip-hop, Rap, R&B, EDM, Electronic, House, Techno.
- Versioned psychometric scoring matrix (`src/config/oceanWeights.json v1.0.0`) normalizing inputs to $0..1$ *before* weighted sum, and clamping to $0..100$ *after*.
- **Uncertainty Quantification**: Calculates `confidence` (`"high"` | `"medium"` | `"low"`) and `reliabilityScore` ($0..100$) per trait based on sample variance and count ($N \le 50$).

### 9. 🤖 Production GenAI Narrative Pipeline via OpenRouter AI (`src/app/api/analysis/narrative/route.ts`)
- Integrated OpenRouter API calling `anthropic/claude-3.5-sonnet` or cost-free fallback routing (`openrouter/free`).
- **Deterministic Qualitative Grounding (`src/lib/narrativeBands.ts`)**: Pre-computes qualitative score bands (`very_low` .. `very_high`) in TypeScript to eliminate LLM number-to-text contradictions.
- **Strict Schema Validation & 1-Shot Retry (`src/lib/narrativeSchema.ts`)**: Runtime Zod-style schema validator executing an automatic 1-shot retry with error feedback if malformed.

### 10. 🎯 Ground-Truth Validation Quiz & Pearson Correlation Engine (`src/lib/ipipQuiz.ts`)
- 10-Item Mini-IPIP Likert survey on `/dashboard/quiz` measuring self-reported Big Five ground truth.
- Calculates Pearson correlation coefficients ($r = \frac{\sum (x - \bar{x})(y - \bar{y})}{\sqrt{\sum (x - \bar{x})^2 \sum (y - \bar{y})^2}}$) comparing Spotify computed scores against ground truth.

### 11. 📐 L2 Regularized Ridge Regression & Semver Retraining Engine (`src/lib/ridgeRegression.ts`)
- Pure TypeScript Ridge Regression solver fitting:
  $$\mathbf{w} = (\mathbf{X}^T \mathbf{X} + \lambda \mathbf{I})^{-1} \mathbf{X}^T \mathbf{y}$$
  using Gauss-Jordan elimination with partial pivoting.
- **Incremental Retraining (`retrainModel`)**: Aggregates Mini-IPIP quiz results and user feedback corrections.
- **Semver Model Versioning**: Bumps versions (`v1.0.0` $\rightarrow$ `v1.1.0` $\rightarrow$ `v1.2.0`) and stores version history (`spotiglory_model_versions`) alongside Pearson $r$ accuracy metrics.

### 12. 📁 Extended Streaming History Upload & Deep Analytics (`src/lib/extendedHistory.ts`)
- Client-side in-browser extraction using **JSZip**: drop `my_spotify_data.zip` or `Streaming_History_Audio_*.json` files directly.
- Calculates **All-Time Playback Duration** (in Hours & Days), **Real Skip Rates**, **Monthly Time-Series Bar Chart**, and **Top Tracks/Artists by Duration**.

### 13. ⚡ Upstash Redis Caching Layer (`src/lib/redis.ts`)
- Response-level caching on data-heavy Spotify and Analysis API routes (10-minute TTL) to **reduce Spotify API call count by 90%+**.
- Automatically caches computed Jam Room suggestions and taste profiles per-user (`room-catalog:{userId}`).
- Supports a query-level bypass (`forceRefresh=true`) on the client to force invalidation, retrieve fresh live data, and write back to Redis.

---

## 🏗️ System Architecture & Data Flow

```mermaid
flowchart TD
    subgraph Data Inputs
        A[Spotify OAuth API Session] -->|Top Tracks, Artists, Recently Played| B[Server API Routes /api/spotify/*]
        C[Extended History my_spotify_data.zip] -->|Client-Side JSZip Extraction| D[In-Browser History Aggregator]
    end

    subgraph Redis Caching Layer
        B -->|Cache Miss| E[lib/features.ts: Calibrated Behavioral Signals]
        B -->|Cache Hit| Q
        E -->|Write-Through Cache| RC[(Upstash Redis Cache)]
    end

    subgraph Dynamic Jam Room Engine
        E --> F[lib/dynamicRoomEngine.ts: Dynamic Genre & Artist Extractor]
        F --> G[Dynamic Jam Room Cards & Upstash Redis Catalog Cache]
    end

    subgraph GenAI Narrative & RAG Pipeline
        E --> H[OpenRouter AI Narrative Engine]
        H --> I[src/lib/roomPlaylistSource.ts: RAG Sourcing Engine]
        G --> I
        I --> J[Telegram Bot Webhook: /api/telegram/webhook]
    end

    subgraph Ground-Truth Retraining Loop
        K[10-Item Mini-IPIP Quiz /dashboard/quiz] --> L[ipipQuiz.ts: Pearson r Evaluator]
        M[Trait Card Liquid Feedback UI] --> N[feedbackStore.ts: Correction Pairs]
        L --> O[ridgeRegression.ts: L2 Ridge Regression Solver]
        N --> O
        O -->|Auto-Trigger @ 10 Pairs| P[Semver Version History v1.0.0 -> v1.1.0]
    end

    subgraph Dashboard UI
        G --> Q[Liquid Glass Dashboard /dashboard]
        I --> Q
        J --> Q
        P --> Q
        D --> Q
        Q --> R[OCEAN Glowing Radar Chart & Attribution]
        Q --> S[Dynamic Jam Rooms & Suggested People]
        Q --> T[Telegram Bot Assistant Interface]
    end
```

---

## 🛠️ Tech Stack

| Domain | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) with Turbopack |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) (Strict Type Checking) |
| **Database** | [Supabase PostgreSQL](https://supabase.com/) & Prisma ORM |
| **Caching** | [Upstash Redis](https://upstash.com/) (Serverless REST Redis Client) |
| **Styling** | [TailwindCSS v4](https://tailwindcss.com/) & Vanilla CSS Liquid Glass Design Tokens |
| **Authentication** | [NextAuth.js v4](https://next-auth.js.org/) (Spotify OAuth 2.0 Provider & Token Rotation) |
| **AI / GenAI** | [OpenRouter API](https://openrouter.ai/) (`openrouter/free` cost-free model routing & `anthropic/claude-3.5-sonnet`) |
| **Telegram Bot** | Telegram Bot Webhook API (`@SpotiGlory_Bot`) |
| **ML Engine** | Pure TypeScript L2 Regularized Ridge Regression Solver & Pearson $r$ Correlation Evaluator |
| **Data Visualization** | [Recharts](https://recharts.org/) (RadarChart, LineChart & BarChart) |
| **Animations** | [Framer Motion 12](https://www.framer.com/motion/) & Lucide React Icons |
| **File Unzipping** | [JSZip](https://stuk.github.io/jszip/) (Client-Side Zip Extraction) |
| **Unit Testing** | Node.js Native Test Runner (`node:test` & `node:assert`) via `tsx` |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.17.0 or higher
- **Spotify Account**: Free or Premium
- **Spotify Developer Application**: Created on the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
- **Supabase Database**: URL connection strings configured via Prisma
- **Upstash Redis Store**: Serverless REST URL and Token for caching API responses
- **OpenRouter API Key**: (Required for narrative profile generation & RAG playlist generator)
- **Telegram Bot Token**: (Optional, for Telegram bot integration `@SpotiGlory_Bot`)

---

### Step 1: Clone the Repository & Install Dependencies

```bash
git clone https://github.com/GunaTeja777/SpotiGlory.git
cd SpotiGlory/SpotiGlory
npm install
```

---

### Step 2: Configure Environment Variables

Create a `.env.local` file in the project root directory (or copy from `.env.local.example`):

```bash
cp .env.local.example .env.local
```

Fill in your environment credentials:

```env
# Spotify API Credentials (from Spotify Developer Dashboard)
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here

# NextAuth Configuration
NEXTAUTH_SECRET=your_generated_32_byte_base64_secret
NEXTAUTH_URL=http://127.0.0.1:3000

# OpenRouter API Key (for GenAI Narrative & RAG Playlists)
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Supabase Database URL (for Prisma ORM integration)
DATABASE_URL="postgresql://postgres:password@db.supabase.co:5432/postgres?schema=public"
DIRECT_URL="postgresql://postgres:password@db.supabase.co:5432/postgres?schema=public"

# Upstash Redis serverless cache details
UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url_here
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token_here

# Telegram Bot Token (for @SpotiGlory_Bot)
TELEGRAM_BOT_TOKEN="your_telegram_bot_token_here"
```

---

### Step 3: Run the Development Server

```bash
npm run dev
```

Open your browser and navigate to **`http://127.0.0.1:3000`**.

---

## 🧪 Running Unit Tests

Run all unit test suites using Node's test runner:

```bash
npx tsx --test src/lib/feedbackStore.test.ts src/lib/narrativeEval.test.ts src/lib/ipipQuiz.test.ts src/lib/ridgeRegression.test.ts src/lib/features.test.ts src/lib/oceanScoring.test.ts src/lib/extendedHistory.test.ts
```

---

## 👨‍💻 Author & Credits

Crafted  by **[GunaTeja777](https://github.com/GunaTeja777)**  
⭐ **Star the repo on GitHub**: [https://github.com/GunaTeja777/SpotiGlory](https://github.com/GunaTeja777/SpotiGlory)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
