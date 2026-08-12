# 🎵 SpotiGlory

> ** Spotify Audio Analytics, Psychometric Personality Profiler, ML Retraining Engine, Telegram AI Bot & Agentic RAG Pipeline**

[![Next.js](https://img.shields.io/badge/Next.js-16_App_Router-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.0-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Spotify API](https://img.shields.io/badge/Spotify_API-OAuth_2.0_PKCE-1DB954?style=for-the-badge&logo=spotify)](https://developer.spotify.com/)
[![OpenRouter AI](https://img.shields.io/badge/OpenRouter-Claude_3.5_&_Free_Models-7C3AED?style=for-the-badge&logo=anthropic)](https://openrouter.ai/)
[![Upstash Redis](https://img.shields.io/badge/Upstash-Redis_Cache-00E699?style=for-the-badge&logo=redis)](https://upstash.com/)
[![Prisma & Supabase](https://img.shields.io/badge/Prisma-Supabase_PostgreSQL-2D3748?style=for-the-badge&logo=prisma)](https://prisma.io)
[![Telegram Bot](https://img.shields.io/badge/Telegram_Bot-@SpotiGlory__Bot-26A5E4?style=for-the-badge&logo=telegram)](https://t.me/SpotiGlory_Bot)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

---

## 🌟 Overview

**SpotiGlory** is a full-stack, state-of-the-art Web application built with **Next.js 16 (App Router, Turbopack)** that transforms Spotify streaming data into a psychometric **Big Five (OCEAN)** personality profile, calibrated behavioral feature matrix, ground-truth validated ML retraining engine, dynamic Jam Rooms recommendation system, OpenRouter AI narrative engine, and interactive Telegram AI Bot.

Designed with an ultra-premium **Liquid Glass** design system—featuring specular refractions, dynamic glassmorphic panels, HSL-tailored dark mode palettes, and Framer Motion micro-animations—SpotiGlory connects securely to Spotify via OAuth 2.0 PKCE. It processes listening data both through live Web API calls and client-side in-browser extraction of **Extended Streaming History** archives (`my_spotify_data.zip`), producing empirical psychometric metrics without compromising user privacy.

---

## ✨ Key Features & Architecture Highlights

### 1. 🎨 Liquid Glass Design System
- Custom **Liquid Glass UI** with dynamic specular highlights, backdrop-blur refractions, interactive hover glow states, and dark mode palettes tailored with HSL accents.
- Responsive layout with desktop glass sidebars, mobile navigation drawers, and an interactive **Dev Tools Toggle** (`🔒 Dev Tools Hidden / 🔧 Dev Tools Active`).
- Dynamic visual components powered by **Framer Motion 12** and **Recharts** (Radar Charts, Line Charts, Circadian Heatmaps, and Time-Series Bar Charts).

### 2. 🎛️ Dynamic Jam Room & Mood Engine (`src/lib/dynamicRoomEngine.ts` & `src/lib/moodRoomEngine.ts`)
- **100% Dynamic Room Card Generation**: Evaluates top tracks, top artists, and recent history to dynamically compute genre clusters, match scores, and room titles.
- **Artist Metadata Feature Integration**: Automatically extracts top listened artists (e.g. *Neoni*, *Sia*, *Ed Sheeran*) and embeds them into custom room descriptions and vibe tags.
- **Dynamic Language Preference Resolution**: Automatically infers listening language preferences (`inferLanguageFromArtists`), discarding hardcoded static template rules.
- **Upstash Redis Catalog Caching**: Caches computed user catalogs (`room-catalog:{userId}`) and automatically invalidates stale entries whenever listening distributions evolve.
- **Room AI Companion Engines**: Features custom archetype AI chat companions (`roomChatCompanion.ts`, `realtimeChatEngine.ts`) interacting seamlessly inside room chats.

### 3. 🤖 Agentic RAG Playlist & Track Sourcing (`src/lib/roomPlaylistSource.ts`)
- **Binary Tag Vector Space Search**: Maps user recent tracks, room tags, and listening context into a binary tag vector space using Ochiai cosine similarity:
  $$\text{Similarity}(Q, D) = \frac{|Q \cap D|}{\sqrt{|Q| \times |D|}}$$
- **Anti-Hallucination Prompting**: Enforces strict LLM constraints so AI models never fabricate non-existent song titles or translate artist names into regional languages.
- **Cost-Free Model Routing**: Routes LLM requests through free models via OpenRouter (`openrouter/free`) with fallback handling.

### 4. 💬 Live Telegram AI Bot Integration (`src/app/api/telegram/webhook/route.ts`)
- **Telegram Bot Webhook**: Integrated with `@SpotiGlory_Bot` on Telegram ([t.me/SpotiGlory_Bot](https://t.me/SpotiGlory_Bot)).
- **Real-Time Music Search & Playlist Delivery**: Responds to user `/start` commands and vibe search queries by executing the Agentic RAG engine in real time to return formatted Markdown playlists directly inside Telegram chats.

### 5. 👥 Multi-Vector Suggested People Matching (`src/lib/jamMatching.ts` & `src/data/syntheticUsers.json`)
- **Psychometric Cosine Distance Matrix**: Calculates multi-vector distance across OCEAN vectors, MUSIC clusters, and mood states to match compatible listeners.
- **Realistic Avatars & Match Explanations**: Displays top candidate listener matches with portrait avatars and custom match reasoning breakdown.
- **Synthetic Profile Seeder (`scripts/seedSyntheticUsers.ts`)**: Populates 18 realistic synthetic listener profiles for offline evaluation and instant user matching.

### 6. 🔑 Spotify OAuth 2.0 PKCE & NextAuth.js Integration
- Secure authentication via NextAuth.js (Auth.js) requesting read-only scopes: `user-top-read`, `user-read-recently-played`, `user-read-email`, `user-read-private`.
- Automatic 1-hour access token refresh rotation handling Spotify token expirations server-side with 429 rate limit exponential backoff.

### 7. 📊 Behavioral Feature Engineering Engine (`src/lib/features.ts`)
Calculates pure mathematical signals from raw streaming records:
- **Calibrated Shannon Genre Entropy**:
  $$H = -\sum_{i=1}^n p_i \log_2(p_i), \quad H_{\text{norm}} = \frac{H}{\log_2(n)}$$
- **Explicit 3-State Machine**: Distinguishes `"NO_DATA"` ($n=0$), `"SINGLE_GENRE"` ($n=1$, hyper-focused 0 entropy), and `"MULTI_GENRE"` ($n > 1$).
- **Acoustic Keyword Scanner**: Recovers genre signals from track/artist metadata if Spotify API returns empty `genres: []`.
- **24-Hour & 7-Day Circadian Stream Bucketing**: Powers an interactive 7x24 heatmap grid and late-night listener ratio gauge (10:00 PM to 5:00 AM UTC).
- **Artist Loyalty Index**: Ratio of unique artists to total track artist appearances.
- **Average Artist Popularity**: 0–100 mainstream vs. niche score recovery.
- **Jaccard Genre Taste Stability Score**:
  $$J = \frac{|S_{\text{short}} \cap S_{\text{long}}|}{|S_{\text{short}} \cup S_{\text{long}}|}$$

### 8. 🧠 Rentfrow & Gosling MUSIC Model & Big Five Scoring Engine (`src/lib/genreClusters.ts` & `src/lib/oceanScoring.ts`)
- Grouping Spotify genre strings into 4 empirical **MUSIC clusters** (Rentfrow & Gosling, 2003):
  - **Reflective & Complex**: Jazz, Classical, Blues, Folk, World, Singer-Songwriter.
  - **Intense & Rebellious**: Rock, Metal, Punk, Alternative, Grunge, Emo.
  - **Upbeat & Conventional**: Pop, Country, Soundtracks, Gospel.
  - **Energetic & Rhythmic**: Hip-hop, Rap, R&B, EDM, Electronic, House, Techno.
- Versioned psychometric scoring matrix (`src/config/oceanWeights.json v1.0.0`) normalizing inputs to $0..1$ *before* weighted sum, and clamping to $0..100$ *after*.
- **Attribution & Uncertainty Quantification**: Provides full trait score attribution (`explainTraitScore`) and computes trait `confidence` (`"high"` | `"medium"` | `"low"`) and `reliabilityScore` ($0..100$) based on sample variance and count ($N \le 50$).

### 9. 🤖 OpenRouter AI Narrative Pipeline & Qualitative Grounding (`src/lib/narrativePrompt.ts`)
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
- **Incremental Retraining (`retrainModel`)**: Aggregates Mini-IPIP quiz results and user feedback corrections (`feedbackStore.ts`).
- **Semver Model Versioning**: Auto-bumps versions (`v1.0.0` $\rightarrow$ `v1.1.0` $\rightarrow$ `v1.2.0`) and stores version history alongside Pearson $r$ accuracy metrics.

### 12. 📁 Extended Streaming History Upload & Deep Analytics (`src/lib/extendedHistory.ts`)
- Client-side in-browser extraction using **JSZip**: drop `my_spotify_data.zip` or `Streaming_History_Audio_*.json` files directly.
- Privacy-First: Raw personal logs are processed entirely in-browser without server persistence.
- Calculates **All-Time Playback Duration** (in Hours & Days), **Real Skip Rates** (`skipped === true` || `reason_end === 'fwdbtn'` || `ms_played < 30000`), **Monthly Time-Series Bar Chart**, and **Top Tracks/Artists by Duration**.

### 13. ⚡ Upstash Redis Caching Layer (`src/lib/redis.ts`)
- Response-level caching on data-heavy Spotify and Analysis API routes (10-minute TTL) to **reduce Spotify API call count by 90%+**.
- Supports query-level bypass (`forceRefresh=true`) on the client to force invalidation, retrieve fresh live data, and write back to Redis.

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

    subgraph Dynamic Jam & Mood Rooms Engine
        E --> F[lib/dynamicRoomEngine.ts: Dynamic Genre & Artist Extractor]
        F --> G[Dynamic Jam Room Cards & Upstash Redis Catalog Cache]
        G --> H[roomChatCompanion.ts: Archetype Bot Room Companions]
    end

    subgraph GenAI Narrative & RAG Pipeline
        E --> I[OpenRouter AI Narrative Engine]
        I --> J[src/lib/roomPlaylistSource.ts: RAG Sourcing Engine]
        G --> J
        J --> K[Telegram Bot Webhook: /api/telegram/webhook]
    end

    subgraph Ground-Truth Retraining Loop
        L[10-Item Mini-IPIP Quiz /dashboard/quiz] --> M[ipipQuiz.ts: Pearson r Evaluator]
        N[Trait Card Liquid Feedback UI] --> O[feedbackStore.ts: Correction Pairs]
        M & O --> P[ridgeRegression.ts: L2 Ridge Regression Solver]
        P -->|Auto-Trigger Retraining| R[Semver Version History v1.0.0 -> v1.1.0]
    end

    subgraph Liquid Glass Dashboard UI
        G & J & K & R & D --> Q[Liquid Glass Dashboard /dashboard]
        Q --> S[OCEAN Glowing Radar Chart & Attribution]
        Q --> T[Dynamic Jam Rooms & Suggested People]
        Q --> U[Telegram Bot Assistant Interface]
        Q --> V[Model Accuracy & Version Diff Inspector]
    end
```

---

## 🛠️ Tech Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) | React 19 framework running Turbopack dev server |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) | End-to-end strict type-safe execution |
| **Database** | [Supabase PostgreSQL](https://supabase.com/) & Prisma ORM | Relational schema management & user profile storage |
| **Caching** | [Upstash Redis](https://upstash.com/) | Serverless REST Redis client for response & catalog caching |
| **Styling** | [TailwindCSS v4](https://tailwindcss.com/) | Vanilla CSS Liquid Glass tokens & dynamic HSL dark mode |
| **Authentication** | [NextAuth.js v4](https://next-auth.js.org/) | Spotify OAuth 2.0 PKCE Provider with automatic token refresh rotation |
| **AI / GenAI** | [OpenRouter API](https://openrouter.ai/) | `anthropic/claude-3.5-sonnet` & `openrouter/free` cost-free model routing |
| **Telegram AI Bot** | Telegram Bot Webhook API | Integrated `@SpotiGlory_Bot` handling music queries and RAG playlists |
| **ML Engine** | Pure TypeScript L2 Ridge Regression | Solver with Gauss-Jordan elimination & Pearson $r$ correlation evaluator |
| **Data Visualization** | [Recharts](https://recharts.org/) | Radar Charts, Line Charts, Circadian Heatmaps & Bar Charts |
| **Animations** | [Framer Motion 12](https://www.framer.com/motion/) | Liquid glass card micro-animations and Lucide React icons |
| **Archive Extraction** | [JSZip](https://stuk.github.io/jszip/) | Client-side ZIP unzipping for Extended Streaming History |
| **Unit Testing** | Node.js Native Test Runner | Executed via `tsx --test` with 15 test suites and 66 tests |

---


---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.17.0 or higher
- **Spotify Account**: Free or Premium
- **Spotify Developer Application**: Created on the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
- **Supabase Database**: PostgreSQL connection strings configured via Prisma
- **Upstash Redis Store**: Serverless REST URL and Token for response caching
- **OpenRouter API Key**: (Required for AI narrative generation & RAG playlist generator)
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
# Generate secret via: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
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

### Step 3: Configure Spotify Developer Dashboard

1. Log in to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Open your Application settings.
3. Under **Redirect URIs**, add:
   - `http://127.0.0.1:3000/api/auth/callback/spotify`
   - `http://localhost:3000/api/auth/callback/spotify`
4. Click **Save**.

---

### Step 4: Database Setup & Synthetic User Profile Seeding

Generate the Prisma client, apply database schemas, and seed the 18 synthetic listener profiles:

```bash
# Generate Prisma Client & Sync Database Schema
npx prisma generate
npx prisma db push

# Seed Synthetic User Profiles for Jam Matching
npx tsx scripts/seedSyntheticUsers.ts
```

---

### Step 5: Run the Development Server

```bash
npm run dev
```

Open your browser and navigate to **`http://127.0.0.1:3000`**.

---

## 🧪 Running Unit Tests

SpotiGlory includes a comprehensive suite of **15 test files** with **66 tests** verifying Shannon entropy calculations, timestamp bucketing, MUSIC clustering, OCEAN trait score clamping, Ridge Regression solver convergence, Agentic RAG Ochiai vector matching, and Extended Streaming History processing.

Run the entire unit test suite using Node's native test runner:

```bash
# Run all 15 unit test suites
npx tsx --test src/lib/*.test.ts
```

---

## 🔬 Research Citations & Disclaimer

The psychometric scoring models in SpotiGlory draw theoretical framework from:

> **Rentfrow, P. J., & Gosling, S. D. (2003)**. *The Do Re Mi's of everyday life: The structure and personality correlates of music preferences*. Journal of Personality and Social Psychology, 84(6), 1236–1256.

> ⚠️ **Disclaimer**: *SpotiGlory is an experimental analysis tool built for musical self-reflection and entertainment based on published music-preference research. It is not a certified clinical or psychological diagnostic instrument.*

---

## 👨‍💻 Author & Credits

Crafted  by **[GunaTeja777](https://github.com/GunaTeja777)**  
⭐ **Star the repo on GitHub**: [https://github.com/GunaTeja777/SpotiGlory](https://github.com/GunaTeja777/SpotiGlory)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for detailss.
