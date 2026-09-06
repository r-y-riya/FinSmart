# FinSmart

> **Know what changed. Know why it matters.**

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas-forestgreen.svg)](https://www.mongodb.com/atlas)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v3-cyan.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Overview

Traditional financial watchlists act as passive spreadsheets: they present walls of green and red percentages with no sense of historical context, memory, or signal-to-noise separation. A retail investor opening their portfolio app after hours of meetings cannot immediately tell whether a 2.5% drop in Reliance occurred quietly over seven hours or crashed violently in the last ten minutes on 5× average volume and breaking negative refinery news.

**FinSmart** is a full-stack, change-first market intelligence platform. Instead of merely polling current market values, FinSmart **remembers what users last saw**, stores immutable historical market snapshots in MongoDB Atlas, and runs an intelligent change and attention detection engine to answer one critical question:

> *"What meaningfully changed since I last checked, and why does it matter?"*

---

## Problem

1. **Information Overload**: Modern financial portals blast users with hundreds of streaming ticks, flashing prices, and sensationalist headlines. Every minor fluctuation is treated with equal visual urgency.
2. **Loss of Temporal Context**: Standard watchlists do not remember the state of the market when the user last logged off. Users are forced to manually remember yesterday's prices or compute intraday shifts themselves.
3. **Absence of Significance Filtering**: A 1.5% move on low volume is routine market noise; the same 1.5% move on 4× volume breaking through 52-week support is an inflection point. Conventional tools cannot distinguish the two.
4. **Disjointed Intelligence**: Price action lives on charts, news lives on RSS feeds, and analysis lives in financial blogs. Connecting market movements to contextual news and fundamental causality requires manual searching across multiple tabs.

---

## Solution

FinSmart transforms the passive watchlist into an active, intelligent market companion:

1. **Stateful Session Memory**: Tracks each user's `lastVisitedAt` timestamp and retrieves the exact baseline snapshot of their watchlist from their previous visit.
2. **Deterministic Change Engine**: Evaluates current quotes against historical baselines, computing percentage deltas, volume multiples, 52-week extremes, and threshold breaches.
3. **0–100 Multi-Factor Attention Score**: Synthesizes price velocity, volume surge, statistical anomalies, news corroboration, sector divergence, and user thresholds into an objective attention score.
4. **Statistical Anomaly Detection (ML)**: Uses rolling z-score calculations on log returns and trading volume to mathematically identify whether an asset is experiencing an abnormal statistical shock.
5. **Grounded AI Explanations**: Surfaces concise *"✦ Why This Matters"* explanations and executive briefings powered by OpenAI, strictly grounded in verifiable snapshot metrics and NewsAPI articles to eliminate hallucination.
6. **Calm, High-Information UI**: Employs an intentional, calming pastel palette (`#FAFAF7` canvas, `#16A66A` emerald, `#FF9B7A` peach high-attention, `#F5C95B` watch, `#F4F0FF` lavender) with clear visual hierarchy.

---

## USP

> **FinSmart is a change-first market intelligence platform that remembers what users last saw and surfaces only the market movements worth their attention when they return.**

FinSmart is not:
> *"A generic dashboard where users check live stock quotes."*

FinSmart is:
> **A deterministic system that detects, prioritizes, and explains meaningful changes across a user's watchlist.**

---

## Features

- **"While You Were Away" Executive Digest**: Instant summary of watchlist events that occurred between the user's previous visit and the present moment.
- **Priority Attention Classification**:
  - 🍑 **Significant (Score ≥ 65)**: Major price/volume breaks, critical news catalysts, or statistical anomalies requiring immediate review.
  - 🟡 **Worth Watching (Score 40–64)**: Noticeable movement, elevated volume, or emerging news worth monitoring.
  - ⚪ **Normal (Score < 40)**: Standard market drift within expected daily volatility.
- **"✦ Why This Matters" Synthesizer**: AI-generated explanations translating numerical anomalies and news articles into plain-English causality without offering illegal financial advice.
- **"Ask FinSmart" Conversational Intelligence**: Interactive contextual AI modal where users can query specific movements across their watchlist, backed strictly by recent snapshot deltas and news data.
- **Interactive Multi-Timeframe Charts**: Recharts-powered interactive price and volume charts with baseline price indicators and change markers.
- **Custom Alerting Thresholds**: Personalized user thresholds for price movement % and volume surges.
- **Interactive Demo Simulation Bar**: One-click market movement simulations (e.g. *Simulate RELIANCE -3.2% Crash* or *TATAMOTORS +4.1% Breakout*) allowing hackathon judges to test real-time attention score recalculations without waiting for market hours.
- **Graceful Provider Outage Resilience**: Full offline fallback architecture with simulated outage testing, stale cache indicators, and in-memory mock datasets.

---

## Architecture

FinSmart follows a strict, unidirectional intelligence pipeline:

```text
       ┌────────────────────────┐
       │     MongoDB Atlas      │ ──► Remembers the past (Snapshots & Baselines)
       └───────────┬────────────┘
                   │
       ┌───────────▼────────────┐
       │  Twelve Data Market API│ ──► Provides the present (Real-time quotes & volume)
       └───────────┬────────────┘
                   │
       ┌───────────▼────────────┐
       │ Change Detection Engine│ ──► Detects delta movements (Price %, Volume ×)
       └───────────┬────────────┘
                   │
       ┌───────────▼────────────┐
       │ Statistical Anomaly ML │ ──► Computes rolling z-score of returns & volume
       └───────────┬────────────┘
                   │
       ┌───────────▼────────────┐
       │ NewsAPI Intelligence   │ ──► Gathers & scores relevant corroborating news
       └───────────┬────────────┘
                   │
       ┌───────────▼────────────┐
       │ Attention Score Engine │ ──► Calculates 0–100 score & categorizes severity
       └───────────┬────────────┘
                   │
        ┌───────────▼────────────┐
        │ Gemini Synthesis Layer │ ──► Explains the evidence ("✦ Why This Matters")
        └───────────┬────────────┘
                   │
       ┌───────────▼────────────┐
       │ React + Tailwind UI    │ ──► Communicates insights cleanly & calmly
       └────────────────────────┘
```

---

## Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS (custom calm financial palette, typography tokens)
- **Icons**: Lucide React
- **Visualizations**: Recharts (ResponsiveContainer, AreaChart, BarChart, Tooltip)
- **HTTP Client**: Axios with global JWT authorization interceptors

### Backend
- **Runtime**: Node.js (ESM modules)
- **Framework**: Express.js
- **Database**: MongoDB Atlas with Mongoose ODM
- **Security**: JSON Web Tokens (JWT), Bcrypt.js, Express Rate Limit, CORS, Zod validation
- **External Providers**:
  - **Twelve Data API**: Real-time market quotes and intraday time series
  - **NewsAPI**: Financial news aggregation and sentiment/relevance filtering
  - **Google Gemini API (gemini-3.6-flash)**: Evidence-grounded executive summaries and Q&A via official `@google/genai` SDK

---

## MERN Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT (React + Vite)                  │
│   AuthContext ── WatchlistContext ── DemoContext            │
│   DashboardPage ── StockDetailPage ── AskFinSmartModal      │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON (Bearer JWT)
┌──────────────────────────────▼──────────────────────────────┐
│                    API SERVER (Express.js)                  │
│  Routes: /auth, /watchlist, /stocks, /changes, /ai, /demo    │
│  Middleware: auth.middleware, rateLimiter, errorHandler     │
├─────────────────────────────────────────────────────────────┤
│                       SERVICES & ENGINES                    │
│  • ChangeDetectionService  • AttentionScoreService           │
│  • AnomalyDetectionService • MarketService (Twelve Data)    │
│  • NewsService (NewsAPI)   • AIService (OpenAI Grounding)   │
└──────────────────────────────┬──────────────────────────────┘
                               │ Mongoose ODM (TLS / DNS)
┌──────────────────────────────▼──────────────────────────────┐
│                    DATABASE (MongoDB Atlas)                 │
│  Users, Watchlists, Stocks, StockSnapshots, ChangeEvents    │
│  NewsArticles, AIInsights, Alerts                           │
└─────────────────────────────────────────────────────────────┘
```

---

## MongoDB Data Model

### 1. `users`
Represents platform users, credentials, and stateful session tracking.
```javascript
{
  _id: ObjectId,
  email: { type: String, unique: true, index: true },
  passwordHash: String,
  name: String,
  lastVisitedAt: Date,      // Crucial: Used to calculate changes since last visit
  currentVisitAt: Date,     // Current active session timestamp
  preferences: {
    priceThresholdPercent: { type: Number, default: 2.0 },
    volumeThresholdMultiplier: { type: Number, default: 2.0 },
    theme: { type: String, default: 'light' }
  }
}
```

### 2. `watchlists`
User-curated collection of monitored stock symbols.
```javascript
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User', index: true },
  name: String,
  items: [{
    symbol: String,
    addedAt: Date,
    notes: String
  }]
}
```

### 3. `stocks`
Master stock repository with cached technical statistics and sector mappings.
```javascript
{
  _id: ObjectId,
  symbol: { type: String, unique: true, index: true },
  name: String,
  exchange: String,         // NSE, BSE, NASDAQ
  sector: String,
  industry: String,
  baselinePrice: Number,    // Rolling baseline price
  historicalVolatility: Number, // 30-day standard deviation
  week52High: Number,
  week52Low: Number,
  averageVolume: Number,
  lastUpdated: Date
}
```

### 4. `stockSnapshots`
**Immutable append-only collection** capturing time-series state. Snapshots are never mutated.
```javascript
{
  _id: ObjectId,
  stockId: { type: ObjectId, ref: 'Stock' },
  symbol: { type: String, index: true },
  price: Number,
  open: Number,
  high: Number,
  low: Number,
  volume: Number,
  timestamp: { type: Date, index: true },
  provider: String,         // 'TWELVE_DATA', 'MOCK_FALLBACK'
  source: String,           // 'SCHEDULED_JOB', 'USER_TRIGGER', 'SIMULATION'
  isStale: Boolean
}
// Compound Index: { symbol: 1, timestamp: -1 }
```

### 5. `changeEvents`
Detected change events generated when incoming snapshots deviate from baselines.
```javascript
{
  _id: ObjectId,
  stockId: { type: ObjectId, ref: 'Stock' },
  symbol: { type: String, index: true },
  eventType: String,        // 'PRICE_MOVEMENT', 'VOLUME_SURGE', 'PRICE_VOLUME_MOVEMENT'
  severity: String,         // 'SIGNIFICANT', 'WORTH_WATCHING', 'NORMAL'
  oldValue: Number,         // Baseline price
  newValue: Number,         // Current price
  percentageChange: Number,
  volumeRatio: Number,
  attentionScore: { type: Number, index: true }, // 0 to 100
  signals: [{
    type: String,           // 'PRICE', 'VOLUME', 'NEWS', 'ML_ANOMALY', 'USER_THRESHOLD'
    score: Number,
    description: String
  }],
  primaryEventText: String,
  whyFlagged: String,
  detectedAt: { type: Date, index: true }
}
```

### 6. `newsArticles`
De-duplicated news articles scored by relevance to specific company symbols.
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  url: { type: String, unique: true },
  source: String,
  publishedAt: Date,
  relevantSymbols: [String],
  relevanceScore: Number    // 0.0 to 1.0 based on entity matching
}
```

### 7. `aiInsights`
Cached OpenAI analysis keyed to symbols and change events to optimize token usage.
```javascript
{
  _id: ObjectId,
  symbol: { type: String, index: true },
  changeEventId: { type: ObjectId, ref: 'ChangeEvent', index: true },
  summary: String,
  whyItMatters: String,
  confidence: String,       // 'HIGH', 'MEDIUM', 'LOW'
  evidence: [String],
  generatedAt: Date
}
```

### 8. `alerts`
User notification triggers matching specific watchlist events.
```javascript
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User', index: true },
  symbol: String,
  type: String,             // 'ATTENTION_SPIKE', 'PRICE_DROP', 'VOLUME_BURST'
  thresholdValue: Number,
  status: { type: String, enum: ['TRIGGERED', 'PENDING', 'DISMISSED'] },
  createdAt: Date
}
```

---

## Change Detection Engine

The change detection engine is executed whenever:
1. A scheduled cron poll receives new market data.
2. A user loads their dashboard after an absence.
3. A demo simulation tick is injected.

### Detection Workflow
1. **Retrieve Previous Snapshot**: Queries `StockSnapshot.findOne({ symbol, timestamp: { $lte: referenceTime } }).sort({ timestamp: -1 })`.
2. **Retrieve Current Snapshot**: Evaluates the latest quote against the previous baseline.
3. **Delta Calculation**:
   $$\Delta P = \frac{P_{\text{current}} - P_{\text{baseline}}}{P_{\text{baseline}}} \times 100$$
   $$\text{Volume Ratio} = \frac{V_{\text{current}}}{\overline{V}_{\text{avg}}}$$
4. **Significance Evaluation**:
   - If $|\Delta P| \ge 2.0\%$ OR $\text{Volume Ratio} \ge 2.0\times$ OR $P$ breaches 52-week High/Low within 1%, a `ChangeEvent` is flagged.
5. **Persistence**: Creates an immutable `ChangeEvent` document with sub-signals.

---

## Attention Score

FinSmart rejects simplistic 0–1 binary alerts in favor of an objective **0–100 Weighted Attention Score**:

$$\text{Attention Score} = \sum_{i} w_i \cdot S_i$$

### Factor Weights & Breakdown

| Factor | Weight ($w_i$) | Maximum Points | Evaluation Criteria |
| :--- | :---: | :---: | :--- |
| **Price Velocity** | 25% | 25 pts | $|\Delta P| \ge 4.0\% \rightarrow 25$; $\ge 2.0\% \rightarrow 18$; $\ge 1.0\% \rightarrow 10$; else proportional |
| **Volume Surge** | 20% | 20 pts | $\ge 3.0\times \rightarrow 20$; $\ge 2.0\times \rightarrow 15$; $\ge 1.5\times \rightarrow 10$ |
| **News Corroboration** | 20% | 20 pts | Breaking news with relevance $\ge 0.70 \rightarrow 20$; relevant news $\ge 0.40 \rightarrow 12$ |
| **ML Anomaly Detection** | 15% | 15 pts | Rolling z-score $\|Z\| \ge 3.0 \rightarrow 15$; $\|Z\| \ge 2.0 \rightarrow 10$; $\|Z\| \ge 1.5 \rightarrow 6$ |
| **Sector Divergence** | 10% | 10 pts | Asset moving in sharp divergence from broader sector index $\rightarrow 10$ |
| **Volatility Context** | 10% | 10 pts | Move relative to asset's 30-day historical standard deviation |

### Attention Tiers
- 🍑 **SIGNIFICANT / HIGH ATTENTION (Score 65–100)**: Displayed prominently with peach alert card, AI summary, and highlighted signals.
- 🟡 **WORTH WATCHING (Score 40–64)**: Displayed with warm yellow badge; moderate movement with some corroborating volume or news.
- ⚪ **NORMAL (Score 0–39)**: Standard baseline drift; collapsed by default in the change feed.

---

## Anomaly Detection

To answer *"Is this movement normal for this specific stock?"*, FinSmart implements a statistical anomaly detection engine using rolling z-scores.

### Statistical Formula
For a series of historical returns $R = [r_1, r_2, \dots, r_n]$:

$$\mu = \frac{1}{n}\sum_{i=1}^n r_i, \quad \sigma = \sqrt{\frac{1}{n-1}\sum_{i=1}^n (r_i - \mu)^2}$$

$$Z_{\text{return}} = \frac{r_{\text{current}} - \mu}{\sigma}$$

Similarly, for normalized trading volume $V$:

$$Z_{\text{volume}} = \frac{V_{\text{current}} - \mu_V}{\sigma_V}$$

### Anomaly Classification
- **$\|Z\| \ge 3.0$** (Extreme Anomaly, $p < 0.003$): Probability of occurring by chance is less than 0.3%. High anomaly bonus applied (+15 pts).
- **$2.0 \le \|Z\| < 3.0$** (Moderate Outlier): Statistically abnormal (+10 pts).
- **$\|Z\| < 2.0$** (Normal Range): Within normal statistical distribution.

---

## News Intelligence

FinSmart integrates with NewsAPI to provide contextual evidence behind market moves:
1. **Targeted Symbol Queries**: Fetches top news using company names and tickers (e.g. `"Reliance Industries" OR "RELIANCE"`).
2. **Relevance Scoring Engine**: Evaluates title and description for entity density, financial keywords (*earnings, regulatory, acquisition, downgrade*), and symbol mentions:
   $$\text{Score} = (\text{Title Mention} \times 0.6) + (\text{Description Mention} \times 0.4)$$
3. **URL De-duplication**: Prevents duplicate syndication across different aggregator outlets using unique URL indexes in MongoDB.
4. **Corroboration Link**: Attaches news articles directly to `ChangeEvent` objects detected within a 24-hour window.

---

## AI Layer

FinSmart employs the official Google Gemini API (`@google/genai` SDK with `gemini-3.6-flash`) to generate human-readable explanations while strictly adhering to safety and grounding guidelines.

### Grounding Principles
- **No Hallucination**: Prompts receive the exact JSON payload of:
  - Current price and baseline price
  - Percentage change and volume multiple
  - Rolling z-score and anomaly level
  - Top 3 verified news headlines and timestamps
- **Distinguish Fact from Inference**: The model states verifiable metrics first (*"Reliance declined 3.2% on 4.7× volume"*), followed by attributed catalysts (*"News sources report margin compression in refining"*).
- **Strict Compliance Boundary**: FinSmart explicitly **never** provides buy/sell recommendations, target prices, or forward-looking guarantees.

### Offline & Rate-Limit Fallback
If the Gemini API is unreachable, rate-limited (HTTP 429), or in circuit-breaker cooldown, FinSmart's deterministic fallback engine automatically synthesizes an offline explanation from the structured snapshot signals:
> *"Reliance fell 3.2%, breaching your 2.0% alert threshold on 4.7× average trading volume. Statistical anomaly score was 0.99 (Extreme Anomaly) with 1 correlated news event."*

---

## API Endpoints

### Authentication
- `POST /api/auth/register` — Register a new account
- `POST /api/auth/login` — Authenticate and receive JWT
- `GET /api/auth/me` — Current user profile & `lastVisitedAt` timestamp

### Watchlists
- `GET /api/watchlist` — Retrieve user's active watchlist
- `POST /api/watchlist` — Create or update watchlist items
- `POST /api/watchlist/items` — Add a stock symbol to watchlist
- `DELETE /api/watchlist/items/:symbol` — Remove a stock symbol

### Stocks & Market Data
- `GET /api/stocks` — List all tracked master stocks with current quotes
- `GET /api/stocks/search?q=:query` — Search stocks by symbol or company name
- `GET /api/stocks/:symbol` — Detailed stock quote, 52-week metrics, and chart series
- `GET /api/stocks/:symbol/snapshots` — Historical snapshot timeline

### Change Intelligence
- `GET /api/changes/since-last-visit` — Primary dashboard endpoint: returns all changes detected since user's previous visit
- `GET /api/changes/timeline/:symbol` — Chronological change events for a stock
- `POST /api/changes/detect` — Trigger manual change detection evaluation

### AI Explanations
- `GET /api/ai/insight/:symbol` — Retrieve or generate *"✦ Why This Matters"* insight
- `POST /api/ai/ask` — Ask FinSmart conversational market questions grounded in snapshots
- `GET /api/ai/summary` — "While You Were Away" macro digest

### Demo & Simulation (Hackathon Testing)
- `POST /api/demo/simulate-movement` — Inject synthetic price/volume ticks (e.g. -3.5%, 3× volume) and recalculate attention score
- `POST /api/demo/toggle-provider-failure` — Toggle simulated market API outage to demonstrate graceful fallback
- `POST /api/demo/reset-baseline` — Reset user session timestamp to simulate returning after 8 hours

---

## Project Structure

```text
groww/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js              # MongoDB Atlas connection & DNS handling
│   │   ├── controllers/
│   │   │   ├── auth.controller.js       # Register, login, session management
│   │   │   ├── watchlist.controller.js  # CRUD operations for watchlists
│   │   │   ├── stock.controller.js      # Stock search, details, snapshots
│   │   │   ├── change.controller.js     # Since-last-visit change feed
│   │   │   ├── ai.controller.js         # Why This Matters & Ask FinSmart
│   │   │   ├── alert.controller.js      # Threshold alert triggers
│   │   │   └── demo.controller.js       # Live simulation & outage triggers
│   │   ├── integrations/
│   │   │   ├── twelveData.client.js     # Twelve Data market provider
│   │   │   ├── newsApi.client.js        # NewsAPI integration & scoring
│   │   │   └── openai.client.js         # OpenAI prompt engineering & grounding
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js       # JWT Bearer verification
│   │   │   └── errorHandler.js          # Unified JSON error handling
│   │   ├── models/
│   │   │   ├── User.js                  # User model with lastVisitedAt
│   │   │   ├── Watchlist.js             # User watchlist collections
│   │   │   ├── Stock.js                 # Master stocks catalog
│   │   │   ├── StockSnapshot.js         # Immutable historical snapshots
│   │   │   ├── ChangeEvent.js           # Detected changes & attention scores
│   │   │   ├── NewsArticle.js           # Correlated news items
│   │   │   ├── AIInsight.js             # Cached OpenAI answers
│   │   │   └── Alert.js                 # Alert triggers
│   │   ├── routes/                      # Express route definitions
│   │   ├── scripts/
│   │   │   └── seed.js                  # MongoDB Atlas database seeder
│   │   ├── services/
│   │   │   ├── market.service.js        # Snapshot caching & provider fallback
│   │   │   ├── changeDetection.service.js # Delta evaluation engine
│   │   │   ├── attentionScore.service.js  # 0–100 weighted attention scoring
│   │   │   ├── anomalyDetection.service.js# Statistical z-score ML calculations
│   │   │   ├── news.service.js          # News filtering and storage
│   │   │   └── ai.service.js            # Structured AI synthesis
│   │   ├── app.js                       # Express app setup & CORS
│   │   └── server.js                    # HTTP server bootstrap
│   ├── .env.example
│   ├── .env                             # (Ignored in Git)
│   └── package.json
├── src/                                 # Frontend React Application
│   ├── components/
│   │   ├── AskFinSmartModal.jsx         # Contextual AI Q&A modal
│   │   ├── ChangeCard.jsx               # Prioritized change cards
│   │   ├── ChangeSignalBreakdown.jsx    # Visual radar/bar of attention signals
│   │   ├── DemoBanner.jsx               # Hackathon quick simulation bar
│   │   ├── Navbar.jsx                   # Brand navigation & AI trigger
│   │   ├── StockChart.jsx               # Recharts interactive price chart
│   │   ├── WhyThisMattersCard.jsx       # ✦ Why This Matters AI component
│   │   └── ...
│   ├── context/
│   │   ├── AuthContext.jsx              # User session & 1-click demo login
│   │   └── WatchlistContext.jsx         # Watchlist state & backend sync
│   ├── pages/
│   │   ├── DashboardPage.jsx            # Main "Here's what changed" screen
│   │   ├── StockDetailPage.jsx         # Deep-dive timeline & AI analysis
│   │   └── WatchlistPage.jsx            # Watchlist management
│   ├── services/                        # Modular frontend API services
│   │   ├── api.js                       # Axios instance with auth interceptor
│   │   ├── authApi.js
│   │   ├── watchlistApi.js
│   │   ├── stockApi.js
│   │   ├── changeApi.js
│   │   ├── aiApi.js
│   │   └── demoApi.js
│   ├── App.jsx
│   └── index.css                        # Tailwind directives & design tokens
├── package.json
└── README.md
```

---

## Environment Variables

### Backend Configuration (`backend/.env`)

```bash
# Server Port
PORT=5000
NODE_ENV=development

# MongoDB Atlas Connection URI
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/finsmart?retryWrites=true&w=majority

# JWT Security
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Twelve Data API Key (Market Quotes)
TWELVEDATA_API_KEY=your_twelve_data_api_key

# NewsAPI Key (Corroborating News)
NEWS_API_KEY=your_newsapi_key

# OpenAI API Key (Intelligence & Summaries)
OPENAI_API_KEY=your_openai_api_key
```

### Frontend Configuration (`.env`)

```bash
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## Local Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB Atlas** cluster (or local MongoDB 6.0+)

### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your MongoDB Atlas URI and API keys

# Seed the database with master stocks, historical baselines, and demo user
npm run seed

# Start backend server (runs on http://localhost:5000)
npm run dev
```

### 2. Frontend Setup
```bash
# Navigate to project root
cd ..

# Install dependencies
npm install

# Start Vite development server (runs on http://localhost:5173)
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Demo Mode

FinSmart is designed for seamless hackathon evaluation with **zero setup hurdles**:

1. **One-Click Demo Login**:
   Click **"Quick Demo Login"** on the login screen to instantly log in as `arjun.mehta@finsmart.io` (`password123`).
2. **Pre-Seeded Historical Baselines**:
   The database seeder automatically creates an 8-hour gap between Arjun's baseline snapshot and the latest market movements across RELIANCE, TCS, INFY, HDFCBANK, and TATAMOTORS.
3. **Interactive Simulation Bar**:
   Use the buttons in the persistent top demo banner:
   - `⚡ Simulate RELIANCE -3.2%`: Injects an intraday drop on 4.7× volume with crude oil margin news, triggering an 83/100 Significant alert.
   - `⚡ Simulate TATAMOTORS +4.1%`: Injects a breakout move with EV delivery surge news.
   - `🔌 Simulate API Outage`: Simulates a total failure of external data providers, showcasing FinSmart's graceful fallback banner and cached snapshot preservation.
   - `🔄 Reset Session Time`: Sets `lastVisitedAt` back 8 hours to re-experience the "While You Were Away" change flow.

---

## Testing

### 1. Automated Health & Integration Verification
Run the backend verification suite:
```bash
node backend/src/scripts/seed.js
```
Expected output:
```text
[SEED] Connected to MongoDB Atlas.
[SEED] Database reset complete.
[SEED] 5 Master stocks seeded.
[SEED] Baseline snapshots created (7h 42m ago).
[SEED] Current snapshots and ChangeEvents generated.
[SEED] Demo user seeded: arjun.mehta@finsmart.io
```

### 2. Manual User Journey Verification
- **Login**: Authenticate with `arjun.mehta@finsmart.io` / `password123`.
- **Dashboard**: Confirm the headline reads *"3 things deserve your attention since you last checked"*.
- **Attention Badge**: Verify RELIANCE displays a peach badge with Attention Score `83/100 (Significant)`.
- **Stock Detail**: Click into RELIANCE; confirm the Recharts area graph shows the baseline drop, the *"✦ Why This Matters"* card renders grounded explanations, and correlated news is visible.
- **Ask FinSmart**: Click *"Ask AI"* in the navbar; type *"Why did Reliance drop?"*; verify the grounded response.

---

## Security

- **Encrypted Credentials**: Passwords hashed using `bcryptjs` with salt work factor 10.
- **Stateless Authorization**: Protected endpoints require HTTP Bearer JWT tokens verified via Express middleware.
- **Strict Input Validation**: All incoming requests validated against `Zod` schemas before controller invocation.
- **Rate Limiting**: `express-rate-limit` prevents brute-force login attacks (100 requests per 15-minute window).
- **Environment Isolation**: API keys, database credentials, and secrets are strictly confined to `backend/.env` and excluded from source control.
- **CORS Restricted**: Backend CORS policy configured to allow requests only from the frontend origin.

---

## Resilience

- **Windows DNS SRV Fallback**: Configured Google (`8.8.8.8`) and Cloudflare (`1.1.1.1`) DNS resolvers to prevent Windows `querySrv ECONNREFUSED` issues with MongoDB Atlas.
- **Provider Outage Tolerance**: If Twelve Data or NewsAPI fails, FinSmart marks snapshots with `isStale: true` and serves cached data rather than crashing.
- **Graceful UI Degradation**: When offline, the frontend renders a prominent yellow alert banner: *"Market data temporarily unavailable · Showing last known snapshot"*.
- **AI Rate-Limit Protection**: If OpenAI returns 429 or 503, the backend seamlessly swaps to the deterministic signal synthesizer.

---

## Future Improvements

- **Real-Time WebSocket Pipeline**: Socket.io integration for instant tick broadcasts without page refreshes.
- **Push & Telegram Notifications**: Webhook delivery for Significant (Score ≥ 65) attention events.
- **Options & Derivative Flow**: Incorporating Put/Call ratios and open interest shifts into the attention engine.
- **Portfolio Weight Integration**: Adjusting attention scores dynamically based on the user's actual monetary exposure to each stock.

---

## Limitations

- **Free-Tier API Rate Limits**: Twelve Data free tier allows 8 API credits per minute; production deployments require enterprise market data feeds.
- **Intraday vs. Historical Coverage**: NewsAPI free tier indexes articles from the past 30 days.
- **Non-Advisory Scope**: FinSmart is an informational and diagnostic tool; it does not execute automated trades or provide regulated investment advice.

---

<p align="center">
  <b>FinSmart</b> — Know what changed. Know why it matters.<br/>
  Built with ❤️ for intelligent investors.
</p>
