from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agents.market_agent import run_agent
import yfinance as yf


app = FastAPI(title="MarketValve API")

@app.get("/stocks")
async def get_stocks():
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
        {"ticker": "TATAmotors.NS", "name": "Tata Motors"},  # fixed ticker
    ]
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
                "positive": bool(change >= 0)  # force Python bool not numpy bool
            })
        except Exception as e:
            print(f"Skipping {s['ticker']}: {e}")
            continue
    return results

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class Query(BaseModel):
    message: str
    portfolio: list = []

@app.post("/chat")
async def chat(query: Query):
    response = run_agent(query.message, query.portfolio)
    return {"response": response}

@app.get("/health")
async def health():
    return {"status": "ok", "service": "MarketValve API"}