"""
Mutual Fund Intelligence for MarketValve
Uses the free mfapi.in API for NAV data and scheme search.
No API key required.
"""

import requests as req


def search_mutual_funds(query: str) -> list:
    """Search mutual fund schemes by name."""
    try:
        r = req.get(f"https://api.mfapi.in/mf/search?q={query}", timeout=10)
        if r.status_code == 200:
            results = r.json()
            return results[:15]  # Top 15 matches
        return []
    except Exception:
        return []


def get_fund_nav(scheme_code: str) -> dict:
    """Get current NAV and historical data for a mutual fund scheme."""
    try:
        r = req.get(f"https://api.mfapi.in/mf/{scheme_code}", timeout=10)
        if r.status_code == 200:
            data = r.json()
            meta = data.get("meta", {})
            nav_data = data.get("data", [])

            current_nav = float(nav_data[0]["nav"]) if nav_data else 0

            # Calculate returns
            returns = {}
            periods = {"1W": 5, "1M": 22, "3M": 66, "6M": 132, "1Y": 252, "3Y": 756}
            for label, days in periods.items():
                if len(nav_data) > days:
                    old_nav = float(nav_data[days]["nav"])
                    if old_nav > 0:
                        ret = ((current_nav - old_nav) / old_nav) * 100
                        if label == "3Y":
                            ret = ((current_nav / old_nav) ** (1 / 3) - 1) * 100  # CAGR
                        returns[label] = round(ret, 2)

            return {
                "status": "success",
                "scheme_code": scheme_code,
                "scheme_name": meta.get("scheme_name", ""),
                "fund_house": meta.get("fund_house", ""),
                "scheme_type": meta.get("scheme_type", ""),
                "scheme_category": meta.get("scheme_category", ""),
                "current_nav": current_nav,
                "nav_date": nav_data[0]["date"] if nav_data else "",
                "returns": returns,
            }
        return {"status": "error", "message": "Scheme not found"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


def analyze_fund_portfolio(holdings: list) -> dict:
    """
    Analyze a user's mutual fund portfolio.
    holdings: [{"scheme_code": "...", "invested": ..., "units": ...}, ...]
    """
    total_invested = 0
    total_current = 0
    fund_details = []

    for h in holdings:
        code = h.get("scheme_code", "")
        invested = float(h.get("invested", 0))
        units = float(h.get("units", 0))

        nav_info = get_fund_nav(code)
        if nav_info.get("status") == "success":
            current = units * nav_info["current_nav"]
            pnl = current - invested
            pnl_pct = (pnl / invested * 100) if invested > 0 else 0

            total_invested += invested
            total_current += current

            fund_details.append({
                "scheme_name": nav_info["scheme_name"],
                "scheme_code": code,
                "fund_house": nav_info["fund_house"],
                "category": nav_info["scheme_category"],
                "invested": round(invested, 2),
                "current_value": round(current, 2),
                "nav": nav_info["current_nav"],
                "units": units,
                "pnl": round(pnl, 2),
                "pnl_pct": round(pnl_pct, 2),
                "returns": nav_info.get("returns", {}),
            })

    total_pnl = total_current - total_invested
    total_pnl_pct = (total_pnl / total_invested * 100) if total_invested > 0 else 0

    return {
        "total_invested": round(total_invested, 2),
        "total_current": round(total_current, 2),
        "total_pnl": round(total_pnl, 2),
        "total_pnl_pct": round(total_pnl_pct, 2),
        "funds": fund_details,
        "count": len(fund_details),
    }
