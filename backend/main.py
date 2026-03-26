from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agents.market_agent import run_agent
import yfinance as yf

app = FastAPI(title="MarketValve API")

# CORS must be added FIRST before any routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

NIFTY_STOCKS = [
    {"ticker": "RELIANCE.NS", "name": "Reliance Industries"},
    {"ticker": "TCS.NS", "name": "Tata Consultancy Services"},
    {"ticker": "HDFCBANK.NS", "name": "HDFC Bank"},
    {"ticker": "INFY.NS", "name": "Infosys"},
    {"ticker": "ICICIBANK.NS", "name": "ICICI Bank"},
    {"ticker": "WIPRO.NS", "name": "Wipro"},
    {"ticker": "SBIN.NS", "name": "State Bank of India"},
    {"ticker": "BAJFINANCE.NS", "name": "Bajaj Finance"},
    {"ticker": "HINDUNILVR.NS", "name": "Hindustan Unilever"},
    {"ticker": "TATAMOTORS.NS", "name": "Tata Motors"},
    {"ticker": "ADANIENT.NS", "name": "Adani Enterprises"},
    {"ticker": "ADANIPORTS.NS", "name": "Adani Ports"},
    {"ticker": "APOLLOHOSP.NS", "name": "Apollo Hospitals"},
    {"ticker": "ASIANPAINT.NS", "name": "Asian Paints"},
    {"ticker": "AXISBANK.NS", "name": "Axis Bank"},
    {"ticker": "BAJAJ-AUTO.NS", "name": "Bajaj Auto"},
    {"ticker": "BAJAJFINSV.NS", "name": "Bajaj Finserv"},
    {"ticker": "BPCL.NS", "name": "BPCL"},
    {"ticker": "BHARTIARTL.NS", "name": "Bharti Airtel"},
    {"ticker": "BRITANNIA.NS", "name": "Britannia"},
    {"ticker": "CIPLA.NS", "name": "Cipla"},
    {"ticker": "COALINDIA.NS", "name": "Coal India"},
    {"ticker": "DIVISLAB.NS", "name": "Divi's Labs"},
    {"ticker": "DRREDDY.NS", "name": "Dr Reddy's"},
    {"ticker": "EICHERMOT.NS", "name": "Eicher Motors"},
    {"ticker": "GRASIM.NS", "name": "Grasim"},
    {"ticker": "HCLTECH.NS", "name": "HCL Tech"},
    {"ticker": "HDFCLIFE.NS", "name": "HDFC Life"},
    {"ticker": "HEROMOTOCO.NS", "name": "Hero MotoCorp"},
    {"ticker": "HINDALCO.NS", "name": "Hindalco"},
    {"ticker": "INDUSINDBK.NS", "name": "IndusInd Bank"},
    {"ticker": "ITC.NS", "name": "ITC"},
    {"ticker": "JSWSTEEL.NS", "name": "JSW Steel"},
    {"ticker": "KOTAKBANK.NS", "name": "Kotak Bank"},
    {"ticker": "LT.NS", "name": "L&T"},
    {"ticker": "M&M.NS", "name": "Mahindra & Mahindra"},
    {"ticker": "MARUTI.NS", "name": "Maruti Suzuki"},
    {"ticker": "NESTLEIND.NS", "name": "Nestle India"},
    {"ticker": "NTPC.NS", "name": "NTPC"},
    {"ticker": "ONGC.NS", "name": "ONGC"},
    {"ticker": "POWERGRID.NS", "name": "Power Grid"},
    {"ticker": "SBILIFE.NS", "name": "SBI Life"},
    {"ticker": "SHRIRAMFIN.NS", "name": "Shriram Finance"},
    {"ticker": "SUNPHARMA.NS", "name": "Sun Pharma"},
    {"ticker": "TATACONSUM.NS", "name": "Tata Consumer"},
    {"ticker": "TATASTEEL.NS", "name": "Tata Steel"},
    {"ticker": "TECHM.NS", "name": "Tech Mahindra"},
    {"ticker": "TITAN.NS", "name": "Titan"},
    {"ticker": "ULTRACEMCO.NS", "name": "UltraTech Cement"},
    {"ticker": "VEDL.NS", "name": "Vedanta"},
]

INDICES = [
    {"ticker": "^NSEI", "name": "Nifty 50"},
    {"ticker": "^BSESN", "name": "Sensex"},
    {"ticker": "^NSEBANK", "name": "Nifty Bank"},
    {"ticker": "^CNXIT", "name": "Nifty IT"},
]

@app.get("/")
async def root():
    return {"status": "MarketValve API is running"}

@app.get("/health")
async def health():
    return {"status": "ok", "service": "MarketValve API"}

@app.get("/stocks")
async def get_stocks():
    results = []
    for s in NIFTY_STOCKS:
        try:
            stock = yf.Ticker(s["ticker"])
            hist = stock.history(period="2d")
            if hist.empty:
                continue
            current = float(round(hist['Close'].iloc[-1], 2))
            prev = float(round(hist['Close'].iloc[-2], 2)) if len(hist) > 1 else current
            change = float(round(((current - prev) / prev) * 100, 2))
            results.append({
                "ticker": s["ticker"].replace(".NS", ""),
                "name": s["name"],
                "price": str(current),
                "change": str(change),
                "positive": bool(change >= 0)
            })
        except Exception as e:
            print(f"Skipping {s['ticker']}: {e}")
            continue
    return results

@app.get("/indices")
async def get_indices():
    results = []
    for idx in INDICES:
        try:
            stock = yf.Ticker(idx["ticker"])
            hist = stock.history(period="2d")
            if hist.empty:
                continue
            current = float(round(hist['Close'].iloc[-1], 2))
            prev = float(round(hist['Close'].iloc[-2], 2)) if len(hist) > 1 else current
            change = float(round(((current - prev) / prev) * 100, 2))
            results.append({
                "name": idx["name"],
                "value": current,
                "change": change
            })
        except Exception as e:
            print(f"Skipping {idx['ticker']}: {e}")
            continue
    return results

class Query(BaseModel):
    message: str
    portfolio: list = []

@app.post("/chat")
async def chat(query: Query):
    response = run_agent(query.message, query.portfolio)
    return {"response": response}