import requests
import json
import os
import re
import traceback
from bs4 import BeautifulSoup
from datetime import datetime
from dotenv import load_dotenv
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage

load_dotenv()

CACHE_FILE = os.path.join(os.path.dirname(__file__), "radar_cache.json")
SENTIMENT_CACHE_FILE = os.path.join(os.path.dirname(__file__), "sentiment_cache.json")

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



def _get_sentiment_llm():
    return ChatOpenAI(
        model="sarvam-m",
        api_key=os.getenv("SARVAM_API_KEY"),
        base_url="https://api.sarvam.ai/v1",
        temperature=0,
    )

SENTIMENT_PROMPT = """You are a financial sentiment analyst for the Indian stock market.
Analyze each news headline and return a JSON array with one object per headline.
IMPORTANT: Do NOT use <think> tags. Return ONLY a valid JSON array immediately.
No reasoning, no explanation — just the JSON array.

For EACH headline return:
- "index": the headline number (0-based)
- "sentiment": exactly one of "Bullish", "Bearish", or "Neutral"
- "confidence": a number from 1-10 (10 = very confident)
- "signal_type": one of: "FII Activity", "Insider Trade", "Bulk/Block Deal", "Analyst Rating", "Breakout", "Breakdown", "Earnings", "Policy/Macro", "Sector Move", "Management Commentary", "Regulatory Change", "General"
- "reason": one short sentence explaining why (max 15 words)

Rules:
- Only financial/market news should get Bullish or Bearish. Non-market news = Neutral.
- FII buying, upgrades, breakouts, strong earnings = Bullish
- FII selling, downgrades, breakdowns, weak earnings = Bearish
- Management guidance raise, positive outlook, expansion plans = Bullish
- Management guidance cut, cautious outlook, hiring freeze = Bearish
- Regulatory approvals, license grants = Bullish
- Regulatory actions, penalties, bans = Bearish
- Mixed or unclear = Neutral with lower confidence

Return ONLY a valid JSON array. No markdown, no explanation."""


def _load_sentiment_cache():
    try:
        if os.path.exists(SENTIMENT_CACHE_FILE):
            with open(SENTIMENT_CACHE_FILE) as f:
                c = json.load(f)
            if c.get("date") == datetime.now().strftime("%Y-%m-%d"):
                return c.get("results", {})
    except Exception:
        pass
    return {}


def _save_sentiment_cache(results: dict):
    try:
        with open(SENTIMENT_CACHE_FILE, "w") as f:
            json.dump({
                "date": datetime.now().strftime("%Y-%m-%d"),
                "results": results,
            }, f)
    except Exception:
        pass


def _analyze_sentiment_batch(headlines: list[str]) -> list[dict]:
    if not headlines:
        return []

    numbered = "\n".join(f"{i}. {h}" for i, h in enumerate(headlines))

    try:
        llm = _get_sentiment_llm()
        response = llm.invoke([
            SystemMessage(content=SENTIMENT_PROMPT),
            HumanMessage(content=f"Analyze these {len(headlines)} headlines:\n\n{numbered}"),
        ])

        text = response.content.strip()

        # Guard: empty response
        if not text:
            print("Sentiment analysis: empty response from model")
            return []

        if "<think>" in text and "</think>" not in text:
            # Model cut off — try to extract any JSON after the think tag
            after_think = text.split("<think>")[-1]
            json_match = re.search(r'\[[\s\S]*\]', after_think)
            if json_match:
                text = json_match.group(0)
            else:
                return []

        # Strip markdown fences if present
        if "```" in text:
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
            text = text.strip()

        # Guard: not JSON
        if not text.startswith("["):
            print(f"Sentiment analysis: unexpected format: {text[:100]}")
            return []

        parsed = json.loads(text)
        return parsed if isinstance(parsed, list) else []

    except json.JSONDecodeError as e:
        print(f"Sentiment analysis error: {e}")
        return []
    except Exception as e:
        print(f"Sentiment analysis error: {e}")
        return []



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
        # NSE returns data under different keys depending on deal type
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
        price    = d.get("watp", d.get("price", "N/A"))
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
    
    for feed in NEWS_FEEDS:
        try:
            res = requests.get(feed, timeout=10, headers={"User-Agent": "Mozilla/5.0"})
            soup = BeautifulSoup(res.content, "xml")
            
            source_name = "Moneycontrol" if "moneycontrol" in feed else "ET Markets"
            
            for item in soup.find_all("item")[:15]:
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
                        "source": source_name
                    })
        except Exception as e:
            print(f"Feed error {feed}: {e}")
            
    save_cache(articles)
    return articles

def detect_signals(articles, query_upper):
    """AI-powered sentiment analysis using Groq LLM instead of keyword matching."""
    filtered = []
    for art in articles:
        text = (art["title"] + " " + art["desc"]).lower()
        if query_upper and query_upper not in ["ALL", "MARKET", "TODAY"]:
            if query_upper.lower() not in text:
                continue
        filtered.append(art)

    if not filtered:
        return []

    cache = _load_sentiment_cache()
    uncached_articles = []
    uncached_indices = []
    cached_results = {}

    for i, art in enumerate(filtered):
        cache_key = art["title"][:100]  # Use truncated title as key
        if cache_key in cache:
            cached_results[i] = cache[cache_key]
        else:
            uncached_articles.append(art)
            uncached_indices.append(i)

    new_results = {}
    batch_size = 5
    for batch_start in range(0, len(uncached_articles), batch_size):
        batch = uncached_articles[batch_start:batch_start + batch_size]
        headlines = [a["title"] for a in batch]
        ai_results = _analyze_sentiment_batch(headlines)

        if not ai_results:
            ai_results = []

        for result in ai_results:
            idx = result.get("index", 0)
            if 0 <= idx < len(batch):
                global_idx = uncached_indices[batch_start + idx]
                new_results[global_idx] = result
                cache_key = batch[idx]["title"][:100]
                cache[cache_key] = result

    _save_sentiment_cache(cache)

    all_results = {**cached_results, **new_results}
    signals = []

    for i, art in enumerate(filtered):
        result = all_results.get(i)
        if not result:
            continue

        sentiment_label = result.get("sentiment", "Neutral")
        confidence = result.get("confidence", 5)
        signal_type = result.get("signal_type", "General")
        reason = result.get("reason", "")

        if sentiment_label == "Neutral" and confidence < 5:
            continue

        sentiment_emoji = (
            "🟢 Bullish" if sentiment_label == "Bullish"
            else "🔴 Bearish" if sentiment_label == "Bearish"
            else "⚪ Neutral"
        )

        signals.append({
            "title":       art["title"],
            "desc":        art["desc"],
            "link":        art["link"],
            "date":        art["date"],
            "source":      art.get("source", "ET Markets"),
            "signals":     [signal_type],
            "sentiment":   sentiment_emoji,
            "confidence":  confidence,
            "reason":      reason,
        })

    signals.sort(key=lambda x: x.get("confidence", 0), reverse=True)
    return signals



def fetch_corporate_filings(query_upper: str = "") -> list:
    """Fetch corporate announcements from NSE (board meetings, AGMs, acquisitions, etc.)."""
    try:
        session = get_nse_session()
        url = "https://www.nseindia.com/api/corporate-announcements"
        params = {"index": "equities"}
        if query_upper and query_upper not in ["ALL", "MARKET", "TODAY", ""]:
            params["symbol"] = query_upper
        res = session.get(url, params=params, timeout=15)
        data = res.json()
        filings = []
        items = data if isinstance(data, list) else data.get("data", data.get("searchresult", []))
        high_impact = [
            "board meeting", "quarterly", "results", "dividend", "bonus",
            "acquisition", "merger", "buyback", "rights issue", "split",
            "credit rating", "preferential", "agm", "egm", "resignation",
            "appointment", "promoter", "pledge", "restructuring"
        ]
        for item in (items[:50] if isinstance(items, list) else []):
            subject = item.get("desc", item.get("subject", ""))
            symbol = item.get("symbol", item.get("sm_name", ""))
            an_date = item.get("an_dt", item.get("date", ""))
            category = item.get("attchmntFile", item.get("category", ""))
            subj_lower = subject.lower()
            is_high_impact = any(kw in subj_lower for kw in high_impact)
            
            if symbol and subject:
                filings.append({
                    "symbol": symbol,
                    "subject": subject[:200],
                    "date": an_date,
                    "category": category,
                    "high_impact": is_high_impact,
                })
        
        filings.sort(key=lambda x: x.get("high_impact", False), reverse=True)
        return filings[:20]
    except Exception as e:
        print(f"Corporate filings fetch error: {e}")
        return []


def format_filings_text(filings: list) -> str:
    """Format filings for the AI tool output."""
    if not filings:
        return ""
    output = "\n[Corporate Filings & Announcements]\n"
    for f in filings[:8]:
        impact = "⚡" if f.get("high_impact") else "📋"
        output += f"{impact} {f['symbol']} — {f['subject']}\n"
        if f.get("date"):
            output += f"  Date: {f['date']}\n"
    output += f"Total filings found: {len(filings)}\nSource: NSE India\n"
    return output




MGMT_KEYWORDS = [
    "investor presentation", "investor update", "management discussion",
    "management commentary", "con-call", "concall", "conference call",
    "earnings call", "guidance", "outlook", "business update",
    "annual report", "chairman", "md&a", "management analysis",
    "ceo letter", "strategy update", "analyst meet", "investor meet",
    "business review", "corporate presentation", "growth outlook",
    "capex plan", "expansion plan", "order book update", "pipeline update",
]


def fetch_management_commentary(query_upper: str = "") -> list:
    """Fetch management commentary signals from NSE corporate announcements.
    Filters corporate filings for investor presentations, MD&A, guidance updates,
    con-call transcripts, and strategy communications — all free from NSE.
    """
    try:
        session = get_nse_session()
        url = "https://www.nseindia.com/api/corporate-announcements"
        params = {"index": "equities"}
        if query_upper and query_upper not in ["ALL", "MARKET", "TODAY", ""]:
            params["symbol"] = query_upper
        res = session.get(url, params=params, timeout=15)
        data = res.json()
        items = data if isinstance(data, list) else data.get("data", data.get("searchresult", []))

        commentary = []
        for item in (items[:100] if isinstance(items, list) else []):
            subject = item.get("desc", item.get("subject", ""))
            symbol = item.get("symbol", item.get("sm_name", ""))
            an_date = item.get("an_dt", item.get("date", ""))
            subj_lower = subject.lower()

            matched_keywords = [kw for kw in MGMT_KEYWORDS if kw in subj_lower]
            if not matched_keywords:
                continue

            if any(k in subj_lower for k in ["investor presentation", "analyst meet", "investor meet", "corporate presentation"]):
                commentary_type = "Investor Presentation"
            elif any(k in subj_lower for k in ["con-call", "concall", "conference call", "earnings call"]):
                commentary_type = "Earnings Call"
            elif any(k in subj_lower for k in ["guidance", "outlook", "growth outlook"]):
                commentary_type = "Guidance Update"
            elif any(k in subj_lower for k in ["management discussion", "md&a", "management analysis", "management commentary"]):
                commentary_type = "MD&A"
            elif any(k in subj_lower for k in ["capex plan", "expansion plan", "strategy update", "pipeline update"]):
                commentary_type = "Strategy Update"
            else:
                commentary_type = "Management Update"

            commentary.append({
                "symbol": symbol,
                "subject": subject[:200],
                "date": an_date,
                "type": commentary_type,
                "keywords": matched_keywords[:3],
            })

        return commentary[:15]
    except Exception as e:
        print(f"Management commentary fetch error: {e}")
        return []


def format_commentary_text(commentary: list) -> str:
    """Format management commentary for the AI tool output."""
    if not commentary:
        return ""
    output = "\n[Management Commentary & Guidance]\n"
    for c in commentary[:6]:
        type_icon = {
            "Investor Presentation": "📊",
            "Earnings Call": "📞",
            "Guidance Update": "🎯",
            "MD&A": "📝",
            "Strategy Update": "🚀",
            "Management Update": "💼",
        }.get(c.get("type", ""), "💼")
        output += f"{type_icon} {c['symbol']} [{c['type']}] — {c['subject']}\n"
        if c.get("date"):
            output += f"  Date: {c['date']}\n"
    output += f"Total commentary found: {len(commentary)}\nSource: NSE India Corporate Filings\n"
    return output



def fetch_insider_trades(query_upper: str = "") -> list:
    """Fetch insider/promoter trading data from NSE PIT regulations."""
    try:
        session = get_nse_session()
        url = "https://www.nseindia.com/api/corporates-pit"
        params = {"index": "equities"}
        if query_upper and query_upper not in ["ALL", "MARKET", "TODAY", ""]:
            params["symbol"] = query_upper
        res = session.get(url, params=params, timeout=15)
        data = res.json()
        trades = []
        items = data if isinstance(data, list) else data.get("data", data.get("searchresult", []))
        for item in (items[:30] if isinstance(items, list) else []):
            symbol = item.get("symbol", "")
            person = item.get("acqName", item.get("personName", ""))
            category = item.get("personCategory", item.get("categoryOfPerson", ""))
            buy_sell = item.get("buyOrSell", item.get("typeOfTransaction", ""))
            qty = item.get("secAcq", item.get("noOfSecurities", ""))
            date = item.get("intimDt", item.get("date", ""))
            value = item.get("secVal", item.get("valueOfSecurities", ""))
            
            if symbol and person:
                trades.append({
                    "symbol": symbol,
                    "person": person[:80],
                    "category": category,
                    "action": buy_sell,
                    "qty": str(qty),
                    "value": str(value),
                    "date": date,
                })
        return trades[:20]
    except Exception as e:
        print(f"Insider trades fetch error: {e}")
        return []


def format_insider_text(trades: list) -> str:
    """Format insider trades for the AI tool output."""
    if not trades:
        return ""
    output = "\n[Insider / Promoter Trading Activity]\n"
    for t in trades[:8]:
        action_emoji = "🟢 BUY" if "buy" in str(t.get("action", "")).lower() else "🔴 SELL"
        output += f"{action_emoji} — {t['symbol']}\n"
        output += f"  Person: {t['person']} ({t.get('category', 'N/A')})\n"
        if t.get("qty"):
            output += f"  Qty: {t['qty']}"
        if t.get("value"):
            output += f" | Value: ₹{t['value']}"
        output += f"\n  Date: {t.get('date', 'N/A')}\n"
    output += f"Total insider trades found: {len(trades)}\nSource: NSE India (SAST/PIT)\n"
    return output



def fetch_quarterly_results(query_upper: str = "") -> list:
    """Fetch latest quarterly financial results from NSE."""
    try:
        session = get_nse_session()
        url = "https://www.nseindia.com/api/corporates-financial-results"
        params = {"index": "equities"}
        if query_upper and query_upper not in ["ALL", "MARKET", "TODAY", ""]:
            params["symbol"] = query_upper
        res = session.get(url, params=params, timeout=15)
        data = res.json()
        results = []
        items = data if isinstance(data, list) else data.get("data", data.get("searchresult", []))
        for item in (items[:30] if isinstance(items, list) else []):
            symbol = item.get("symbol", "")
            period = item.get("re_period", item.get("period", ""))
            revenue = item.get("re_turnover", item.get("income", ""))
            net_profit = item.get("re_netProfit", item.get("netProfit", ""))
            eps = item.get("re_eps", item.get("eps", ""))
            broadcast_dt = item.get("re_broadcastDt", item.get("broadcastDate", ""))
            
            if symbol:
                results.append({
                    "symbol": symbol,
                    "period": period,
                    "revenue": str(revenue) if revenue else "",
                    "net_profit": str(net_profit) if net_profit else "",
                    "eps": str(eps) if eps else "",
                    "date": broadcast_dt,
                })
        return results[:15]
    except Exception as e:
        print(f"Quarterly results fetch error: {e}")
        return []


def format_results_text(results: list) -> str:
    """Format quarterly results for the AI tool output."""
    if not results:
        return ""
    output = "\n[Quarterly Financial Results]\n"
    for r in results[:6]:
        output += f"📊 {r['symbol']} — {r.get('period', 'N/A')}\n"
        if r.get("revenue"):
            output += f"  Revenue: ₹{r['revenue']} Cr"
        if r.get("net_profit"):
            output += f" | Net Profit: ₹{r['net_profit']} Cr"
        if r.get("eps"):
            output += f" | EPS: ₹{r['eps']}"
        output += f"\n  Reported: {r.get('date', 'N/A')}\n"
    output += f"Total results found: {len(results)}\nSource: NSE India\n"
    return output

@tool
def opportunity_radar(query: str) -> str:
    """
    Comprehensive investment signal scanner for Indian markets.
    Scans: NSE bulk/block deals, corporate filings, insider/promoter trades,
    quarterly results, and AI sentiment from ET Markets & Moneycontrol news.
    Detects: FII/DII activity, bulk deals, block deals, insider trades,
    corporate announcements, earnings, analyst upgrades/downgrades, breakouts.
    Use for: institutional activity, bulk/block deals, insider trading, filings,
    quarterly results, market signals, promoter activity.
    Input: stock ticker like HDFCBANK, RELIANCE, TCS — or 'all' for market-wide.
    """
    try:
        query_upper = query.upper().strip().replace(".NS", "")
        is_specific = query_upper not in ["ALL", "MARKET", "TODAY", ""]

        direct_result = fetch_nse_direct_deals(query_upper)

        articles = fetch_market_news()
        signals  = detect_signals(articles, query_upper if is_specific else "")

        filings = fetch_corporate_filings(query_upper)

        insider = fetch_insider_trades(query_upper)

        results = fetch_quarterly_results(query_upper)

        commentary = fetch_management_commentary(query_upper)

        output = f"[Opportunity Radar — {datetime.now().strftime('%d %b %Y')}]\n"
        if is_specific:
            output += f"Stock: {query_upper}\n\n"

        if direct_result:
            output += direct_result + "\n\n"
        else:
            output += "NSE deal data unavailable at this time.\n\n"

        output += format_filings_text(filings)

        output += format_commentary_text(commentary)

        output += format_insider_text(insider)

        output += format_results_text(results)

        if signals:
            bullish = sum(1 for s in signals if "Bullish" in s["sentiment"])
            bearish = sum(1 for s in signals if "Bearish" in s["sentiment"])
            overall = (
                "🟢 BULLISH" if bullish > bearish
                else "🔴 BEARISH" if bearish > bullish
                else "⚪ MIXED"
            )
            output += f"\n[AI Sentiment Analysis — {len(signals)} signals | {len(articles)} articles scanned]\n"
            output += f"Overall: {overall} | Bullish: {bullish} | Bearish: {bearish}\n\n"
            for s in signals[:5]:
                conf = s.get('confidence', '?')
                reason = s.get('reason', '')
                output += f"{s['sentiment']} [{conf}/10] — {', '.join(s['signals'])}\n"
                output += f"  {s['title']}\n"
                if reason:
                    output += f"  Reason: {reason}\n"
                if s['desc']:
                    output += f"  {s['desc'][:150]}...\n"
                source = s.get('source', 'ET Markets')
                output += f"  Source: {source} | {s['date'][:16]}\n\n"
            
        elif not direct_result and not filings and not insider and not results:
            output += f"No signals found for {query_upper} today.\n"
            output += f"Scanned {len(articles)} articles from ET Markets & Moneycontrol.\n"

        return output

    except Exception as e:
        traceback.print_exc()
        return f"Error in opportunity radar: {str(e)}"