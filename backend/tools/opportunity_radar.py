import requests
from bs4 import BeautifulSoup
from datetime import datetime
from langchain_core.tools import tool
import json, os

CACHE_FILE = os.path.join(os.path.dirname(__file__), "radar_cache.json")

NEWS_FEEDS = [
    # --- ET Markets ---
    "https://economictimes.indiatimes.com/markets/stocks/rssfeeds/2146842.cms",
    "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms",
    "https://economictimes.indiatimes.com/opinion/et-commentary/rssfeeds/897228639.cms",
    
    # --- Moneycontrol ---
    "https://www.moneycontrol.com/rss/MCtopnews.xml",
    "https://www.moneycontrol.com/rss/marketreports.xml",
    "https://www.moneycontrol.com/rss/brokerageresearch.xml",
]

SIGNAL_KEYWORDS = {
    "bulk_deal":    ["bulk deal", "block deal", "bulk purchase", "block purchase"],
    "fii_buy":      ["fii buying", "fii inflow", "foreign inflow", "fii invested",
                     "foreign investor bought", "fpi buying"],
    "fii_sell":     ["fii selling", "fii outflow", "foreign selling", "fpi sold"],
    "insider_buy":  ["promoter buying", "insider buying", "promoter increased stake",
                     "management buyback"],
    "insider_sell": ["promoter selling", "insider selling", "promoter sold stake"],
    "upgrade":      ["upgrade", "buy rating", "target price raised", "outperform",
                     "strong buy", "overweight"],
    "downgrade":    ["downgrade", "sell rating", "target price cut", "underperform",
                     "underweight", "reduce"],
    "breakout":     ["52-week high", "all-time high", "breakout", "new high",
                     "multi-year high"],
    "breakdown":    ["52-week low", "all-time low", "breakdown", "new low"],
    "earnings":     ["quarterly results", "q4 results", "q3 results", "net profit",
                     "revenue growth", "earnings beat", "earnings miss"],
}

BULLISH = {"fii_buy", "insider_buy", "upgrade", "breakout", "bulk_deal"}
BEARISH = {"fii_sell", "insider_sell", "downgrade", "breakdown"}

# ─── NSE API ──────────────────────────────────────────────────────────────────

def get_nse_session():
    session = requests.Session()
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        "Accept": "*/*",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://www.nseindia.com/",
    })
    try:
        session.get("https://www.nseindia.com", timeout=10)
        session.get("https://www.nseindia.com/market-data/bulk-deal", timeout=10)
    except:
        pass
    return session

def fetch_nse_deals(deal_type: str = "bulk") -> list:
    """Fetch bulk or block deals from NSE API."""
    try:
        session = get_nse_session()
        url = "https://www.nseindia.com/api/snapshot-capital-market-largedeal"
        params = {"dealtype": "bulk_deals" if deal_type == "bulk" else "block_deals"}
        res = session.get(url, params=params, timeout=15)
        data = res.json()
        # NSE returns BULK_DEALS_DATA or BLOCK_DEALS_DATA as keys
        if deal_type == "bulk":
            return data.get("BULK_DEALS_DATA", data.get("data", []))
        else:
            return data.get("BLOCK_DEALS_DATA", data.get("data", []))
    except Exception as e:
        print(f"NSE {deal_type} deal fetch error: {e}")
        return []

def fetch_nse_direct_deals(query_upper: str = "") -> str:
    """Fetch bulk+block deals from NSE API and format output."""
    bulk = fetch_nse_deals("bulk")
    block = fetch_nse_deals("block")
    all_deals = [(d, "Bulk") for d in bulk] + [(d, "Block") for d in block]

    if not all_deals:
        return ""

    is_specific = query_upper not in ["ALL", "MARKET", "TODAY", ""]

    if is_specific:
        filtered = [
            (d, t) for d, t in all_deals
            if query_upper in str(d.get("symbol", "")).upper()
            or query_upper in str(d.get("name", "")).upper()
            or query_upper in str(d.get("clientName", "")).upper()
        ]
    else:
        filtered = all_deals[:15]

    if not filtered and is_specific:
        return (
            f"No bulk or block deals found for {query_upper} today.\n"
            f"Total market deals today: {len(all_deals)}\n"
            f"Source: NSE India (nseindia.com)"
        )

    output = f"[NSE Deal Data — {datetime.now().strftime('%d %b %Y')}]\n"
    output += f"Total deals today: {len(all_deals)}\n\n"
    if is_specific:
        output += f"Deals for {query_upper}:\n\n"

    buy_lines = []
    sell_lines = []

    for d, dtype in filtered[:10]:
        symbol   = d.get("symbol", "N/A")
        client   = d.get("clientName", "Unknown")
        qty      = d.get("qty", d.get("quantity", "N/A"))
        price    = d.get("watp", d.get("price", "N/A"))       # watp = weighted avg trade price
        buy_sell = d.get("buySell", d.get("buy_sell", "N/A"))
        date     = d.get("date", datetime.now().strftime("%d-%b-%Y"))

        line = (
            f"• {dtype} Deal | {symbol}\n"
            f"  Client: {client}\n"
            f"  Action: {buy_sell} | Qty: {qty} | Price: ₹{price} | Date: {date}\n"
        )
        if str(buy_sell).upper() in ["B", "BUY"]:
            buy_lines.append(line)
        else:
            sell_lines.append(line)

    if buy_lines:
        output += "🟢 BUY SIGNALS:\n" + "\n".join(buy_lines) + "\n"
    if sell_lines:
        output += "🔴 SELL SIGNALS:\n" + "\n".join(sell_lines)

    output += "\nSource: NSE India (nseindia.com)"
    return output

# ─── RSS Cache ────────────────────────────────────────────────────────────────

def load_cache():
    try:
        if os.path.exists(CACHE_FILE):
            with open(CACHE_FILE) as f:
                c = json.load(f)
            if c.get("date") == datetime.now().strftime("%Y-%m-%d"):
                return c.get("articles", [])
    except:
        pass
    return []

def save_cache(articles):
    try:
        with open(CACHE_FILE, "w") as f:
            json.dump({
                "date": datetime.now().strftime("%Y-%m-%d"),
                "articles": articles
            }, f)
    except:
        pass

def fetch_market_news():
    cached = load_cache()
    if cached:
        return cached
        
    articles = []
    
    # Loop through BOTH Economic Times and Moneycontrol feeds
    for feed in NEWS_FEEDS:
        try:
            res = requests.get(feed, timeout=10, headers={"User-Agent": "Mozilla/5.0"})
            soup = BeautifulSoup(res.content, "xml")
            
            # Determine the source for the UI
            source_name = "Moneycontrol" if "moneycontrol" in feed else "ET Markets"
            
            for item in soup.find_all("item")[:15]: # Limit to top 15 per feed to keep it fast
                title   = item.find("title")
                desc    = item.find("description")
                link    = item.find("link")
                date    = item.find("pubDate")
                
                if title:
                    articles.append({
                        "title": title.text.strip(),
                        "desc":  (desc.text.strip() if desc else "")[:300],
                        "link":  link.text.strip() if link else "",
                        "date":  date.text.strip() if date else "",
                        "source": source_name # Save the source!
                    })
        except Exception as e:
            print(f"Feed error {feed}: {e}")
            
    save_cache(articles)
    return articles

def detect_signals(articles, query_upper):
    signals = []
    for art in articles:
        text = (art["title"] + " " + art["desc"]).lower()
        if query_upper and query_upper not in ["ALL", "MARKET", "TODAY"]:
            if query_upper.lower() not in text:
                continue
        detected = []
        for signal_type, keywords in SIGNAL_KEYWORDS.items():
            if any(kw in text for kw in keywords):
                detected.append(signal_type)
        if detected:
            signals.append({
                "title":     art["title"],
                "desc":      art["desc"],
                "link":      art["link"],
                "date":      art["date"],
                "source":    art.get("source", "ET Markets"),
                "signals":   detected,
                "sentiment": (
                    "🟢 Bullish" if any(s in BULLISH for s in detected)
                    else "🔴 Bearish" if any(s in BEARISH for s in detected)
                    else "⚪ Neutral"
                )
            })
    return signals

# ─── Main Tool ────────────────────────────────────────────────────────────────

@tool
def opportunity_radar(query: str) -> str:
    """
    Scans NSE bulk/block deals and ET Markets news for investment signals.
    Detects: FII/DII activity, bulk deals, block deals, insider trades,
    analyst upgrades/downgrades, breakouts, and earnings signals.
    Use for: institutional activity, bulk/block deals, market signals.
    Input: stock ticker like HDFCBANK, RELIANCE, TCS — or 'all' for market-wide.
    """
    try:
        query_upper = query.upper().strip().replace(".NS", "")
        is_specific = query_upper not in ["ALL", "MARKET", "TODAY", ""]

        # ── Primary: NSE bulk/block deal API ──────────────────────────────
        direct_result = fetch_nse_direct_deals(query_upper)

        # ── Secondary: ET Markets RSS signal detection ─────────────────────
        articles = fetch_market_news()
        signals  = detect_signals(articles, query_upper if is_specific else "")

        # ── Build combined output ──────────────────────────────────────────
        output = f"[Opportunity Radar — {datetime.now().strftime('%d %b %Y')}]\n"
        if is_specific:
            output += f"Stock: {query_upper}\n\n"

        if direct_result:
            output += direct_result + "\n\n"
        else:
            output += "NSE deal data unavailable — using ET Markets RSS signals.\n\n"

        if signals:
            bullish = sum(1 for s in signals if "Bullish" in s["sentiment"])
            bearish = sum(1 for s in signals if "Bearish" in s["sentiment"])
            overall = (
                "🟢 BULLISH" if bullish > bearish
                else "🔴 BEARISH" if bearish > bullish
                else "⚪ MIXED"
            )
            output += f"Signal Analysis ({len(signals)} signals | {len(articles)} articles scanned):\n"
            output += f"Overall Sentiment: {overall} | Bullish: {bullish} | Bearish: {bearish}\n\n"
            output += "Key Signals:\n\n"
            for s in signals[:5]:
                output += f"{s['sentiment']} — {', '.join(s['signals']).replace('_', ' ').title()}\n"
                output += f"  {s['title']}\n"
                if s["desc"]:
                    output += f"  {s['desc'][:150]}...\n"
                output += f"  Source: ET Markets | {s['date'][:16]}\n\n"
        elif not direct_result:
            output += f"No signals found for {query_upper} today.\n"
            output += f"Scanned {len(articles)} ET Markets articles.\n"

        source = s.get('source', 'Financial News') 
        output += f"  Source: {source} | {s['date'][:16]}\n\n"
        return output

    except Exception as e:
        import traceback
        traceback.print_exc()
        return f"Error in opportunity radar: {str(e)}"