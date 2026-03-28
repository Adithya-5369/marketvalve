from curl_cffi import requests
from langchain_core.tools import tool

# Reusable NSE session helper
def _nse_session():
    session = requests.Session(impersonate="chrome")
    headers = {
        "accept": "application/json, text/javascript, */*; q=0.01",
        "referer": "https://www.nseindia.com/get-quotes/equity?symbol=RELIANCE",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36",
    }
    # Hit homepage first to get cookies
    session.get("https://www.nseindia.com", headers=headers, timeout=10)
    return session, headers


# Common index name → NSE API index name
INDEX_MAP = {
    "NIFTY": "NIFTY 50",
    "NIFTY50": "NIFTY 50",
    "SENSEX": "SENSEX",
    "BANKNIFTY": "NIFTY BANK",
    "NIFTYBANK": "NIFTY BANK",
    "NIFTYIT": "NIFTY IT",
    "NIFTYPHARMA": "NIFTY PHARMA",
    "NIFTYMIDCAP": "NIFTY MIDCAP 50",
}


def _fetch_index(clean: str) -> str | None:
    """Try fetching as an index from NSE allIndices API."""
    nse_name = INDEX_MAP.get(clean)
    if not nse_name:
        return None

    try:
        session, headers = _nse_session()
        res = session.get(
            "https://www.nseindia.com/api/allIndices",
            headers=headers,
            timeout=10,
        )
        if res.status_code != 200:
            return None

        for item in res.json().get("data", []):
            if item.get("index") == nse_name:
                last = item.get("last", 0)
                change = item.get("percentChange", 0)
                prev_close = item.get("previousClose", 0)
                abs_change = round(float(last) - float(prev_close), 2)
                arrow = "▲" if float(change) >= 0 else "▼"

                return (
                    f"[NSE Live Index Data]\n"
                    f"Index: {nse_name}\n"
                    f"Value: ₹{last:,}\n"
                    f"Change: {arrow} ₹{abs(abs_change)} ({float(change):+.2f}%)\n"
                    f"Previous Close: ₹{prev_close:,}\n"
                    f"Source: NSE India (Real-time)"
                )
    except Exception:
        pass
    return None


def _fetch_stock(clean: str) -> str | None:
    """Fetch a single stock quote from NSE quote API."""
    try:
        session, headers = _nse_session()
        url = f"https://www.nseindia.com/api/quote-equity?symbol={clean}"
        res = session.get(url, headers=headers, timeout=10)

        if res.status_code != 200:
            return None

        data = res.json()
        info = data.get("priceInfo", {})
        meta = data.get("info", {})

        last_price = info.get("lastPrice", 0)
        change = info.get("change", 0)
        change_pct = info.get("pChange", 0)
        prev_close = info.get("previousClose", 0)
        open_price = info.get("open", 0)
        day_high = info.get("intraDayHighLow", {}).get("max", 0)
        day_low = info.get("intraDayHighLow", {}).get("min", 0)
        volume = data.get("securityWiseDP", {}).get("quantityTraded", "N/A")
        company = meta.get("companyName", clean)

        arrow = "▲" if float(change) >= 0 else "▼"

        return (
            f"[NSE Live Data]\n"
            f"Company: {company}\n"
            f"Symbol: {clean}\n"
            f"Price: ₹{last_price}\n"
            f"Change: {arrow} ₹{abs(float(change)):.2f} ({float(change_pct):+.2f}%)\n"
            f"Open: ₹{open_price} | High: ₹{day_high} | Low: ₹{day_low}\n"
            f"Previous Close: ₹{prev_close}\n"
            f"Volume: {volume}\n"
            f"Source: NSE India (Real-time)"
        )
    except Exception:
        pass
    return None


@tool
def price_fetch(ticker: str) -> str:
    """
    Fetches current price, percentage change, and volume for any NSE stock or index.
    Handles stocks (RELIANCE, TCS, HDFCBANK) and indices (NIFTY50, SENSEX, BANKNIFTY).
    Automatically figures out the correct symbol format.
    Example input: RELIANCE, NIFTY50, SENSEX, BANKNIFTY, TCS
    """
    try:
        clean = (
            ticker.upper()
            .strip()
            .replace(".NS", "")
            .replace(".BSE", "")
            .replace(" ", "")
        )

        # 1) Try as index first
        result = _fetch_index(clean)
        if result:
            return result

        # 2) Try as stock
        result = _fetch_stock(clean)
        if result:
            return result

        return f"No data found for '{ticker}'. Please check if it's a valid NSE stock or index symbol."

    except Exception as e:
        return f"Error fetching {ticker}: {str(e)}"