"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  RefreshCw, TrendingUp, TrendingDown, Minus,
  AlertCircle, Newspaper, X
} from "lucide-react"
import { API_BASE_URL } from "@/lib/api"

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

export function AlertsPage({ initialStock }: { initialStock?: string }) {
  const router = useRouter()
  const [stockFilter, setStockFilter] = useState(initialStock?.toUpperCase() || "")
  const [radarData, setRadarData] = useState<RadarData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [isMounted, setIsMounted] = useState(false)
  const [view, setView] = useState<"cards" | "table">("cards")

  useEffect(() => { setIsMounted(true) }, [])

  // Sync filter when navigating from search bar with a different stock
  useEffect(() => {
    setStockFilter(initialStock?.toUpperCase() || "")
  }, [initialStock])

  async function fetchSignals(isBackground = false) {
    if (!isBackground) setLoading(true)
    setError("")
    try {
      const stockParam = stockFilter || "ALL"
      const res = await fetch(`${API_BASE_URL}/radar?stock=${stockParam}`)
      if (!res.ok) throw new Error("Failed to fetch")
      const data: RadarData = await res.json()
      setRadarData(data)
      setLastRefresh(new Date())
    } catch {
      if (!isBackground) setError("Unable to fetch live data. Backend may be offline.")
    } finally {
      if (!isBackground) setLoading(false)
    }
  }

  useEffect(() => {
    fetchSignals(false)
    const id = setInterval(() => fetchSignals(true), 60000)
    return () => clearInterval(id)
  }, [stockFilter])

  const signals = radarData?.signals || []
  const bullish = signals.filter(s => s.sentiment.includes("Bullish"))
  const bearish = signals.filter(s => s.sentiment.includes("Bearish"))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Market Signals
          </h1>
          <CardDescription className="flex items-center gap-1.5 pt-1">
            AI-powered sentiment analysis from ET Markets & Moneycontrol • powered by Sarvam AI
          </CardDescription>
          {stockFilter && (
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="gap-1">
                Filtered: {stockFilter}
                <button onClick={() => { setStockFilter(""); router.push("/alerts") }} className="ml-1 hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs text-muted-foreground">
              {isMounted ? `Updated ${lastRefresh.toLocaleTimeString()}` : "Updating..."}
            </div>
          </div>
          <Button variant="outline" size="icon" onClick={() => fetchSignals(false)} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <div className="text-3xl font-bold">{signals.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Total Signals</div>
          </CardContent>
        </Card>
        <Card className="border-green-500/20">
          <CardContent className="pt-4 pb-3 text-center">
            <div className="text-3xl font-bold text-green-500">{bullish.length}</div>
            <div className="text-xs text-muted-foreground mt-1">🟢 Bullish</div>
          </CardContent>
        </Card>
        <Card className="border-red-500/20">
          <CardContent className="pt-4 pb-3 text-center">
            <div className="text-3xl font-bold text-red-500">{bearish.length}</div>
            <div className="text-xs text-muted-foreground mt-1">🔴 Bearish</div>
          </CardContent>
        </Card>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive p-4 rounded-lg border border-destructive/20 bg-destructive/5">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      {/* View Toggle */}
      <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit">
        <button
          className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
            view === "cards" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setView("cards")}
        >
          Cards
        </button>
        <button
          className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
            view === "table" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setView("table")}
        >
          Table
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : signals.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Newspaper className="h-12 w-12 mx-auto mb-4 opacity-20 text-muted-foreground" />
            <p className="font-medium text-base">No AI signals detected today</p>
            <p className="text-xs text-muted-foreground mt-2 max-w-md mx-auto">
              Signals appear when Sarvam AI detects actionable patterns in ET Markets and Moneycontrol news articles.
            </p>
          </CardContent>
        </Card>
      ) : view === "cards" ? (
        <div className="grid gap-3 md:grid-cols-2">
          {signals.map((signal, i) => (
            <Card key={i} className="hover:bg-muted/30 transition-colors">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-start gap-3">
                  {signal.sentiment.includes("Bullish") ? (
                    <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center mt-0.5 shrink-0">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                  ) : signal.sentiment.includes("Bearish") ? (
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center mt-0.5 shrink-0">
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center mt-0.5 shrink-0">
                      <Minus className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-1 mb-1.5">
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
                          className="text-[10px] px-1.5 py-0"
                        >
                          {s.replace("_", " ").toUpperCase()}
                        </Badge>
                      ))}
                    </div>
                    <div className="text-sm font-medium leading-snug">{signal.title}</div>
                    {signal.desc && (
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{signal.desc}</div>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[11px] text-muted-foreground">
                        {signal.source || "ET Markets"} • {signal.date ? signal.date.slice(0, 16) : ""}
                      </span>
                      {signal.link && (
                        <a href={signal.link} target="_blank" rel="noopener noreferrer"
                          className="text-[11px] text-primary hover:underline">
                          Read →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-4">
            <div className="rounded-md border overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Headline</TableHead>
                      <TableHead>Sentiment</TableHead>
                      <TableHead>Source</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {signals.map((signal, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-xs whitespace-nowrap">
                          {signal.date ? signal.date.slice(0, 16) : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {signal.signals[0]?.replace("_", " ").toUpperCase() || "News"}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[300px]">
                          <div className="text-sm font-medium line-clamp-2">{signal.title}</div>
                        </TableCell>
                        <TableCell>
                          <span className={
                            signal.sentiment.includes("Bullish") ? "text-green-500 text-sm font-medium"
                              : signal.sentiment.includes("Bearish") ? "text-red-500 text-sm font-medium"
                              : "text-muted-foreground text-sm"
                          }>
                            {signal.sentiment.includes("Bullish") ? "🟢 Bullish"
                              : signal.sentiment.includes("Bearish") ? "🔴 Bearish"
                              : "⚪ Neutral"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {signal.link ? (
                            <a href={signal.link} target="_blank" rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline">
                              {signal.source || "ET Markets"} →
                            </a>
                          ) : (
                            <span className="text-xs text-muted-foreground">{signal.source || "ET Markets"}</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
