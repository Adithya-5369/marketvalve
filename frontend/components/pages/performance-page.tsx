"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Search, TrendingUp, TrendingDown, BarChart2,
  RefreshCw, Activity, Target, Zap, ArrowUpRight, ArrowDownRight
} from "lucide-react"
import { API_BASE_URL } from "@/lib/api"

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false })

const QUICK_STOCKS = [
  { symbol: "RELIANCE", label: "Reliance" },
  { symbol: "TCS", label: "TCS" },
  { symbol: "HDFCBANK", label: "HDFC Bank" },
  { symbol: "INFY", label: "Infosys" },
  { symbol: "ICICIBANK", label: "ICICI Bank" },
  { symbol: "SBIN", label: "SBI" },
  { symbol: "BAJFINANCE", label: "Bajaj Fin." },
  { symbol: "WIPRO", label: "Wipro" },
]

type ChartData = {
  ticker: string
  dates: string[]
  ohlc: { open: number[], high: number[], low: number[], close: number[] }
  volume: number[]
  sma20: number[]
  sma50: number[]
  bb_upper: number[]
  bb_lower: number[]
  rsi: number[]
}

export function PerformancePage({ initialStock }: { initialStock?: string }) {
  const [ticker, setTicker] = useState("")
  const [loading, setLoading] = useState(false)
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState("3mo")
  const [showSMA, setShowSMA] = useState(true)
  const [showBB, setShowBB] = useState(true)
  const [showVolume, setShowVolume] = useState(true)

  // Auto-load stock from search bar navigation
  useEffect(() => {
    if (initialStock) {
      setTicker(initialStock)
      analyzeStock(initialStock)
    }
  }, [initialStock])

  async function analyzeStock(stock: string) {
    const t = (stock || ticker).toUpperCase().replace(".NS", "")
    if (!t) return
    setTicker(t)
    setLoading(true)
    setChartData(null)
    setAnalysis(null)
    setError(null)

    try {
      const [chartRes, aiRes] = await Promise.all([
        fetch(`${API_BASE_URL}/chart/${t}?period=${period}`),
        fetch(`${API_BASE_URL}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: `Technical analysis of ${t}` })
        })
      ])

      const chart = await chartRes.json()
      const ai = await aiRes.json()

      if (chart.error) {
        setError(`Chart error: ${chart.error}`)
      } else {
        setChartData(chart)
      }
      setAnalysis(ai.response)
    } catch {
      setError("Failed to connect to MarketValve API.")
    } finally {
      setLoading(false)
    }
  }

  const periods = [
    { label: "1M", value: "1mo" },
    { label: "3M", value: "3mo" },
    { label: "6M", value: "6mo" },
    { label: "1Y", value: "1y" },
  ]


  const lastClose = chartData?.ohlc.close.at(-1)
  const prevClose = chartData?.ohlc.close.at(-2)
  const priceChange = lastClose && prevClose ? lastClose - prevClose : 0
  const pctChange = prevClose ? (priceChange / prevClose) * 100 : 0
  const isUp = priceChange >= 0

  const lastRSI = chartData?.rsi.at(-1)
  const rsiSignal = lastRSI ? (lastRSI > 70 ? "Overbought" : lastRSI < 30 ? "Oversold" : "Neutral") : "—"
  const rsiColor = rsiSignal === "Overbought" ? "text-red-500" : rsiSignal === "Oversold" ? "text-green-500" : "text-muted-foreground"

  const sma20_last = chartData?.sma20.at(-1)
  const sma50_last = chartData?.sma50.at(-1)

  const dayHigh = chartData ? Math.max(...chartData.ohlc.high) : 0
  const dayLow = chartData ? Math.min(...chartData.ohlc.low.filter(v => v > 0)) : 0
  const avgVolume = chartData ? (chartData.volume.reduce((a, b) => a + b, 0) / chartData.volume.length) : 0


  let signal = "HOLD"
  let signalReason = "No clear directional signal"
  let signalColor = "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"

  if (lastRSI && lastRSI < 35 && lastClose && sma20_last && lastClose > sma20_last) {
    signal = "BUY"
    signalReason = "RSI oversold + price above SMA20"
    signalColor = "bg-green-500/10 text-green-600 border-green-500/20"
  } else if (lastRSI && lastRSI > 65 && lastClose && sma20_last && lastClose < sma20_last) {
    signal = "SELL"
    signalReason = "RSI overbought + price below SMA20"
    signalColor = "bg-red-500/10 text-red-600 border-red-500/20"
  } else if (sma20_last && sma50_last && sma20_last > sma50_last) {
    signal = "BUY"
    signalReason = "Golden Cross (SMA20 > SMA50)"
    signalColor = "bg-green-500/10 text-green-600 border-green-500/20"
  } else if (sma20_last && sma50_last && sma20_last < sma50_last) {
    signal = "SELL"
    signalReason = "Death Cross (SMA20 < SMA50)"
    signalColor = "bg-red-500/10 text-red-600 border-red-500/20"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">
          📊 Chart Pattern Intelligence
        </h1>
        <CardDescription className="flex items-center gap-1.5 pt-1">
          AI-powered technical analysis with live NSE charts • candlesticks, RSI, Bollinger Bands, and smart signals.
        </CardDescription>
      </div>

      {/* Search Card */}
      <Card className="border-primary/10">
        <CardContent className="pt-6 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search NSE stock • e.g. RELIANCE, TCS, HDFCBANK"
                className="pl-9 h-10"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && analyzeStock("")}
              />
            </div>

            {/* Period Pills */}
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              {periods.map(p => (
                <button
                  key={p.value}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    period === p.value
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setPeriod(p.value)}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <Button
              onClick={() => analyzeStock("")}
              disabled={loading || !ticker}
              className="min-w-[120px]"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <BarChart2 className="h-4 w-4 mr-2" />
              )}
              {loading ? "Analyzing..." : "Analyze"}
            </Button>
          </div>

          {/* Quick Stock Pills */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-muted-foreground pt-1.5 mr-1">Popular:</span>
            {QUICK_STOCKS.map(s => (
              <button
                key={s.symbol}
                className="px-3 py-1.5 rounded-full text-xs font-medium border border-border
                  hover:bg-primary hover:text-primary-foreground hover:border-primary
                  transition-all duration-200 hover:shadow-sm"
                onClick={() => { setTicker(s.symbol); analyzeStock(s.symbol) }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card className="border-primary/20">
          <CardContent className="py-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
            <p className="text-lg font-medium">Analyzing {ticker}...</p>
            <p className="text-sm text-muted-foreground mt-1">
              Fetching live NSE data, computing indicators, and running AI pattern detection
            </p>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="py-6 text-center text-destructive font-medium">
            {error}
          </CardContent>
        </Card>
      )}

      {/* Stats Cards Row */}
      {chartData && !loading && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {/* Price Card */}
          <Card className="col-span-2 md:col-span-1">
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-muted-foreground mb-1">Last Price</p>
              <p className="text-2xl font-bold tracking-tight">
                ₹{lastClose?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className={`flex items-center gap-1 mt-1 text-sm font-medium ${isUp ? "text-green-500" : "text-red-500"}`}>
                {isUp ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                {isUp ? "+" : ""}{priceChange.toFixed(2)} ({isUp ? "+" : ""}{pctChange.toFixed(2)}%)
              </div>
            </CardContent>
          </Card>

          {/* Signal Card */}
          <Card className={`border ${signalColor}`}>
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-muted-foreground mb-1">AI Signal</p>
              <p className="text-xl font-bold">{signal}</p>
              <p className="text-xs mt-1 opacity-80">{signalReason}</p>
            </CardContent>
          </Card>

          {/* RSI Card */}
          <Card>
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-muted-foreground mb-1">RSI (14)</p>
              <p className={`text-xl font-bold ${rsiColor}`}>
                {lastRSI?.toFixed(1) || "—"}
              </p>
              <p className={`text-xs mt-1 ${rsiColor}`}>{rsiSignal}</p>
            </CardContent>
          </Card>

          {/* Range Card */}
          <Card>
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-muted-foreground mb-2">Price Range</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">₹{dayLow.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                  <span className="font-semibold text-foreground text-sm">
                    ₹{lastClose?.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                  </span>
                  <span className="text-muted-foreground">₹{dayHigh.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="relative h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 rounded-full transition-all"
                    style={{ width: '100%' }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-primary rounded-full shadow-md transition-all"
                    style={{
                      left: `clamp(0%, ${dayHigh > dayLow ? ((lastClose! - dayLow) / (dayHigh - dayLow)) * 100 : 50}%, 100%)`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Volume Card */}
          <Card>
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-muted-foreground mb-1">Avg Volume</p>
              <p className="text-xl font-bold">
                {avgVolume >= 1e7 ? `${(avgVolume / 1e7).toFixed(1)}Cr`
                  : avgVolume >= 1e5 ? `${(avgVolume / 1e5).toFixed(1)}L`
                  : avgVolume.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">shares/day</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Chart */}
      {chartData && !loading && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BarChart2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{chartData.ticker}</CardTitle>
                  <CardDescription>NSE • {period === "1mo" ? "1 Month" : period === "3mo" ? "3 Months" : period === "6mo" ? "6 Months" : "1 Year"}</CardDescription>
                </div>
              </div>

              {/* Indicator Toggles */}
              <div className="flex gap-2">
                <button
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    showSMA
                      ? "bg-blue-500/10 text-blue-600 border-blue-500/30"
                      : "text-muted-foreground border-border hover:border-blue-500/30"
                  }`}
                  onClick={() => setShowSMA(!showSMA)}
                >
                  SMA 20/50
                </button>
                <button
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    showBB
                      ? "bg-purple-500/10 text-purple-600 border-purple-500/30"
                      : "text-muted-foreground border-border hover:border-purple-500/30"
                  }`}
                  onClick={() => setShowBB(!showBB)}
                >
                  Bollinger
                </button>
                <button
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    showVolume
                      ? "bg-slate-500/10 text-slate-600 border-slate-500/30"
                      : "text-muted-foreground border-border hover:border-slate-500/30"
                  }`}
                  onClick={() => setShowVolume(!showVolume)}
                >
                  Volume
                </button>
              </div>
            </div>

            {/* Period note for indicators */}
            {period === "1mo" && (showSMA || showBB) && (
              <p className="text-xs text-amber-500 mt-2 flex items-center gap-1">
                ⚠ 1M period has limited data for SMA/Bollinger. Use 3M+ for full indicator coverage.
              </p>
            )}
          </CardHeader>

          <CardContent className="px-2 pb-2">
            {/* Main Candlestick Chart */}
            <Plot
              data={[
                // Candlestick
                {
                  type: "candlestick",
                  x: chartData.dates,
                  open: chartData.ohlc.open,
                  high: chartData.ohlc.high,
                  low: chartData.ohlc.low,
                  close: chartData.ohlc.close,
                  name: chartData.ticker,
                  increasing: { line: { color: "#22c55e", width: 1 }, fillcolor: "#22c55e" },
                  decreasing: { line: { color: "#ef4444", width: 1 }, fillcolor: "#ef4444" },
                },
                // SMA 20
                showSMA && chartData.sma20.length > 0 && {
                  type: "scatter",
                  x: chartData.dates,
                  y: chartData.sma20,
                  name: "SMA 20",
                  line: { color: "#3b82f6", width: 1.5 },
                  mode: "lines",
                  connectgaps: true,
                },
                // SMA 50
                showSMA && chartData.sma50.length > 0 && {
                  type: "scatter",
                  x: chartData.dates,
                  y: chartData.sma50,
                  name: "SMA 50",
                  line: { color: "#f59e0b", width: 1.5 },
                  mode: "lines",
                  connectgaps: true,
                },
                // BB Upper
                showBB && chartData.bb_upper.length > 0 && {
                  type: "scatter",
                  x: chartData.dates,
                  y: chartData.bb_upper,
                  name: "BB Upper",
                  line: { color: "#a855f7", width: 1, dash: "dot" },
                  mode: "lines",
                  connectgaps: true,
                },
                // BB Lower
                showBB && chartData.bb_lower.length > 0 && {
                  type: "scatter",
                  x: chartData.dates,
                  y: chartData.bb_lower,
                  name: "BB Lower",
                  line: { color: "#a855f7", width: 1, dash: "dot" },
                  mode: "lines",
                  connectgaps: true,
                  fill: "tonexty",
                  fillcolor: "rgba(168,85,247,0.06)",
                },
                // Volume
                showVolume && {
                  type: "bar",
                  x: chartData.dates,
                  y: chartData.volume,
                  name: "Volume",
                  yaxis: "y2",
                  marker: {
                    color: chartData.ohlc.close.map((c, i) =>
                      i > 0 && c >= chartData.ohlc.close[i - 1] ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"
                    ),
                  },
                },
              ].filter(Boolean) as any[]}
              layout={{
                height: 480,
                margin: { t: 10, r: 50, b: 40, l: 70 },
                paper_bgcolor: "transparent",
                plot_bgcolor: "transparent",
                font: { color: "#888", size: 11, family: "Inter, sans-serif" },
                xaxis: {
                  rangeslider: { visible: false },
                  gridcolor: "rgba(128,128,128,0.1)",
                  linecolor: "rgba(128,128,128,0.2)",
                  color: "#888",
                  type: "date",
                },
                yaxis: {
                  gridcolor: "rgba(128,128,128,0.1)",
                  linecolor: "rgba(128,128,128,0.2)",
                  color: "#888",
                  tickprefix: "₹",
                  side: "right",
                },
                yaxis2: {
                  overlaying: "y",
                  side: "left",
                  showgrid: false,
                  showticklabels: false,
                  range: [0, Math.max(...chartData.volume) * 4],
                },
                legend: {
                  orientation: "h",
                  y: -0.12,
                  x: 0.5,
                  xanchor: "center",
                  bgcolor: "transparent",
                  font: { size: 10 },
                },
                hovermode: "x unified",
                showlegend: true,
                dragmode: "zoom",
              }}
              config={{
                responsive: true,
                displayModeBar: false,
                scrollZoom: true,
              }}
              style={{ width: "100%" }}
            />

            {/* RSI Sub-Chart */}
            {chartData.rsi.length > 0 && (
              <div className="mt-1 border-t border-border/50 pt-1">
                <div className="flex justify-between items-center px-4 py-1">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Activity className="h-3 w-3" /> RSI (14)
                  </span>
                  <span className={`text-xs font-semibold ${rsiColor}`}>
                    {lastRSI?.toFixed(1)} • {rsiSignal}
                  </span>
                </div>

                <Plot
                  data={[
                    {
                      type: "scatter",
                      x: chartData.dates,
                      y: chartData.rsi,
                      name: "RSI",
                      line: { color: "#06b6d4", width: 1.5 },
                      mode: "lines",
                      fill: "tozeroy",
                      fillcolor: "rgba(6,182,212,0.05)",
                    },
                    {
                      type: "scatter",
                      x: [chartData.dates[0], chartData.dates.at(-1)],
                      y: [70, 70],
                      mode: "lines",
                      line: { color: "rgba(239,68,68,0.4)", width: 1, dash: "dash" },
                      name: "Overbought (70)",
                      showlegend: false,
                    },
                    {
                      type: "scatter",
                      x: [chartData.dates[0], chartData.dates.at(-1)],
                      y: [30, 30],
                      mode: "lines",
                      line: { color: "rgba(34,197,94,0.4)", width: 1, dash: "dash" },
                      name: "Oversold (30)",
                      showlegend: false,
                    },
                  ]}
                  layout={{
                    height: 120,
                    margin: { t: 5, r: 50, b: 25, l: 70 },
                    paper_bgcolor: "transparent",
                    plot_bgcolor: "transparent",
                    font: { color: "#888", size: 10, family: "Inter, sans-serif" },
                    xaxis: {
                      gridcolor: "rgba(128,128,128,0.1)",
                      color: "#888",
                      showticklabels: false,
                    },
                    yaxis: {
                      gridcolor: "rgba(128,128,128,0.1)",
                      color: "#888",
                      range: [0, 100],
                      tickvals: [30, 50, 70],
                      side: "right",
                    },
                    showlegend: false,
                  }}
                  config={{ responsive: true, displayModeBar: false }}
                  style={{ width: "100%" }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* AI Analysis */}
      {analysis && !loading && (
        <Card className="border-primary/10">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              AI Pattern Analysis
            </CardTitle>
            <CardDescription>Powered by Sarvam AI • Real-time technical intelligence</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 rounded-xl p-5 text-sm leading-relaxed whitespace-pre-wrap border border-border/50">
              {analysis}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!chartData && !loading && !error && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="group hover:border-green-500/30 transition-colors duration-300">
            <CardHeader className="pb-2">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <CardTitle className="text-base">Trend Detection</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Golden Cross, Death Cross, uptrend/downtrend patterns using 20-day and 50-day moving averages.
            </CardContent>
          </Card>

          <Card className="group hover:border-blue-500/30 transition-colors duration-300">
            <CardHeader className="pb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Activity className="h-5 w-5 text-blue-500" />
              </div>
              <CardTitle className="text-base">Momentum Signals</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              RSI overbought/oversold zones, Bollinger Band squeezes, and volume spike detection.
            </CardContent>
          </Card>

          <Card className="group hover:border-orange-500/30 transition-colors duration-300">
            <CardHeader className="pb-2">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Target className="h-5 w-5 text-orange-500" />
              </div>
              <CardTitle className="text-base">Support & Resistance</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Key support and resistance zones with breakout detection and price target levels.
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}