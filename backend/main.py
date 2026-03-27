from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agents.market_agent import run_agent
import yfinance as yf
from tools.opportunity_radar import fetch_nse_direct_deals, fetch_market_news, detect_signals
from datetime import datetime
import math
from curl_cffi import requests

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
    {"ticker": "TATAmotors.NS", "name": "Tata Motors"},
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

def fetch_all_nifty50_live():
    """Fetches all 50 Nifty stocks in a single request from the NSE Index Tracker."""
    try:
        session = requests.Session(impersonate="chrome")
        headers = {
            "accept": "application/json, text/javascript, */*; q=0.01",
            "referer": "https://www.nseindia.com/market-data/live-equity-market",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36"
        }
        
        session.get("https://www.nseindia.com", headers=headers, timeout=10)
        
        url = "https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%2050"
        res = session.get(url, headers=headers, timeout=10)
        
        if res.status_code == 200:
            payload = res.json()
            raw_data = payload.get("data", [])
            
            results = []
            for item in raw_data:
                symbol = item.get("symbol")
                if symbol == "NIFTY 50":
                    continue
                    
                current_price = item.get("lastPrice", 0)
                change_pct = item.get("pChange", 0)
                
                try:
                    cp = float(change_pct)
                except (ValueError, TypeError):
                    cp = 0.0
                
                results.append({
                    "ticker": symbol,
                    "name": symbol,
                    "price": str(current_price),
                    "change": str(round(cp, 2)), 
                    "positive": bool(cp >= 0)
                })
            
            return results
        else:
            print(f"Failed to fetch Index Tracker. Status: {res.status_code}")
            
    except Exception as e:
        print(f"Index Tracker fetch error: {e}")
        
    return []

@app.get("/stocks")
async def get_stocks():
    results = fetch_all_nifty50_live()
    
    if not results:
        print("NSE API empty, falling back to empty list.")
        return []
        
    return results

@app.get("/radar")
async def get_radar(stock: str = "ALL"):
    nse_data = fetch_nse_direct_deals(stock.upper())
    articles = fetch_market_news()
    signals = detect_signals(articles, "" if stock == "ALL" else stock.upper())
    return {
        "date": datetime.now().strftime("%d %b %Y"),
        "nse_deals": nse_data,
        "signals": signals,
        "total_signals": len(signals)
    }

def fetch_all_indices_live():
    """Fetches all major indices in a single request from the NSE."""
    try:
        from curl_cffi import requests 
        
        session = requests.Session(impersonate="chrome")
        headers = {
            "accept": "application/json, text/javascript, */*; q=0.01",
            "referer": "https://www.nseindia.com/market-data/live-market-indices",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36"
        }
        
        session.get("https://www.nseindia.com", headers=headers, timeout=10)
        
        url = "https://www.nseindia.com/api/allIndices"
        res = session.get(url, headers=headers, timeout=10)
        
        if res.status_code == 200:
            data = res.json().get("data", [])
            
            target_indices = {
                "NIFTY 50": "Nifty 50",
                "NIFTY BANK": "Nifty Bank",
                "NIFTY IT": "Nifty IT",
                "NIFTY NEXT 50": "Nifty Next 50"
            }
            
            results = []
            for item in data:
                nse_name = item.get("index")
                
                if nse_name in target_indices:
                    current = item.get("last", 0)
                    change_pct = item.get("percentChange", 0)
                    
                    try:
                        cp = float(change_pct)
                    except (ValueError, TypeError):
                        cp = 0.0
                    
                    results.append({
                        "name": target_indices[nse_name],
                        "value": str(current),
                        "change": str(round(cp, 2)), 
                        "positive": bool(cp >= 0)
                    })
            
            results.sort(key=lambda x: list(target_indices.values()).index(x["name"]))
            return results
            
        else:
            print(f"Failed to fetch Indices. Status: {res.status_code}")
            
    except Exception as e:
        print(f"Indices fetch error: {e}")
        
    return []

# --- Update your FastAPI route ---

@app.get("/indices")
async def get_indices():
    results = fetch_all_indices_live()
    return results

class Query(BaseModel):
    message: str
    portfolio: list = []

@app.post("/chat")
async def chat(query: Query):
    response = run_agent(query.message, query.portfolio)
    return {"response": response}