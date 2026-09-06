# FinSmart

> **Know what changed. Know why it matters.**

FinSmart is a **change-first market intelligence platform** that helps users understand what meaningfully changed in their stock watchlist since their last visit.

Instead of showing endless price movements, FinSmart detects significant changes, assigns an attention score, and explains **why the movement matters**.

## ✨ Key Features

* **While You Were Away** — See important changes since your last visit.
* **Attention Score** — Ranks events from 0–100 based on price, volume, news, anomalies, and market context.
* **Change Detection** — Identifies significant price and volume movements.
* **Anomaly Detection** — Uses statistical analysis to detect unusual market behavior.
* **AI Explanations** — Gemini explains market movements using verified stock and news data.
* **Ask FinSmart** — Ask questions about your watchlist and recent market activity.
* **Interactive Charts** — Explore price and volume movements over time.
* **Custom Alerts** — Set personal price and volume thresholds.
* **Demo Mode** — Simulate market crashes, breakouts, and API failures.
* **Fallback System** — Continues working with cached MongoDB data when external APIs are unavailable.

## 🧠 How It Works

```text
Market Data + News
        ↓
MongoDB Snapshots
        ↓
Change Detection
        ↓
Anomaly Detection
        ↓
Attention Score
        ↓
Gemini AI
        ↓
FinSmart Insights
```

## 🛠️ Tech Stack

**Frontend**

* React + Vite
* Tailwind CSS
* Recharts
* Axios

**Backend**

* Node.js
* Express.js
* MongoDB Atlas + Mongoose
* JWT Authentication

**APIs & AI**

* Twelve Data — Market data
* NewsAPI — Financial news
* Google Gemini API — AI explanations

## 📁 Project Structure

```text
FinSmart/
├── backend/
│   └── src/
│       ├── controllers/
│       ├── integrations/
│       ├── models/
│       ├── services/
│       └── routes/
│
├── src/
│   ├── components/
│   ├── context/
│   ├── pages/
│   └── services/
│
├── README.md
└── package.json
```

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd FinSmart
```

### 2. Install dependencies

```bash
npm install
cd backend
npm install
```

### 3. Configure environment variables

Create `backend/.env`:

```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
TWELVEDATA_API_KEY=your_twelve_data_key
NEWS_API_KEY=your_newsapi_key
GEMINI_API_KEY=your_gemini_key
```

### 4. Start the backend

```bash
cd backend
npm run dev
```

### 5. Start the frontend

```bash
cd ..
npm run dev
```

Open:

```text
http://localhost:5173
```

## 🎮 Demo Mode

FinSmart includes a demo environment for testing without waiting for real market movements.

You can:

* Simulate a stock crash
* Simulate a breakout
* Simulate API failure
* Reset the session to demonstrate **While You Were Away**

## 🔐 Security & Reliability

* JWT-based authentication
* Password hashing with bcrypt
* API keys stored in environment variables
* Request validation with Zod
* API rate limiting
* MongoDB snapshot fallback
* Graceful handling of external API failures
* AI fallback when Gemini is unavailable

## ⚠️ Limitations

* Market data depends on external API availability and rate limits.
* News coverage depends on NewsAPI.
* Free-tier APIs have usage limitations.
* FinSmart provides informational insights and **does not provide investment advice**.

## 🔮 Future Improvements

* Real-time WebSocket updates
* Push/Telegram notifications
* Options and derivatives data
* Portfolio-weighted attention scores

---

**FinSmart — Know what changed. Know why it matters.**
