"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  RefreshCw, TrendingUp, TrendingDown, Activity,
  AlertCircle, ScanLine, Zap
} from "lucide-react"
import { API_BASE_URL } from "@/lib/api"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Signal {
  type: string
  detail: string
  direction: string
}

interface StockAlert {
  symbol: string
  price: number
  rsi: number | null
  signals: Signal[]
}

interface ScanResult {
  date: string
  scope: string
  total_in_universe: number
  scanned: number
  errors: number
  total_alerts: number
  alerts: StockAlert[]
}


const STOCK_SCOPES = [
  { value: "nifty50", label: "Nifty 50", desc: "Top 50 stocks", time: "~30 sec" },
  { value: "banknifty", label: "Bank Nifty", desc: "Banking stocks", time: "~15 sec" },
  { value: "finnifty", label: "Fin Nifty", desc: "Financial stocks", time: "~15 sec" },
  { value: "midcapnifty", label: "Midcap Nifty", desc: "Midcap 50", time: "~30 sec" },
]

// ─── Main Component ───────────────────────────────────────────────────────────

export function ScannerPage() {
  const router = useRouter()


  // Stock scanner state
  const [stockData, setStockData] = useState<ScanResult | null>(null)
  const [stockLoading, setStockLoading] = useState(false)
  const [stockError, setStockError] = useState("")
  const [scope, setScope] = useState("nifty50")

  // ── Stock Scanner ──────────────────────────────────────────────────────────

  async function runStockScan() {
    setStockLoading(true)
    setStockError("")
    try {
      const res = await fetch(`${API_BASE_URL}/scan?scope=${scope}`)
      if (!res.ok) throw new Error("Scan failed")
      const result: ScanResult = await res.json()
      setStockData(result)
    } catch {
      setStockError("Unable to run scan. Make sure the backend is running.")
    } finally {
      setStockLoading(false)
    }
  }

  const bullish = stockData?.alerts.filter(a => a.signals.some(s => s.direction === "bullish")) || []
  const bearish = stockData?.alerts.filter(a => a.signals.some(s => s.direction === "bearish")) || []


  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Universe Scanner</h1>
        <p className="text-muted-foreground">
          Scans entire NSE universe for breakouts, reversals, divergences & volume spikes
        </p>
      </div>

      {/* ── STOCK SCANNER ── */}
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex rounded-lg border border-border overflow-hidden">
            {STOCK_SCOPES.map(s => (
              <button
                key={s.value}
                onClick={() => setScope(s.value)}
                className={`px-3 py-2 text-xs font-medium transition-colors ${scope === s.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:bg-muted"
                  }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <Button onClick={runStockScan} disabled={stockLoading} size="lg">
            {stockLoading ? (
              <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Scanning...</>
            ) : (
              <><ScanLine className="h-4 w-4 mr-2" /> Scan</>
            )}
          </Button>
        </div>

        {stockError && (
          <div className="flex items-center gap-2 text-sm text-destructive p-4 rounded-lg border border-destructive/20 bg-destructive/5">
            <AlertCircle className="h-4 w-4" /> {stockError}
          </div>
        )}

        {!stockData && !stockLoading && (
          <Card>
            <CardContent className="py-20 text-center">
              <ScanLine className="h-16 w-16 mx-auto mb-4 text-muted-foreground/20" />
              <h3 className="text-lg font-semibold">Ready to Scan</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                Select an index and click Scan. Analyzes RSI, MACD, moving averages,
                volume & breakout signals across the universe.
              </p>
              <div className="flex justify-center flex-wrap gap-4 mt-6 text-xs text-muted-foreground">
                {STOCK_SCOPES.map(s => (
                  <div key={s.value}>
                    <span className="font-semibold text-foreground">{s.label}</span> {s.time}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {stockLoading && (
          <Card>
            <CardContent className="py-16 text-center">
              <RefreshCw className="h-12 w-12 mx-auto mb-4 text-primary animate-spin" />
              <h3 className="text-lg font-semibold">
                Scanning {STOCK_SCOPES.find(s => s.value === scope)?.label} Universe...
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                Analyzing RSI, MACD, SMA crossovers, volume spikes & breakouts.
              </p>
            </CardContent>
          </Card>
        )}

        {stockData && !stockLoading && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <Card><CardContent className="pt-4 pb-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">Scope</div>
                <div className="text-sm font-bold">{stockData.scope}</div>
              </CardContent></Card>
              <Card><CardContent className="pt-4 pb-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">Scanned</div>
                <div className="text-2xl font-bold">{stockData.scanned}<span className="text-sm text-muted-foreground font-normal">/{stockData.total_in_universe}</span></div>
              </CardContent></Card>
              <Card><CardContent className="pt-4 pb-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">Signals</div>
                <div className="text-2xl font-bold">{stockData.total_alerts}</div>
              </CardContent></Card>
              <Card className="border-green-500/20"><CardContent className="pt-4 pb-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">Bullish</div>
                <div className="text-2xl font-bold text-green-500">{bullish.length}</div>
              </CardContent></Card>
              <Card className="border-red-500/20"><CardContent className="pt-4 pb-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">Bearish</div>
                <div className="text-2xl font-bold text-red-500">{bearish.length}</div>
              </CardContent></Card>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <CardTitle className="text-base">Detected Signals</CardTitle>
                </div>
                <CardDescription>
                  {stockData.total_alerts} stocks with active signals • {stockData.scope} scan at {stockData.date}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stockData.alerts.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground text-sm">
                    <Activity className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p>No active signals detected across {stockData.scope} today.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {stockData.alerts.map((alert, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => router.push(`/performance?stock=${alert.symbol}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${alert.signals.some(s => s.direction === "bullish") ? "bg-green-500/10" : "bg-red-500/10"
                              }`}>
                              {alert.signals.some(s => s.direction === "bullish") ? (
                                <TrendingUp className="h-4 w-4 text-green-500" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{alert.symbol}</span>
                                <span className="text-sm text-muted-foreground">₹{alert.price}</span>
                                {alert.rsi && (
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                    RSI {alert.rsi}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">Chart →</div>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2 ml-11">
                          {alert.signals.map((sig, j) => (
                            <Badge
                              key={j}
                              variant={sig.direction === "bullish" ? "default" : sig.direction === "bearish" ? "destructive" : "secondary"}
                              className="text-[10px]"
                            >
                              {sig.type}: {sig.detail}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}