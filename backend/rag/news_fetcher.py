import requests
from bs4 import BeautifulSoup

ET_RSS_FEEDS = [
    "https://economictimes.indiatimes.com/markets/stocks/rssfeeds/2146842.cms",
    "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms",
    "https://economictimes.indiatimes.com/rssfeedsdefault.cms",
    "https://economictimes.indiatimes.com/rss.cms",
    "https://economictimes.indiatimes.com/industry/banking/finance/banking/rssfeeds/13358259.cms",
    "https://economictimes.indiatimes.com/news/economy/rssfeeds/1373380680.cms",
    "https://economictimes.indiatimes.com/markets/ipos/fpos/rssfeeds/44747124.cms",
    "https://economictimes.indiatimes.com/mf/rssfeeds/13808662.cms",
]

def fetch_et_news(max_articles=50) -> list[dict]:
    articles = []
    for feed_url in ET_RSS_FEEDS:
        try:
            res = requests.get(feed_url, timeout=10, headers={
                "User-Agent": "Mozilla/5.0"
            })
            try:
                soup = BeautifulSoup(res.content, "lxml-xml")
            except:
                soup = BeautifulSoup(res.content, "xml")
            items = soup.find_all("item")
            for item in items[:max_articles]:
                title = item.find("title")
                desc = item.find("description")
                link = item.find("link")
                pub_date = item.find("pubDate")
                if title and desc:
                    articles.append({
                        "title": title.text.strip(),
                        "description": desc.text.strip(),
                        "link": link.text.strip() if link else "",
                        "date": pub_date.text.strip() if pub_date else "",
                        "source": "ET Markets"
                    })
        except Exception as e:
            print(f"Error fetching {feed_url}: {e}")
    return articles