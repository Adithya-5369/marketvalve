import yfinance as yf
import pandas as pd
import pandas_ta as ta
import numpy as np
from langchain_core.tools import tool

# ─── Candlestick Pattern Descriptions ─────────────────────────────────────────

CANDLE_DESCRIPTIONS = {
    "CDL_DOJI":          "Doji — Indecision candle; trend reversal possible",
    "CDL_HAMMER":        "Hammer — Bullish reversal; buying pressure at lows",
    "CDL_INVERTEDHAMMER":"Inverted Hammer — Possible bullish reversal after downtrend",
    "CDL_ENGULFING":     "Engulfing — Strong reversal; current candle overwhelms prior",
    "CDL_MORNINGSTAR":   "Morning Star — 3-candle bullish reversal pattern",
    "CDL_EVENINGSTAR":   "Evening Star — 3-candle bearish reversal pattern",
    "CDL_HARAMI":        "Harami — Consolidation; trend weakening signal",
    "CDL_SHOOTINGSTAR":  "Shooting Star — Bearish reversal after uptrend",
    "CDL_HANGINGMAN":    "Hanging Man — Bearish warning after uptrend",
    "CDL_DRAGONFLYDOJI": "Dragonfly Doji — Bullish reversal signal",
    "CDL_GRAVESTONEDOJI":"Gravestone Doji — Bearish reversal signal",
    "CDL_MARUBOZU":      "Marubozu — Strong conviction candle, no shadows",
    "CDL_SPINNINGTOP":   "Spinning Top — Market indecision",
    "CDL_3WHITESOLDIERS": "Three White Soldiers — Strong bullish continuation",
    "CDL_3BLACKCROWS":   "Three Black Crows — Strong bearish continuation",
}


def detect_candlestick_patterns(df: pd.DataFrame) -> list:
    """Detect candlestick patterns using pandas_ta."""
    detected = []
    try:
        # Try the all-at-once method first
        candles = df.ta.cdl_pattern(name="all")
        if candles is not None and not candles.empty:
            latest = candles.iloc[-1]
            for col in candles.columns:
                val = latest[col]
                if pd.notna(val) and val != 0:
                    pattern_name = col.replace("CDL_", "").replace("_", " ").title()
                    desc = CANDLE_DESCRIPTIONS.get(col, f"{pattern_name} pattern detected")
                    direction = "Bullish 🟢" if val > 0 else "Bearish 🔴"
                    detected.append({
                        "name": pattern_name,
                        "direction": direction,
                        "description": desc,
                        "strength": abs(int(val)),
                    })
    except Exception:
        # Fallback: try individual patterns
        individual_patterns = ["doji", "hammer", "engulfing", "morningstar", "eveningstar", "harami"]
        for pattern in individual_patterns:
            try:
                result = df.ta.cdl_pattern(name=pattern)
                if result is not None and not result.empty:
                    val = result.iloc[-1].iloc[0]
                    if pd.notna(val) and val != 0:
                        cdl_key = f"CDL_{pattern.upper()}"
                        desc = CANDLE_DESCRIPTIONS.get(cdl_key, f"{pattern.title()} pattern detected")
                        direction = "Bullish 🟢" if val > 0 else "Bearish 🔴"
                        detected.append({
                            "name": pattern.title(),
                            "direction": direction,
                            "description": desc,
                            "strength": abs(int(val)),
                        })
            except Exception:
                continue
    return detected


# ─── RSI Divergence Detection ─────────────────────────────────────────────────

def detect_rsi_divergence(df: pd.DataFrame, rsi_col: str, lookback: int = 14) -> list:
    """Detect bullish/bearish RSI divergences."""
    divergences = []
    if rsi_col not in df.columns or len(df) < lookback + 5:
        return divergences

    prices = df['Close'].values
    rsi = df[rsi_col].values

    # Look at last `lookback` periods for divergence
    recent = slice(-lookback, None)
    price_slice = prices[recent]
    rsi_slice = rsi[recent]

    # Remove NaN
    valid = ~np.isnan(rsi_slice)
    if valid.sum() < 5:
        return divergences

    price_valid = price_slice[valid]
    rsi_valid = rsi_slice[valid]

    # Find local minima/maxima in last N bars
    # Bullish divergence: price lower lows, RSI higher lows
    price_min_idx = np.argmin(price_valid[:len(price_valid)//2])
    price_min_idx2 = len(price_valid)//2 + np.argmin(price_valid[len(price_valid)//2:])

    if price_valid[price_min_idx2] < price_valid[price_min_idx]:
        # Price made lower low
        if rsi_valid[price_min_idx2] > rsi_valid[price_min_idx]:
            divergences.append({
                "type": "Bullish Divergence 🟢",
                "description": "Price making lower lows while RSI making higher lows — potential reversal upward",
                "significance": "High"
            })

    # Bearish divergence: price higher highs, RSI lower highs
    price_max_idx = np.argmax(price_valid[:len(price_valid)//2])
    price_max_idx2 = len(price_valid)//2 + np.argmax(price_valid[len(price_valid)//2:])

    if price_valid[price_max_idx2] > price_valid[price_max_idx]:
        # Price made higher high
        if rsi_valid[price_max_idx2] < rsi_valid[price_max_idx]:
            divergences.append({
                "type": "Bearish Divergence 🔴",
                "description": "Price making higher highs while RSI making lower highs — potential reversal downward",
                "significance": "High"
            })

    return divergences


# ─── Simple Backtested Success Rates ──────────────────────────────────────────

def backtest_signal(df: pd.DataFrame, signal_name: str, signal_func, forward_days: int = 5) -> dict | None:
    """
    Simple backtest: when this signal fired in the past, how often did price
    move in the expected direction within `forward_days`?
    """
    try:
        if len(df) < 60:  # Need enough history
            return None

        signals_fired = []
        for i in range(20, len(df) - forward_days):
            window = df.iloc[:i+1]
            if signal_func(window):
                future_return = (df.iloc[i + forward_days]['Close'] - df.iloc[i]['Close']) / df.iloc[i]['Close'] * 100
                signals_fired.append(future_return)

        if len(signals_fired) < 2:
            return None

        avg_return = round(np.mean(signals_fired), 2)
        win_rate = round(sum(1 for r in signals_fired if r > 0) / len(signals_fired) * 100, 1)

        return {
            "signal": signal_name,
            "occurrences": len(signals_fired),
            "avg_return_pct": avg_return,
            "win_rate_pct": win_rate,
            "forward_days": forward_days,
        }
    except Exception:
        return None


def run_backtests(df: pd.DataFrame) -> list:
    """Run backtests for common signals."""
    results = []

    # Golden Cross backtest
    def golden_cross_check(w):
        if len(w) < 52:
            return False
        sma20 = w['Close'].rolling(20).mean()
        sma50 = w['Close'].rolling(50).mean()
        if pd.isna(sma20.iloc[-1]) or pd.isna(sma50.iloc[-1]):
            return False
        if pd.isna(sma20.iloc[-2]) or pd.isna(sma50.iloc[-2]):
            return False
        return sma20.iloc[-2] < sma50.iloc[-2] and sma20.iloc[-1] > sma50.iloc[-1]

    r = backtest_signal(df, "Golden Cross (SMA 20/50)", golden_cross_check)
    if r:
        results.append(r)

    # RSI Oversold bounce
    def rsi_oversold_check(w):
        if len(w) < 16:
            return False
        rsi_vals = ta.rsi(w['Close'], length=14)
        if rsi_vals is None or rsi_vals.iloc[-1] is None:
            return False
        return float(rsi_vals.iloc[-1]) < 30

    r = backtest_signal(df, "RSI Oversold (<30) Bounce", rsi_oversold_check)
    if r:
        results.append(r)

    # Volume spike
    def volume_spike_check(w):
        if len(w) < 22:
            return False
        avg_vol = w['Volume'].tail(20).mean()
        return float(w['Volume'].iloc[-1]) > avg_vol * 1.5

    r = backtest_signal(df, "Volume Spike (1.5x avg)", volume_spike_check)
    if r:
        results.append(r)

    return results


# ─── Main Tool ────────────────────────────────────────────────────────────────

@tool
def chart_pattern(ticker: str) -> str:
    """
    Advanced technical chart pattern analysis for any NSE stock.
    Detects: candlestick patterns (doji, hammer, engulfing, morning/evening star),
    RSI divergences, support/resistance, breakouts, golden/death cross,
    momentum indicators (RSI, MACD, Bollinger Bands), volume spikes,
    and includes backtested historical success rates for detected patterns.
    Use for: technical analysis, chart patterns, support/resistance,
    momentum, RSI, MACD, moving averages, candlestick patterns, divergences.
    Example input: RELIANCE, TCS, HDFCBANK
    """
    try:
        clean = ticker.upper().replace(".NS", "").strip()
        stock = yf.Ticker(clean + ".NS")
        df = stock.history(period="6mo")  # Extended to 6mo for better backtesting

        if df.empty or len(df) < 20:
            return f"Not enough data for {clean} to detect patterns."

        # Calculate indicators
        df.ta.rsi(length=14, append=True)
        df.ta.macd(append=True)
        df.ta.sma(length=20, append=True)
        df.ta.sma(length=50, append=True)
        df.ta.bbands(length=20, append=True)

        latest = df.iloc[-1]
        prev = df.iloc[-2]

        current_price = round(float(latest['Close']), 2)

        # RSI
        rsi_col = [c for c in df.columns if 'RSI' in c]
        rsi = round(float(latest[rsi_col[0]]), 2) if rsi_col else None

        # MACD
        macd_col = [c for c in df.columns if 'MACD_12' in c and 'Signal' not in c and 'Hist' not in c]
        signal_col = [c for c in df.columns if 'MACDs' in c]
        macd = round(float(latest[macd_col[0]]), 2) if macd_col else None
        signal = round(float(latest[signal_col[0]]), 2) if signal_col else None

        # SMAs
        sma20_col = [c for c in df.columns if 'SMA_20' in c]
        sma50_col = [c for c in df.columns if 'SMA_50' in c]
        sma20 = round(float(latest[sma20_col[0]]), 2) if sma20_col else None
        sma50 = round(float(latest[sma50_col[0]]), 2) if sma50_col else None

        # Bollinger Bands
        bbu_col = [c for c in df.columns if 'BBU' in c]
        bbl_col = [c for c in df.columns if 'BBL' in c]
        bb_upper = round(float(latest[bbu_col[0]]), 2) if bbu_col else None
        bb_lower = round(float(latest[bbl_col[0]]), 2) if bbl_col else None

        # Support & Resistance (20-day high/low)
        high_20 = round(float(df['High'].tail(20).max()), 2)
        low_20 = round(float(df['Low'].tail(20).min()), 2)

        # ── Standard Pattern Detection ────────────────────────────────────
        patterns = []

        # Volume spike
        avg_volume = int(df['Volume'].tail(20).mean())
        latest_volume = int(latest['Volume'])
        if latest_volume > avg_volume * 1.5:
            patterns.append(f"📢 Volume spike — {latest_volume:,} vs avg {avg_volume:,} (unusual activity)")

        # Trend
        if sma20 and sma50:
            if current_price > sma20 > sma50:
                patterns.append("✅ Strong Uptrend — price above both 20 & 50 day MA")
            elif current_price < sma20 < sma50:
                patterns.append("🔴 Downtrend — price below both 20 & 50 day MA")
            elif sma20 > sma50:
                patterns.append("⚡ Bullish crossover — 20MA above 50MA")

        # Golden/Death cross
        if sma20 and sma50:
            prev_sma20 = round(float(prev[sma20_col[0]]), 2) if sma20_col else None
            prev_sma50 = round(float(prev[sma50_col[0]]), 2) if sma50_col else None
            if prev_sma20 and prev_sma50:
                if prev_sma20 < prev_sma50 and sma20 > sma50:
                    patterns.append("⭐ Golden Cross detected — strong bullish signal")
                elif prev_sma20 > prev_sma50 and sma20 < sma50:
                    patterns.append("💀 Death Cross detected — strong bearish signal")

        # RSI signals
        if rsi:
            if rsi > 70:
                patterns.append(f"⚠️ Overbought — RSI at {rsi} (above 70)")
            elif rsi < 30:
                patterns.append(f"🟢 Oversold — RSI at {rsi} (below 30), possible reversal")
            elif 50 < rsi < 70:
                patterns.append(f"📈 Bullish momentum — RSI at {rsi}")
            else:
                patterns.append(f"📉 Bearish momentum — RSI at {rsi}")

        # MACD signals
        if macd and signal:
            if macd > signal:
                patterns.append("🟢 MACD bullish crossover — buy signal")
            else:
                patterns.append("🔴 MACD bearish crossover — sell signal")

        # Breakout
        if current_price >= high_20 * 0.99:
            patterns.append(f"🚀 Near 20-day HIGH breakout at ₹{high_20}")
        elif current_price <= low_20 * 1.01:
            patterns.append(f"⚠️ Near 20-day LOW support at ₹{low_20}")

        # Bollinger Band
        if bb_upper and bb_lower:
            if current_price > bb_upper:
                patterns.append("📊 Price above upper Bollinger Band — strong momentum")
            elif current_price < bb_lower:
                patterns.append("📊 Price below lower Bollinger Band — oversold zone")

        # ── NEW: Candlestick Pattern Detection ───────────────────────────
        candle_patterns = detect_candlestick_patterns(df)

        # ── NEW: RSI Divergence Detection ────────────────────────────────
        divergences = []
        if rsi_col:
            divergences = detect_rsi_divergence(df, rsi_col[0])

        # ── NEW: Backtested Success Rates ────────────────────────────────
        backtests = run_backtests(df)

        # ── Build Output ─────────────────────────────────────────────────
        output = f"[Technical Analysis — {clean}]\n"
        output += f"Current Price: ₹{current_price}\n"
        output += f"20-day Range: ₹{low_20} — ₹{high_20}\n\n"

        if sma20: output += f"SMA 20: ₹{sma20}\n"
        if sma50: output += f"SMA 50: ₹{sma50}\n"
        if rsi: output += f"RSI (14): {rsi}\n"
        if macd: output += f"MACD: {macd} | Signal: {signal}\n"
        if bb_upper: output += f"Bollinger Bands: ₹{bb_lower} — ₹{bb_upper}\n"

        output += f"\nDetected Patterns:\n"
        for p in patterns:
            output += f"{p}\n"

        # Candlestick patterns
        if candle_patterns:
            output += f"\nCandlestick Patterns Detected:\n"
            for cp in candle_patterns:
                output += f"  {cp['direction']} — {cp['description']}\n"

        # RSI Divergences
        if divergences:
            output += f"\nDivergences Detected:\n"
            for d in divergences:
                output += f"  {d['type']} — {d['description']} (Significance: {d['significance']})\n"

        # Backtested success rates
        if backtests:
            output += f"\nHistorical Backtest Results (6-month data):\n"
            for bt in backtests:
                emoji = "📈" if bt['avg_return_pct'] > 0 else "📉"
                output += (
                    f"  {emoji} {bt['signal']}: "
                    f"Hit {bt['occurrences']} times → "
                    f"avg {bt['avg_return_pct']:+.2f}% in {bt['forward_days']} days "
                    f"(win rate: {bt['win_rate_pct']}%)\n"
                )

        output += f"\nSupport: ₹{low_20} | Resistance: ₹{high_20}"
        output += f"\nSource: NSE via yfinance (6-month OHLCV data)"

        return output

    except Exception as e:
        import traceback
        traceback.print_exc()
        return f"Error analyzing {ticker}: {str(e)}"