import yfinance as yf
from langchain.tools import tool

@tool
def price_fetch(ticker: str) -> str:
    """
    Fetches current price, percentage change, and volume for any NSE stock or index.
    Handles stocks (RELIANCE, TCS, HDFCBANK) and indices (NIFTY50, SENSEX, BANKNIFTY).
    Automatically figures out the correct symbol format.
    Example input: RELIANCE, NIFTY50, SENSEX, BANKNIFTY, TCS
    """
    try:
        clean = ticker.upper().strip().replace(".NS", "").replace(".BSE", "").replace(" ", "")

        # All possible symbol formats to try in order
        candidates = [
            f"^{clean}",           # index format: ^NSEI, ^BSESN
            f"{clean}.NS",         # NSE stock
            f"^NSE{clean}",        # alternate index
            clean,                 # raw symbol
        ]

        # Common name → symbol hints
        name_hints = {
            "NIFTY50": "^NSEI",
            "NIFTY": "^NSEI",
            "SENSEX": "^BSESN",
            "BSE": "^BSESN",
            "BANKNIFTY": "^NSEBANK",
            "NIFTYBANK": "^NSEBANK",
            "NIFTYMIDCAP": "^NSEMDCP50",
            "NIFTYIT": "^CNXIT",
            "NIFTYPHARMA": "^CNXPHARMA",
        }

        # If there's a known hint, try it first
        if clean in name_hints:
            candidates = [name_hints[clean]] + candidates

        hist = None
        used_symbol = None
        for symbol in candidates:
            try:
                stock = yf.Ticker(symbol)
                h = stock.history(period="2d")
                if not h.empty:
                    hist = h
                    used_symbol = symbol
                    break
            except Exception:
                continue

        if hist is None or hist.empty:
            return f"No data found for '{ticker}'. Please check if it's a valid NSE stock or index symbol."

        current = round(hist['Close'].iloc[-1], 2)
        prev = round(hist['Close'].iloc[-2], 2) if len(hist) > 1 else current
        change = round(current - prev, 2)
        change_pct = round(((current - prev) / prev) * 100, 2)
        volume = int(hist['Volume'].iloc[-1])
        arrow = "▲" if change >= 0 else "▼"

        return (
            f"[NSE Data]\n"
            f"Symbol: {clean} ({used_symbol})\n"
            f"Price: ₹{current}\n"
            f"Change: {arrow} ₹{abs(change)} ({change_pct:+.2f}%)\n"
            f"Volume: {volume:,}\n"
            f"Source: NSE via yfinance (15-min delay)"
        )
    except Exception as e:
        return f"Error fetching {ticker}: {str(e)}"