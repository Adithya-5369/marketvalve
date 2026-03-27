import yfinance as yf
import pandas as pd
import pandas_ta as ta
from langchain_core.tools import tool

@tool
def chart_pattern(ticker: str) -> str:
    """
    Detects technical chart patterns and indicators for any NSE stock.
    Use this for questions about technical analysis, chart patterns,
    support/resistance levels, momentum, RSI, MACD, moving averages.
    Example input: RELIANCE, TCS, HDFCBANK
    """
    try:
        clean = ticker.upper().replace(".NS", "").strip()
        stock = yf.Ticker(clean + ".NS")
        df = stock.history(period="3mo")

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

        # Pattern detection
        patterns = []

        # volume spike
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

        # golden death cross detection
        if sma20 and sma50:
            prev_sma20_col = sma20_col[0]
            prev_sma50_col = sma50_col[0]
            prev_sma20 = round(float(prev[prev_sma20_col]), 2)
            prev_sma50 = round(float(prev[prev_sma50_col]), 2)
            
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

        # Breakout detection
        if current_price >= high_20 * 0.99:
            patterns.append(f"🚀 Near 20-day HIGH breakout at ₹{high_20}")
        elif current_price <= low_20 * 1.01:
            patterns.append(f"⚠️ Near 20-day LOW support at ₹{low_20}")

        # Bollinger Band squeeze
        if bb_upper and bb_lower:
            if current_price > bb_upper:
                patterns.append("📊 Price above upper Bollinger Band — strong momentum")
            elif current_price < bb_lower:
                patterns.append("📊 Price below lower Bollinger Band — oversold zone")

        # Build output
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

        output += f"\nSupport: ₹{low_20} | Resistance: ₹{high_20}"
        output += f"\nSource: NSE via yfinance (3-month OHLCV data)"

        return output

    except Exception as e:
        import traceback
        traceback.print_exc()
        return f"Error analyzing {ticker}: {str(e)}"