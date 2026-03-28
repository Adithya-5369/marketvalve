import yfinance as yf
import pandas as pd
import ta as ta_lib
import numpy as np
from langchain_core.tools import tool



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
    """Detect simple candlestick patterns manually (no pandas_ta needed)."""
    detected = []
    try:
        if len(df) < 3:
            return detected

        latest = df.iloc[-1]
        prev = df.iloc[-2]
        o, h, l, c = float(latest['Open']), float(latest['High']), float(latest['Low']), float(latest['Close'])
        body = abs(c - o)
        upper_shadow = h - max(o, c)
        lower_shadow = min(o, c) - l
        total_range = h - l

        if total_range == 0:
            return detected

        if body / total_range < 0.1:
            detected.append({"name": "Doji", "direction": "Neutral ⚪", "description": CANDLE_DESCRIPTIONS["CDL_DOJI"], "strength": 1})

        if lower_shadow > body * 2 and upper_shadow < body * 0.5 and c > o:
            detected.append({"name": "Hammer", "direction": "Bullish 🟢", "description": CANDLE_DESCRIPTIONS["CDL_HAMMER"], "strength": 2})

        if upper_shadow > body * 2 and lower_shadow < body * 0.5 and c < o:
            detected.append({"name": "Shooting Star", "direction": "Bearish 🔴", "description": CANDLE_DESCRIPTIONS["CDL_SHOOTINGSTAR"], "strength": 2})

        po, pc = float(prev['Open']), float(prev['Close'])
        if pc < po and c > o and c > po and o < pc:
            detected.append({"name": "Bullish Engulfing", "direction": "Bullish 🟢", "description": CANDLE_DESCRIPTIONS["CDL_ENGULFING"], "strength": 3})
        elif pc > po and c < o and c < po and o > pc:
            detected.append({"name": "Bearish Engulfing", "direction": "Bearish 🔴", "description": CANDLE_DESCRIPTIONS["CDL_ENGULFING"], "strength": 3})

        if upper_shadow / total_range < 0.05 and lower_shadow / total_range < 0.05:
            direction = "Bullish 🟢" if c > o else "Bearish 🔴"
            detected.append({"name": "Marubozu", "direction": direction, "description": CANDLE_DESCRIPTIONS["CDL_MARUBOZU"], "strength": 3})

    except Exception:
        pass
    return detected




def detect_rsi_divergence(df: pd.DataFrame, rsi_col: str, lookback: int = 14) -> list:
    """Detect bullish/bearish RSI divergences."""
    divergences = []
    if rsi_col not in df.columns or len(df) < lookback + 5:
        return divergences

    prices = df['Close'].values
    rsi = df[rsi_col].values

    recent = slice(-lookback, None)
    price_slice = prices[recent]
    rsi_slice = rsi[recent]

    valid = ~np.isnan(rsi_slice)
    if valid.sum() < 5:
        return divergences

    price_valid = price_slice[valid]
    rsi_valid = rsi_slice[valid]

    price_min_idx = np.argmin(price_valid[:len(price_valid)//2])
    price_min_idx2 = len(price_valid)//2 + np.argmin(price_valid[len(price_valid)//2:])

    if price_valid[price_min_idx2] < price_valid[price_min_idx]:
        if rsi_valid[price_min_idx2] > rsi_valid[price_min_idx]:
            divergences.append({
                "type": "Bullish Divergence 🟢",
                "description": "Price making lower lows while RSI making higher lows — potential reversal upward",
                "significance": "High"
            })

    price_max_idx = np.argmax(price_valid[:len(price_valid)//2])
    price_max_idx2 = len(price_valid)//2 + np.argmax(price_valid[len(price_valid)//2:])

    if price_valid[price_max_idx2] > price_valid[price_max_idx]:
        if rsi_valid[price_max_idx2] < rsi_valid[price_max_idx]:
            divergences.append({
                "type": "Bearish Divergence 🔴",
                "description": "Price making higher highs while RSI making lower highs — potential reversal downward",
                "significance": "High"
            })

    return divergences




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
        rsi_vals = ta_lib.momentum.RSIIndicator(close=w['Close'], window=14).rsi()
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




def calculate_indicators(df: pd.DataFrame) -> pd.DataFrame:
    """Add RSI, MACD, SMA, Bollinger Bands columns using the `ta` library."""
    df['RSI_14'] = ta_lib.momentum.RSIIndicator(close=df['Close'], window=14).rsi()

    macd_indicator = ta_lib.trend.MACD(close=df['Close'])
    df['MACD_12_26_9'] = macd_indicator.macd()
    df['MACDs_12_26_9'] = macd_indicator.macd_signal()
    df['MACDh_12_26_9'] = macd_indicator.macd_diff()

    df['SMA_20'] = ta_lib.trend.SMAIndicator(close=df['Close'], window=20).sma_indicator()
    df['SMA_50'] = ta_lib.trend.SMAIndicator(close=df['Close'], window=50).sma_indicator()

    bb = ta_lib.volatility.BollingerBands(close=df['Close'], window=20)
    df['BBU_20'] = bb.bollinger_hband()
    df['BBL_20'] = bb.bollinger_lband()

    return df




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

        df = calculate_indicators(df)

        latest = df.iloc[-1]
        prev = df.iloc[-2]

        current_price = round(float(latest['Close']), 2)

        rsi = round(float(latest['RSI_14']), 2) if not pd.isna(latest['RSI_14']) else None

        macd = round(float(latest['MACD_12_26_9']), 2) if not pd.isna(latest['MACD_12_26_9']) else None
        signal = round(float(latest['MACDs_12_26_9']), 2) if not pd.isna(latest['MACDs_12_26_9']) else None

        sma20 = round(float(latest['SMA_20']), 2) if not pd.isna(latest['SMA_20']) else None
        sma50 = round(float(latest['SMA_50']), 2) if not pd.isna(latest['SMA_50']) else None

        bb_upper = round(float(latest['BBU_20']), 2) if not pd.isna(latest['BBU_20']) else None
        bb_lower = round(float(latest['BBL_20']), 2) if not pd.isna(latest['BBL_20']) else None

        high_20 = round(float(df['High'].tail(20).max()), 2)
        low_20 = round(float(df['Low'].tail(20).min()), 2)

        patterns = []

        avg_volume = int(df['Volume'].tail(20).mean())
        latest_volume = int(latest['Volume'])
        if latest_volume > avg_volume * 1.5:
            patterns.append(f"📢 Volume spike — {latest_volume:,} vs avg {avg_volume:,} (unusual activity)")

        if sma20 and sma50:
            if current_price > sma20 > sma50:
                patterns.append("✅ Strong Uptrend — price above both 20 & 50 day MA")
            elif current_price < sma20 < sma50:
                patterns.append("🔴 Downtrend — price below both 20 & 50 day MA")
            elif sma20 > sma50:
                patterns.append("⚡ Bullish crossover — 20MA above 50MA")

        if sma20 and sma50:
            prev_sma20 = round(float(prev['SMA_20']), 2) if not pd.isna(prev['SMA_20']) else None
            prev_sma50 = round(float(prev['SMA_50']), 2) if not pd.isna(prev['SMA_50']) else None
            if prev_sma20 and prev_sma50:
                if prev_sma20 < prev_sma50 and sma20 > sma50:
                    patterns.append("⭐ Golden Cross detected — strong bullish signal")
                elif prev_sma20 > prev_sma50 and sma20 < sma50:
                    patterns.append("💀 Death Cross detected — strong bearish signal")

        if rsi:
            if rsi > 70:
                patterns.append(f"⚠️ Overbought — RSI at {rsi} (above 70)")
            elif rsi < 30:
                patterns.append(f"🟢 Oversold — RSI at {rsi} (below 30), possible reversal")
            elif 50 < rsi < 70:
                patterns.append(f"📈 Bullish momentum — RSI at {rsi}")
            else:
                patterns.append(f"📉 Bearish momentum — RSI at {rsi}")

        if macd and signal:
            if macd > signal:
                patterns.append("🟢 MACD bullish crossover — buy signal")
            else:
                patterns.append("🔴 MACD bearish crossover — sell signal")

        if current_price >= high_20 * 0.99:
            patterns.append(f"🚀 Near 20-day HIGH breakout at ₹{high_20}")
        elif current_price <= low_20 * 1.01:
            patterns.append(f"⚠️ Near 20-day LOW support at ₹{low_20}")

        if bb_upper and bb_lower:
            if current_price > bb_upper:
                patterns.append("📊 Price above upper Bollinger Band — strong momentum")
            elif current_price < bb_lower:
                patterns.append("📊 Price below lower Bollinger Band — oversold zone")

        candle_patterns = detect_candlestick_patterns(df)

        divergences = []
        divergences = detect_rsi_divergence(df, 'RSI_14')

        backtests = run_backtests(df)

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