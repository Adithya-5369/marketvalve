from curl_cffi import requests
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agents.market_agent import run_agent
import yfinance as yf
import ta as ta_lib
import numpy as np
from tools.opportunity_radar import (
    fetch_nse_direct_deals, fetch_market_news, detect_signals,
    fetch_corporate_filings, fetch_insider_trades, fetch_quarterly_results,
    fetch_management_commentary
)
from datetime import datetime, timezone, timedelta
from tools.mutual_funds import search_mutual_funds, get_fund_nav, analyze_fund_portfolio

IST = timezone(timedelta(hours=5, minutes=30))

def safe_float(x):
    try:
        return float(x) if x == x else None  # NaN check
    except:
        return None

def safe_int(x):
    try:
        return int(x) if x == x else 0
    except:
        return 0

app = FastAPI(title="MarketValve API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://marketvalve.vercel.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)



def fetch_nse_quote(symbol: str):
    """Fetch real-time quote directly from NSE."""
    try:
        session = requests.Session(impersonate="chrome")
        headers = {
            "accept": "application/json, text/javascript, */*; q=0.01",
            "referer": f"https://www.nseindia.com/get-quotes/equity?symbol={symbol}",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36"
        }
        session.get("https://www.nseindia.com", headers=headers, timeout=10)
        url = f"https://www.nseindia.com/api/quote-equity?symbol={symbol.upper()}"
        res = session.get(url, headers=headers, timeout=10)
        
        if res.status_code == 200:
            data = res.json()
            price_info = data.get("priceInfo", {})
            return {
                "status": "success",
                "symbol": symbol.upper(),
                "price": price_info.get("lastPrice", 0),
                "change": price_info.get("change", 0),
                "change_pct": price_info.get("pChange", 0),
                "volume": data.get("securityWiseDP", {}).get("quantityTraded", 0)
            }
    except Exception as e:
        print(f"NSE Quote fetch error for {symbol}: {e}")
    return None

@app.get("/quote/{symbol}")
async def get_quote(symbol: str):
    """Get live price for a single NSE stock."""
    # Try NSE Direct first for 100% accuracy
    nse_data = fetch_nse_quote(symbol)
    if nse_data:
        return nse_data
        
    # Fallback to yfinance if NSE is blocked/down
    ticker = symbol.upper()
    if not ticker.endswith(".NS"):
        ticker += ".NS"
    try:
        t = yf.Ticker(ticker)
        hist = t.history(period="2d")
        if hist.empty:
            return {"status": "error", "message": f"No data for {symbol}"}
        price = safe_float(hist["Close"].iloc[-1])
        prev = safe_float(hist["Close"].iloc[-2]) if len(hist) > 1 else price
        change = round(price - prev, 2) if price and prev else 0
        change_pct = round((change / prev) * 100, 2) if prev else 0
        return {
            "status": "success", "symbol": symbol.upper().replace(".NS", ""),
            "price": round(price, 2) if price else 0, "change": change,
            "change_pct": change_pct
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


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
    {"ticker": "TMPV.NS", "name": "Tata Motors Passenger Vhcls Ltd"},
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


def _fetch_nse_market_status() -> dict | None:
    """Query NSE's own marketStatus API for real-time trading state."""
    try:
        session = requests.Session(impersonate="chrome")
        headers = {
            "accept": "application/json, text/javascript, */*; q=0.01",
            "referer": "https://www.nseindia.com",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36",
        }
        session.get("https://www.nseindia.com", headers=headers, timeout=10)
        res = session.get(
            "https://www.nseindia.com/api/marketStatus",
            headers=headers,
            timeout=10,
        )
        if res.status_code == 200:
            data = res.json()
            market_state = data.get("marketState", [])
            # Find the "Capital Market" (equity) entry
            for entry in market_state:
                market = entry.get("market", "")
                if "Capital" in market or "Equity" in market:
                    status_text = entry.get("marketStatus", "").strip()
                    trade_date = entry.get("tradeDate", "")
                    is_open = status_text.lower() in (
                        "open",
                        "normal market open",
                        "pre open",
                        "pre-open",
                    )
                    reason = None
                    if "close" in status_text.lower():
                        reason = entry.get("marketStatusMessage", None)
                    return {
                        "is_open": is_open,
                        "status": status_text,
                        "trade_date": trade_date,
                        "reason": reason,
                    }
    except Exception as e:
        print(f"NSE marketStatus API error: {e}")
    return None


def _fallback_market_status() -> dict:
    """Fallback: determine market status from IST time + weekday."""
    now = datetime.now(IST)
    day = now.weekday()  # 0=Mon … 6=Sun
    hour, minute = now.hour, now.minute

    is_weekend = day >= 5
    minutes_since_midnight = hour * 60 + minute
    market_open_min = 9 * 60 + 15   # 09:15
    market_close_min = 15 * 60 + 30  # 15:30

    is_live = (
        not is_weekend
        and market_open_min <= minutes_since_midnight <= market_close_min
    )

    if is_weekend:
        reason = "Weekend"
    elif minutes_since_midnight < market_open_min:
        reason = "Pre-market"
    elif minutes_since_midnight > market_close_min:
        reason = "After hours"
    else:
        reason = None

    return {
        "is_open": is_live,
        "status": "Open" if is_live else "Closed",
        "trade_date": now.strftime("%d-%b-%Y"),
        "reason": reason,
    }


@app.get("/market-status")
async def get_market_status():
    """Dynamic market status — queries NSE first, falls back to IST time check."""
    nse = _fetch_nse_market_status()
    result = nse if nse else _fallback_market_status()
    result["timestamp"] = datetime.now(IST).isoformat()
    return result

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
    query = stock.upper()
    nse_data = fetch_nse_direct_deals(query)
    articles = fetch_market_news()
    signals = detect_signals(articles, "" if stock == "ALL" else query)
    filings = fetch_corporate_filings(query)
    insider = fetch_insider_trades(query)
    results = fetch_quarterly_results(query)
    commentary = fetch_management_commentary(query)
    return {
        "date": datetime.now().strftime("%d %b %Y"),
        "nse_deals": nse_data,
        "signals": signals,
        "total_signals": len(signals),
        "corporate_filings": filings,
        "insider_trades": insider,
        "quarterly_results": results,
        "management_commentary": commentary,
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

@app.get("/chart/{ticker}")
async def get_chart_data(ticker: str, period: str = "3mo"):
    """Fetch historical chart data with technical indicators."""
    try:
        clean = ticker.upper().replace(".NS", "")
        stock = yf.Ticker(f"{clean}.NS")
        df = stock.history(period=period)
        if df.empty:
            return {"error": "No data found"}
        df['SMA_20'] = ta_lib.trend.SMAIndicator(close=df['Close'], window=20).sma_indicator()
        df['SMA_50'] = ta_lib.trend.SMAIndicator(close=df['Close'], window=50).sma_indicator()
        bb = ta_lib.volatility.BollingerBands(close=df['Close'], window=20)
        df['BBU_20'] = bb.bollinger_hband()
        df['BBL_20'] = bb.bollinger_lband()
        df['RSI_14'] = ta_lib.momentum.RSIIndicator(close=df['Close'], window=14).rsi()

        dates = df.index.strftime("%Y-%m-%d").tolist()

        return {
            "ticker": clean,
            "dates": dates,
            "ohlc": {
                "open":  [safe_float(x) for x in df['Open']],
                "high":  [safe_float(x) for x in df['High']],
                "low":   [safe_float(x) for x in df['Low']],
                "close": [safe_float(x) for x in df['Close']],
            },
            "volume": [safe_int(x) for x in df['Volume']],
            "sma20":  [safe_float(x) for x in df['SMA_20'].tolist()],
            "sma50":  [safe_float(x) for x in df['SMA_50'].tolist()],
            "bb_upper": [safe_float(x) for x in df['BBU_20'].tolist()],
            "bb_lower": [safe_float(x) for x in df['BBL_20'].tolist()],
            "rsi": [safe_float(x) for x in df['RSI_14'].tolist()],
        }
    except Exception as e:
        return {"error": str(e)}


@app.get("/indices")
async def get_indices():
    results = fetch_all_indices_live()
    return results

class Query(BaseModel):
    message: str
    portfolio: list = []
    history: list = []

@app.post("/chat")
async def chat(query: Query):
    result = run_agent(query.message, query.portfolio, query.history)
    return result




def fetch_nse_stock_list(index_name: str = "NIFTY 200") -> list:
    """Fetch stock symbols from any NSE index dynamically."""
    try:
        session = requests.Session(impersonate="chrome")
        headers = {
            "accept": "application/json",
            "referer": "https://www.nseindia.com/market-data/live-equity-market",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0"
        }
        session.get("https://www.nseindia.com", headers=headers, timeout=10)
        
        index_encoded = index_name.replace(" ", "%20")
        url = f"https://www.nseindia.com/api/equity-stockIndices?index={index_encoded}"
        res = session.get(url, headers=headers, timeout=15)
        
        if res.status_code == 200:
            data = res.json().get("data", [])
            symbols = []
            for item in data:
                sym = item.get("symbol", "")
                if sym and sym != index_name:
                    symbols.append(sym)
            return symbols
    except Exception as e:
        print(f"NSE stock list fetch error: {e}")
    return []


@app.get("/scan")
async def scan_nse_universe(scope: str = "nifty200"):
    """Scan NSE stocks for technical pattern signals."""
    # Map scope to NSE index name
    index_map = {
        "nifty50":     "NIFTY 50",
        "banknifty":   "NIFTY BANK",
        "finnifty":    "NIFTY FIN SERVICE",
        "midcapnifty": "NIFTY MIDCAP 50",
    }
    index_name = index_map.get(scope.lower(), "NIFTY 200")
    tickers = fetch_nse_stock_list(index_name)
    

    if not tickers:
        print(f"NSE API failed for {index_name}, falling back to robust Nifty 50 defaults")
        tickers = [s["ticker"].replace(".NS", "") for s in NIFTY_STOCKS]

    alerts = []
    scanned = 0
    errors = 0

    for symbol in tickers:
        try:
            stock = yf.Ticker(symbol + ".NS")
            df = stock.history(period="3mo")
            if df.empty or len(df) < 20:
                continue

            scanned += 1
            price = round(float(df['Close'].iloc[-1]), 2)

            # Calculate indicators
            df['RSI_14'] = ta_lib.momentum.RSIIndicator(close=df['Close'], window=14).rsi()
            macd_ind = ta_lib.trend.MACD(close=df['Close'])
            df['MACD_12_26_9'] = macd_ind.macd()
            df['MACDs_12_26_9'] = macd_ind.macd_signal()
            df['SMA_20'] = ta_lib.trend.SMAIndicator(close=df['Close'], window=20).sma_indicator()
            df['SMA_50'] = ta_lib.trend.SMAIndicator(close=df['Close'], window=50).sma_indicator()

            rsi = float(df['RSI_14'].iloc[-1]) if not np.isnan(df['RSI_14'].iloc[-1]) else None
            macd_val = float(df['MACD_12_26_9'].iloc[-1]) if not np.isnan(df['MACD_12_26_9'].iloc[-1]) else None
            signal_val = float(df['MACDs_12_26_9'].iloc[-1]) if not np.isnan(df['MACDs_12_26_9'].iloc[-1]) else None
            sma20 = float(df['SMA_20'].iloc[-1]) if not np.isnan(df['SMA_20'].iloc[-1]) else None
            sma50 = float(df['SMA_50'].iloc[-1]) if not np.isnan(df['SMA_50'].iloc[-1]) else None

            signals_found = []

            # Technical Analysis Signals
            if rsi and rsi < 30:
                signals_found.append({"type": "RSI Oversold", "detail": f"RSI: {round(rsi, 1)}", "direction": "bullish"})
            elif rsi and rsi > 70:
                signals_found.append({"type": "RSI Overbought", "detail": f"RSI: {round(rsi, 1)}", "direction": "bearish"})

            # MACD crossover
            if macd_val and signal_val:
                prev_macd = float(df['MACD_12_26_9'].iloc[-2]) if not np.isnan(df['MACD_12_26_9'].iloc[-2]) else None
                prev_signal = float(df['MACDs_12_26_9'].iloc[-2]) if not np.isnan(df['MACDs_12_26_9'].iloc[-2]) else None
                if prev_macd and prev_signal:
                    if prev_macd < prev_signal and macd_val > signal_val:
                        signals_found.append({"type": "MACD Bullish Cross", "detail": "MACD crossed above signal", "direction": "bullish"})
                    elif prev_macd > prev_signal and macd_val < signal_val:
                        signals_found.append({"type": "MACD Bearish Cross", "detail": "MACD crossed below signal", "direction": "bearish"})

            # Golden/Death cross
            if sma20 and sma50:
                prev_sma20 = float(df['SMA_20'].iloc[-2]) if not np.isnan(df['SMA_20'].iloc[-2]) else None
                prev_sma50 = float(df['SMA_50'].iloc[-2]) if not np.isnan(df['SMA_50'].iloc[-2]) else None
                if prev_sma20 and prev_sma50:
                    if prev_sma20 < prev_sma50 and sma20 > sma50:
                        signals_found.append({"type": "Golden Cross", "detail": "20 SMA crossed above 50 SMA", "direction": "bullish"})
                    elif prev_sma20 > prev_sma50 and sma20 < sma50:
                        signals_found.append({"type": "Death Cross", "detail": "20 SMA crossed below 50 SMA", "direction": "bearish"})

            # Volume spike
            avg_vol = float(df['Volume'].tail(20).mean())
            latest_vol = float(df['Volume'].iloc[-1])
            if avg_vol > 0 and latest_vol > avg_vol * 2:
                signals_found.append({"type": "Volume Spike", "detail": f"{round(latest_vol / avg_vol, 1)}x average", "direction": "neutral"})

            # Breakout / Breakdown
            high_20 = float(df['High'].tail(20).max())
            low_20 = float(df['Low'].tail(20).min())
            if price >= high_20 * 0.99:
                signals_found.append({"type": "Breakout", "detail": f"Near 20-day high ₹{round(high_20, 2)}", "direction": "bullish"})
            elif price <= low_20 * 1.01:
                signals_found.append({"type": "Breakdown", "detail": f"Near 20-day low ₹{round(low_20, 2)}", "direction": "bearish"})

            if signals_found:
                alerts.append({
                    "symbol": symbol,
                    "price": price,
                    "rsi": round(rsi, 1) if rsi else None,
                    "signals": signals_found,
                })

        except Exception as e:
            errors += 1
            continue


    return {
        "date": datetime.now().strftime("%d %b %Y %H:%M"),
        "scope": index_name,
        "total_in_universe": len(tickers),
        "scanned": scanned,
        "errors": errors,
        "total_alerts": len(alerts),
        "alerts": sorted(alerts, key=lambda x: len(x["signals"]), reverse=True),
    }




@app.get("/mf/search")
async def mf_search(q: str = ""):
    if not q:
        return []
    return search_mutual_funds(q)

@app.get("/mf/nav/{scheme_code}")
async def mf_nav(scheme_code: str):
    return get_fund_nav(scheme_code)

class MFPortfolio(BaseModel):
    holdings: list = []

@app.post("/mf/analyze")
async def mf_analyze(portfolio: MFPortfolio):
    return analyze_fund_portfolio(portfolio.holdings)
