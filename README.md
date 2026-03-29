<p align="center">
  <h1 align="center">🚀 MarketValve - AI Investor Copilot</h1>
  <p align="center">
    <strong>Next-Gen Financial Intelligence for Indian Investors</strong><br/>
    Built for the <strong>ET Gen AI Hackathon 2026</strong>
  </p>
  <p align="center">
    <a href="https://marketvalve.vercel.app">🌐 Live Demo</a> •
    <a href="https://adithya5369-marketvalve-api-prod.hf.space/docs">📡 API Docs</a>
  </p>
</p>

---

## 📋 Problem Statement

**PS6 - AI for the Indian Investor:** India has 14 crore+ demat accounts, but most retail investors are flying blind — reacting to tips, missing filings, unable to read technicals, and managing mutual fund portfolios on gut feel. ET Markets has the data. Build the intelligence layer that turns data into actionable, money-making decisions.

---

## 🎯 What is MarketValve?

MarketValve is a **full-stack AI investor copilot** that combines:

- 🤖 **Multi-step AI reasoning** powered by Sarvam AI (Indian LLM)
- 📊 **Live NSE market data** - prices, indices, bulk/block deals, insider trades, corporate filings
- 🔍 **AI sentiment analysis** on ET Markets & Moneycontrol news articles
- 📈 **Technical chart intelligence** - candlestick charts, RSI, MACD, Bollinger Bands, SMA crossovers
- **Portfolio-aware AI** - personalized insights based on your holdings
- **Source-cited responses** - every AI answer includes data provenance
- **Secure Persistence** - automatic sign-out on tab closure with "Leave site?" guards

> **Key differentiator:** Unlike generic chatbots, MarketValve chains multiple data tools in sequence (multi-step reasoning) to deliver comprehensive, portfolio-aware analysis with full source citations.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (Next.js)                │
│  Vercel • React 19 • TailwindCSS • shadcn/ui       │
│  Firebase Auth • Firestore (user data persistence)  │
├─────────────────────────────────────────────────────┤
│                      ↕ REST API                     │
├─────────────────────────────────────────────────────┤
│                  BACKEND (FastAPI)                   │
│  Hugging Face Spaces • Python 3.11 • Uvicorn        │
├───────────┬───────────┬───────────┬─────────────────┤
│ Sarvam AI │ NSE India │  Yahoo    │  ET Markets &   │
│  (LLM)    │  (Live)   │  Finance  │  Moneycontrol   │
└───────────┴───────────┴───────────┴─────────────────┘
```

---

## ✨ Features

### 🤖 AI Chat - Multi-Step Reasoning Engine
- Conversational AI powered by **Sarvam 105B** (Indian LLM)
- Chains up to **8 tools sequentially** for deep analysis
- Portfolio-aware: references your holdings in responses
- Multi-turn conversation with history context
- Full-page AI chat + floating chat widget

### 📊 Dashboard - Live Market Overview
- Real-time **Nifty 50, Sensex, Bank Nifty, Nifty IT** indices
- Top & worst performing NSE stocks (live)
- Auto-refreshing every 10 seconds during market hours
- Market open/closed status detection (IST-aware)

### 🎯 Opportunity Radar - Deal Intelligence
- **NSE bulk/block deals** - institutional buying & selling
- **Insider trading disclosures** - SAST/PIT data from NSE
- **Corporate filings** - board meetings, AGMs, announcements
- **Quarterly results** - revenue, profit, EPS
- **Management commentary** - investor presentations, earnings calls
- **AI sentiment signals** from ET Markets & Moneycontrol news

### 📈 Chart Pattern Intelligence
- Interactive **candlestick charts** via Plotly.js
- Technical indicators: **SMA 20/50, Bollinger Bands, RSI (14)**
- AI-generated **signal detection**: Golden Cross, Death Cross, RSI zones
- Period selection: 1M / 3M / 6M / 1Y
- AI-powered pattern analysis narrative

### 🔍 Universe Scanner
- Scans entire **Nifty 50 / Bank Nifty / Fin Nifty / Midcap Nifty ** universe
- Detects: RSI oversold/overbought, MACD crossovers, SMA crossovers, volume spikes, breakouts/breakdowns
- Click any result to view its full chart analysis

### 💼 Portfolio Tracker
- **Stocks**: Add NSE holdings manually, track live P&L and corporate actions
- **Mutual Funds**: Search 40,000+ schemes via MFAPI.in, track NAV & returns
- **Live Sync**: Data persisted via **Firebase Firestore** (per-user) and live-synced to the AI Copilot

### 👁️ Watchlist & Price Alerts
- Custom stock watchlist with live prices
- Price alert system - set above/below targets
- Quick-add popular NSE stocks

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 15, React 19, TypeScript | App framework |
| **Styling** | Vanilla CSS + Tailwind, shadcn/ui | UI components |
| **Charts** | Plotly.js, Recharts | Interactive visualizations |
| **Auth** | Firebase Auth (Session-based) | Secure Google & Email Login |
| **Security** | beforeunload + Persistence Guard | Tab closure & redirect logic |
| **Database** | Firebase Firestore | User data persistence |
| **Backend** | FastAPI, Python 3.11, Uvicorn | REST API server |
| **AI/LLM** | Sarvam AI (sarvam-105b) | Indian LLM for analysis |
| **AI Framework** | LangChain (tool calling) | Multi-step agent orchestration |
| **RAG** | FAISS + HuggingFace Embeddings | News retrieval & context |
| **Market Data** | NSE India API, Yahoo Finance | Live prices & historical data |
| **News** | ET Markets, Moneycontrol | Sentiment analysis source |
| **Technical Analysis** | `ta` library (Python) | RSI, MACD, Bollinger, SMA |
| **Mutual Funds** | MFAPI.in (free, no key) | NAV data for 40K+ schemes |
| **Broker** | Angel One SmartAPI | Live portfolio import |
| **Deployment** | Vercel (frontend), HF Spaces (backend) | Production hosting |

---

## 📁 Project Structure

```
marketvalve/
├── backend/                    # FastAPI Backend
│   ├── main.py                 # API routes (15+ endpoints)
│   ├── requirements.txt        # Python dependencies
│   ├── agents/
│   │   └── market_agent.py     # Sarvam AI agent with multi-step reasoning
│   ├── tools/
│   │   ├── price_fetch.py      # Live NSE price fetcher
│   │   ├── opportunity_radar.py # Deals, filings, insider trades, sentiment
│   │   ├── chart_pattern.py    # Technical analysis engine
│   │   ├── new_rag.py          # News RAG (ET Markets + Moneycontrol)
│   │   └── mutual_funds.py     # MF search, NAV, portfolio analysis
│   └── rag/
│       ├── news_fetcher.py     # Web scraping for financial news
│       └── vector_store.py     # FAISS vector store for RAG
│
├── frontend/                   # Next.js Frontend
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Dashboard (home)
│   │   ├── ai/                 # AI Chat full-page
│   │   ├── market-signals/     # Market Signals
│   │   ├── chart-analysis/     # Chart Analysis Intelligence
│   │   ├── portfolio/          # Portfolio (stocks + MF)
│   │   ├── radar/              # Opportunity Radar
│   │   ├── scanner/            # Universe Scanner
│   │   ├── watchlist/          # Watchlist & Price Alerts
│   │   └── settings/           # User settings
│   ├── components/
│   │   ├── pages/              # Page-level components (18 files)
│   │   ├── ui/                 # shadcn/ui primitives
│   │   ├── AIChat.tsx          # Floating AI chat widget
│   │   ├── auth-provider.tsx   # Firebase auth context
│   │   ├── dashboard-content.tsx
│   │   ├── alerts-panel.tsx    # Opportunity Radar panel
│   │   ├── alerts-history.tsx  # Signal history table
│   │   ├── watchlist-stocks.tsx
│   │   └── watchlist-alerts.tsx
│   ├── lib/
│   │   ├── api.ts              # Centralized backend URL config
│   │   ├── firebase.ts         # Firebase initialization
│   │   ├── firestore.ts        # Firestore CRUD helpers
│   │   └── stockData.ts        # Stock data fetcher
│   └── .env.local              # Environment variables
│
└── README.md                   # This file
```

---

## ⚖️ Regulatory & SEBI Compliance Roadmap

MarketValve is built as an educational prototype for the **ET Gen AI Hackathon**. Understanding the strict regulatory landscape of Indian fintech, we have designed our architecture with SEBI compliance in mind:

* **White Box vs. Black Box:** To align with SEBI's latest algorithmic trading and AI guidelines, our Universe Scanner relies entirely on transparent, standard mathematical formulas (e.g., SMA 20/50 crossovers, RSI levels) rather than black-box proprietary logic.
* **Descriptive vs. Prescriptive AI:** While the hackathon prototype may demonstrate signal routing using terms like "Buy/Sell" for clarity of logic flow, our production roadmap involves locking the Sarvam AI system prompts to strictly use descriptive technical vocabulary (e.g., "Bullish/Bearish momentum", "Overbought/Oversold"). 
* **Disclaimer:** This platform is strictly for educational and demonstration purposes. We are not SEBI-registered Investment Advisers (RIA) or Research Analysts (RA). The AI outputs, sentiment analysis, and chart patterns do not constitute financial advice.

---

## 🚀 Getting Started

### 📦 Database & Authentication Setup

MarketValve uses **Firebase** for secure user authentication and **Cloud Firestore** for persisting portfolio data across devices.

#### 1. Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/) and click **Add Project**.
2. Give it a name (e.g., `MarketValve-AI`) and follow the setup wizard.

#### 2. Enable Authentication
1. In the left sidebar, click **Build** → **Authentication**.
2. Click **Get Started** and enable **Google** under the "Sign-in method" tab.
3. Configure your support email and click **Save**.

#### 3. Setup Cloud Firestore
1. In the left sidebar, click **Build** → **Firestore Database**.
2. Click **Create Database**.
3. Choose a location close to you (e.g., `asia-south1` for India).
4. Start in **Production Mode**.
5. Click **Rules** and update them to allow users to access only their own data:
   ```js
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId}/{document=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```
   *Note: Our code uses the structure `users/{uid}/data/{collection_name}`.*

#### 4. Get Your Config Variables
1. Click the **Project Settings** (gear icon) → **General**.
2. Scroll to "Your apps" and click the **Web icon (</>)**.
3. Register your app (e.g., `marketvalve-web`).
4. Copy the `firebaseConfig` values into your `frontend/.env.local` file.

---

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.11+
- **Sarvam AI API Key** - [Get one free at sarvam.ai](https://www.sarvam.ai/)
- **Firebase Project** - for authentication & Firestore

### 1. Clone the Repository
```bash
git clone https://github.com/Adithya-5369/marketvalve.git
cd marketvalve
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo SARVAM_API_KEY=your_sarvam_api_key_here > .env

# Start the server
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`. Swagger docs at `/docs`.

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create .env.local with your config
# (see .env.local.example below)

# Start dev server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Environment Variables

**Backend (`.env`)**
```env
SARVAM_API_KEY=your_sarvam_api_key
```

**Frontend (`.env.local`)**
```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check |
| `GET` | `/stocks` | All Nifty 50 stocks (live prices) |
| `GET` | `/indices` | Market indices (Nifty 50, Sensex, Bank Nifty, Nifty IT) |
| `GET` | `/quote/{symbol}` | Single stock quote with price, change, volume, market cap |
| `GET` | `/chart/{ticker}` | OHLCV + technical indicators (SMA, BB, RSI) |
| `GET` | `/radar?stock=ALL` | Opportunity radar - deals, filings, insider trades, sentiment |
| `GET` | `/scan?scope=nifty50` | Universe scanner - technical signal detection |
| `POST` | `/chat` | AI chat - multi-step reasoning with portfolio context |
| `GET` | `/mf/search?q=` | Search mutual funds (40K+ schemes) |
| `GET` | `/mf/nav/{code}` | Get mutual fund NAV |

---

## 🧠 AI Agent - How It Works

MarketValve's AI agent uses **LangChain tool calling** with Sarvam AI to perform multi-step analysis:

```
User Query: "Full analysis of RELIANCE"
    │
    ├── Step 1: price_fetch → Live price, change, volume
    ├── Step 2: chart_pattern → RSI, MACD, SMA analysis
    ├── Step 3: opportunity_radar → Bulk deals, insider trades, filings
    ├── Step 4: news_rag → Latest ET Markets/Moneycontrol news
    │
    └── Final Synthesis → Portfolio-aware response with source citations
```

**Available Tools:**
| Tool | Data Source | What It Does |
|------|-----------|--------------|
| `price_fetch` | NSE India (via yfinance) | Live stock/index prices |
| `chart_pattern` | Yahoo Finance + `ta` lib | Technical analysis with indicators |
| `opportunity_radar` | NSE India (bulk deals, filings) | Institutional activity & corporate events |
| `news_rag` | ET Markets + Moneycontrol | RAG-based news retrieval & AI sentiment |
| `get_top_mutual_funds` | MFAPI.in | Mutual fund search & NAV data |

---

## 🌐 Deployment

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | Vercel | [marketvalve.vercel.app](https://marketvalve.vercel.app) |
| Backend | Hugging Face Spaces | [adithya5369-marketvalve-api-prod.hf.space](https://adithya5369-marketvalve-api-prod.hf.space) |

---

## 🏆 Why MarketValve Wins

| Feature | ET Markets ChatGPT | MarketValve AI |
|---------|-------------------|----------------|
| Multi-step reasoning | ❌ Single query | ✅ Chains up to 8+ tools |
| Portfolio-aware | ❌ No portfolio context | ✅ References your holdings |
| Source citations | ❌ No sources | ✅ Every response cites sources |
| Live NSE data | ⚠️ Limited | ✅ Full Nifty 50/200/500 |
| Insider trades | ❌ | ✅ Direct from NSE India |
| Technical charts | ❌ | ✅ Interactive candlestick + indicators |
| Universe scanner | ❌ | ✅ Scan entire Nifty index |
| Secure Session | ⚠️ Basic | ✅ Tab closure auto-logout |
| Mutual funds | ❌ | ✅ 40,000+ schemes with NAV |
| Indian LLM | ❌ OpenAI | ✅ Sarvam AI (Indian context) |

---

## 👥 Team

- **Adithya** - Full-Stack Development, AI Integration & Architecture
- **Sasanka** - Testing & Ideation

---

## 🙏 Acknowledgments

- The frontend UI was bootstrapped from [Financial-Dashboard-32](https://github.com/Adithya-5369/Financial-Dashboard-32), a personal project by Adithya, and then heavily extended with live data integrations, AI chat, portfolio tracking, and all backend-connected features for this hackathon.
- **Sarvam AI** for providing the Indian LLM (sarvam-105b)
- **NSE India** for live market data APIs
- **MFAPI.in** for free mutual fund NAV data

---

## 📄 License

This project was built for the **ET Gen AI Hackathon 2026**. All rights reserved.

---
