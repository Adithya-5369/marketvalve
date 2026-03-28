"""
Angel One SmartAPI Integration for MarketValve
Provides real-time portfolio data, holdings, positions, and P&L.

Setup:
1. pip install smartapi-python pyotp
2. Register at https://smartapi.angelone.in/
3. Get API key from SmartAPI dashboard
4. Set env vars: ANGEL_API_KEY, ANGEL_CLIENT_ID, ANGEL_PASSWORD, ANGEL_TOTP_TOKEN
"""

import os
from dotenv import load_dotenv

load_dotenv()

# SmartAPI session (singleton)
_smart_api = None
_auth_token = None


def connect_angel_one(client_id: str, password: str, api_key: str, totp: str) -> dict:
    """
    Authenticate with Angel One SmartAPI.
    Returns session data or error.
    """
    global _smart_api, _auth_token
    try:
        from SmartApi import SmartConnect
        obj = SmartConnect(api_key=api_key)
        data = obj.generateSession(client_id, password, totp)

        if data.get("status"):
            _smart_api = obj
            _auth_token = data["data"]["jwtToken"]
            profile = obj.getProfile(data["data"]["refreshToken"])
            return {
                "status": "success",
                "message": "Connected to Angel One",
                "client_name": profile.get("data", {}).get("name", client_id),
                "client_id": client_id,
                "broker": "Angel One",
            }
        else:
            return {
                "status": "error",
                "message": data.get("message", "Authentication failed"),
            }
    except ImportError:
        return {
            "status": "error",
            "message": "smartapi-python not installed. Run: pip install smartapi-python pyotp",
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
        }


def connect_with_totp_secret(client_id: str, password: str, api_key: str, totp_secret: str) -> dict:
    """
    Connect using TOTP secret (auto-generates TOTP code).
    """
    try:
        import pyotp
        totp = pyotp.TOTP(totp_secret).now()
        return connect_angel_one(client_id, password, api_key, totp)
    except ImportError:
        return {
            "status": "error",
            "message": "pyotp not installed. Run: pip install pyotp",
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
        }


def fetch_holdings() -> dict:
    """Fetch current holdings (delivery stocks) from Angel One."""
    global _smart_api
    if not _smart_api:
        return {"status": "error", "message": "Not connected. Please connect your broker first."}

    try:
        holdings = _smart_api.holding()
        if holdings.get("status"):
            data = holdings.get("data", [])
            formatted = []
            total_investment = 0
            total_current = 0

            for h in data:
                qty = int(h.get("quantity", 0))
                avg_price = float(h.get("averageprice", 0))
                ltp = float(h.get("ltp", 0))
                invested = qty * avg_price
                current = qty * ltp
                pnl = current - invested
                pnl_pct = (pnl / invested * 100) if invested > 0 else 0

                total_investment += invested
                total_current += current

                formatted.append({
                    "symbol": h.get("tradingsymbol", ""),
                    "exchange": h.get("exchange", ""),
                    "qty": qty,
                    "avg_price": round(avg_price, 2),
                    "ltp": round(ltp, 2),
                    "invested": round(invested, 2),
                    "current_value": round(current, 2),
                    "pnl": round(pnl, 2),
                    "pnl_pct": round(pnl_pct, 2),
                    "product": h.get("product", ""),
                })

            total_pnl = total_current - total_investment
            total_pnl_pct = (total_pnl / total_investment * 100) if total_investment > 0 else 0

            return {
                "status": "success",
                "holdings": formatted,
                "summary": {
                    "total_investment": round(total_investment, 2),
                    "current_value": round(total_current, 2),
                    "total_pnl": round(total_pnl, 2),
                    "total_pnl_pct": round(total_pnl_pct, 2),
                    "total_stocks": len(formatted),
                }
            }
        else:
            return {"status": "error", "message": holdings.get("message", "Failed to fetch holdings")}
    except Exception as e:
        return {"status": "error", "message": str(e)}


def fetch_positions() -> dict:
    """Fetch open positions (intraday/F&O) from Angel One."""
    global _smart_api
    if not _smart_api:
        return {"status": "error", "message": "Not connected. Please connect your broker first."}

    try:
        positions = _smart_api.position()
        if positions.get("status"):
            data = positions.get("data", [])
            formatted = []
            for p in data:
                qty = int(p.get("netqty", 0))
                if qty == 0:
                    continue
                buy_avg = float(p.get("buyavgprice", 0))
                ltp = float(p.get("ltp", 0))
                pnl = float(p.get("pnl", 0))

                formatted.append({
                    "symbol": p.get("tradingsymbol", ""),
                    "exchange": p.get("exchange", ""),
                    "qty": qty,
                    "buy_avg": round(buy_avg, 2),
                    "ltp": round(ltp, 2),
                    "pnl": round(pnl, 2),
                    "product": p.get("producttype", ""),
                })

            return {
                "status": "success",
                "positions": formatted,
            }
        else:
            return {"status": "error", "message": positions.get("message", "Failed to fetch positions")}
    except Exception as e:
        return {"status": "error", "message": str(e)}


def fetch_order_book() -> dict:
    """Fetch today's order book from Angel One."""
    global _smart_api
    if not _smart_api:
        return {"status": "error", "message": "Not connected. Please connect your broker first."}

    try:
        orders = _smart_api.orderBook()
        if orders.get("status"):
            data = orders.get("data", []) or []
            formatted = []
            for o in data:
                formatted.append({
                    "symbol": o.get("tradingsymbol", ""),
                    "order_type": o.get("ordertype", ""),
                    "transaction": o.get("transactiontype", ""),
                    "qty": o.get("quantity", 0),
                    "price": o.get("price", 0),
                    "status": o.get("status", ""),
                    "time": o.get("updatetime", ""),
                })

            return {
                "status": "success",
                "orders": formatted,
            }
        else:
            return {"status": "error", "message": orders.get("message", "No orders")}
    except Exception as e:
        return {"status": "error", "message": str(e)}


def is_connected() -> bool:
    """Check if broker is currently connected."""
    return _smart_api is not None


def disconnect():
    """Disconnect from Angel One."""
    global _smart_api, _auth_token
    _smart_api = None
    _auth_token = None
    return {"status": "success", "message": "Disconnected from broker"}
