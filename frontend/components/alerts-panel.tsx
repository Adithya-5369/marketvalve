"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react"

interface Deal {
  symbol: string
  clientName: string
  buySell: string
  qty: string
  watp: string
  date: string
  deal_type: string
}

interface Signal {
  title: string
  desc: string
  link: string
  date: string
  signals: string[]
  sentiment: string
  source?: string
}

interface RadarData {
  date: string
  nse_deals: string
  signals: Signal[]
  total_signals: number
}

function parseDealLines(raw: string): Deal[] {
  if (!raw || raw.includes("unavailable") || raw.includes("No bulk")) return []
  const deals: Deal[] = []
  const lines = raw.split("\n")
  let current: Partial<Deal> = {}
  for (const line of lines) {
    if (line.startsWith("•")) {
      if (current.symbol) deals.push(current as Deal)
      const parts = line.replace("•", "").trim().split("|")
      current = {
        deal_type: parts[0]?.trim() || "Deal",
        symbol: parts[1]?.trim() || "",
      }
    } else if (line.includes("Client:")) {
      current.clientName = line.replace("Client:", "").trim()
    } else if (line.includes("Action:")) {
      const p = line.replace("Action:", "").split("|")
      current.buySell = p[0]?.trim() || ""
      current.qty = p[1]?.replace("Qty:", "").trim() || ""
      current.watp = p[2]?.replace("Price: ₹", "").trim() || ""
      current.date = p[3]?.replace("Date:", "").trim() || ""
    }
  }
  if (current.symbol) deals.push(current as Deal)
  return deals
}

export function AlertsPanel({ fullWidth = false }: { fullWidth?: boolean }) {
  const [radarData, setRadarData] = useState<RadarData | null>(null)
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState<"deals" | "signals">("deals")
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])
  async function fetchRadar(isBackground = false) {
      if (!isBackground) setLoading(true)
      setError("")
      
      try {
        const res = await fetch("http://localhost:8000/radar?stock=ALL")
        if (!res.ok) throw new Error("Failed to fetch")
        const data: RadarData = await res.json()
        
        setRadarData(data)
        setDeals(parseDealLines(data.nse_deals))
        setLastRefresh(new Date()) // This will update the "Updated at XX:XX" timestamp!
      } catch (e) {
        if (!isBackground) setError("Unable to fetch live data. Backend may be offline.")
      } finally {
        if (!isBackground) setLoading(false)
      }
    }

    useEffect(() => {
      // 1. Initial fetch
      fetchRadar(false)

      // 2. Silent background fetch every 60 seconds (60000 ms)
      const intervalId = setInterval(() => fetchRadar(true), 60000)

      // 3. Cleanup
      return () => clearInterval(intervalId)
    }, [])

  const buyDeals = deals.filter(d => d.buySell?.toUpperCase().includes("B"))
  const sellDeals = deals.filter(d => !d.buySell?.toUpperCase().includes("B"))
  const bullishSignals = radarData?.signals.filter(s => s.sentiment.includes("Bullish")) || []
  const bearishSignals = radarData?.signals.filter(s => s.sentiment.includes("Bearish")) || []

  return (
    <Card className={fullWidth ? "col-span-full" : ""}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            Opportunity Radar
            <Badge variant="outline" className="text-xs font-normal">
              {radarData?.date || "Live"}
            </Badge>
          </CardTitle>
          <CardDescription>
            Live NSE bulk/block deals + institutional signals
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {isMounted ? `Updated ${lastRefresh.toLocaleTimeString()}` : "Updating..."}
          </span>
          <Button variant="outline" size="icon" onClick={() => fetchRadar(false)} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-3">
          <div className="rounded-lg border p-3 text-center">
            <div className="text-2xl font-bold text-green-500">{buyDeals.length}</div>
            <div className="text-xs text-muted-foreground">Buy Deals</div>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <div className="text-2xl font-bold text-red-500">{sellDeals.length}</div>
            <div className="text-xs text-muted-foreground">Sell Deals</div>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <div className="text-2xl font-bold text-green-500">{bullishSignals.length}</div>
            <div className="text-xs text-muted-foreground">Bullish Signals</div>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <div className="text-2xl font-bold text-red-500">{bearishSignals.length}</div>
            <div className="text-xs text-muted-foreground">Bearish Signals</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setActiveTab("deals")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "deals"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            NSE Bulk/Block Deals ({deals.length})
          </button>
          <button
            onClick={() => setActiveTab("signals")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "signals"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Market Signals ({radarData?.total_signals || 0})
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-sm text-destructive p-4 rounded-lg border border-destructive/20 bg-destructive/5">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        ) : activeTab === "deals" ? (
          <div className="space-y-2">
            {deals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No bulk/block deals found today. NSE data updates during market hours (9:15 AM – 3:30 PM IST).
              </div>
            ) : (
              deals.map((deal, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    {deal.buySell?.toUpperCase().includes("B") ? (
                      <TrendingUp className="h-4 w-4 text-green-500 shrink-0" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500 shrink-0" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{deal.symbol}</span>
                        <Badge variant="outline" className="text-xs">{deal.deal_type}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">{deal.clientName}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium text-sm ${
                      deal.buySell?.toUpperCase().includes("B") ? "text-green-500" : "text-red-500"
                    }`}>
                      {deal.buySell?.toUpperCase().includes("B") ? "BUY" : "SELL"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {deal.qty ? `${parseInt(deal.qty.replace(/,/g, "")).toLocaleString("en-IN")} shares` : ""}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {deal.watp ? `@ ₹${deal.watp}` : ""}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {(radarData?.signals || []).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No market signals detected in today's ET Markets news.
              </div>
            ) : (
              (radarData?.signals || []).map((signal, i) => (
                <div key={i} className="p-3 rounded-lg border hover:bg-muted transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {signal.sentiment.includes("Bullish") ? (
                          <TrendingUp className="h-3 w-3 text-green-500 shrink-0" />
                        ) : signal.sentiment.includes("Bearish") ? (
                          <TrendingDown className="h-3 w-3 text-red-500 shrink-0" />
                        ) : (
                          <Minus className="h-3 w-3 text-muted-foreground shrink-0" />
                        )}
                        {signal.signals.map((s, j) => (
                          <Badge
                            key={j}
                            variant={
                              ["fii_buy", "insider_buy", "upgrade", "breakout"].includes(s)
                                ? "default"
                                : ["fii_sell", "insider_sell", "downgrade", "breakdown"].includes(s)
                                ? "destructive"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {s.replace("_", " ").toUpperCase()}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-sm font-medium leading-snug">{signal.title}</div>
                      {signal.desc && (
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {signal.desc}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {signal.source || "ET Markets"} • {signal.date ? signal.date.slice(0, 16) : ""}
                    </span>
                    {signal.link && (
                      <a
                        href={signal.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        Read →
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}