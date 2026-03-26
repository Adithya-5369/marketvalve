import yfinance as yf
from langchain.tools import tool

@tool
def price_fetch(ticker: str) -> str:
    """
    Fetches current price, percentage change, and volume
    for any NSE stock. Always add .NS suffix automatically.
    Example input: RELIANCE, TCS, HDFCBANK, INFY
    """
    try:
        clean = ticker.upper().replace(".NS", "").replace(".BSE", "").strip()
        stock = yf.Ticker(clean + ".NS")
        hist = stock.history(period="2d")

        if hist.empty:
            return f"No data found for {clean}. Check if ticker is valid NSE symbol."

        current = round(hist['Close'].iloc[-1], 2)
        prev = round(hist['Close'].iloc[-2], 2) if len(hist) > 1 else current
        change = round(current - prev, 2)
        change_pct = round(((current - prev) / prev) * 100, 2)
        volume = int(hist['Volume'].iloc[-1])
        arrow = "▲" if change >= 0 else "▼"

        return (
            f"[NSE Data]\n"
            f"Stock: {clean}\n"
            f"Price: ₹{current}\n"
            f"Change: {arrow} ₹{abs(change)} ({change_pct:+.2f}%)\n"
            f"Volume: {volume:,}\n"
            f"Source: NSE via yfinance (15-min delay)"
        )
    except Exception as e:
        return f"Error fetching {ticker}: {str(e)}"