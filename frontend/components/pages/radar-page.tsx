"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  RefreshCw, TrendingUp, TrendingDown,
  AlertCircle, BarChart3, FileText, Users, BarChart, Mic, X,
  Presentation, Phone, Target, ClipboardList, Rocket, Briefcase
} from "lucide-react"
import { API_BASE_URL } from "@/lib/api"

interface Deal {
  symbol: string
  clientName: string
  buySell: string
  qty: string
  watp: string
  date: string
  deal_type: string
}
interface Filing { symbol: string; subject: string; date: string; high_impact: boolean }
interface InsiderTrade { symbol: string; person: string; category: string; action: string; qty: string; value: string; date: string }
interface QResult { symbol: string; period: string; revenue: string; net_profit: string; eps: string; date: string }
interface Commentary { symbol: string; subject: string; date: string; type: string; keywords: string[] }
interface RadarData {
  date: string; nse_deals: string; signals: any[]; total_signals: number
  corporate_filings: Filing[]; insider_trades: InsiderTrade[]; quarterly_results: QResult[]
  management_commentary: Commentary[]
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
      current = { deal_type: parts[0]?.trim() || "Deal", symbol: parts[1]?.trim() || "" }
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

export function RadarPage({ initialStock }: { initialStock?: string }) {
  const router = useRouter()
  const [stockFilter, setStockFilter] = useState(initialStock?.toUpperCase() || "")
  const [radarData, setRadarData] = useState<RadarData | null>(null)
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => { setIsMounted(true) }, [])

  // Sync filter when navigating from search bar with a different stock
  useEffect(() => {
    setStockFilter(initialStock?.toUpperCase() || "")
  }, [initialStock])

  async function fetchRadar(isBackground = false) {
    if (!isBackground) setLoading(true)
    setError("")
    try {
      const stockParam = stockFilter || "ALL"
      const res = await fetch(`${API_BASE_URL}/radar?stock=${stockParam}`)
      if (!res.ok) throw new Error("Failed to fetch")
      const data: RadarData = await res.json()
      setRadarData(data)
      setDeals(parseDealLines(data.nse_deals))
      setLastRefresh(new Date())
    } catch {
      if (!isBackground) setError("Unable to fetch live data. Backend may be offline.")
    } finally {
      if (!isBackground) setLoading(false)
    }
  }

  useEffect(() => {
    fetchRadar(false)
    const id = setInterval(() => fetchRadar(true), 60000)
    return () => clearInterval(id)
  }, [stockFilter])

  const buyDeals = deals.filter(d => d.buySell?.toUpperCase().includes("B"))
  const sellDeals = deals.filter(d => !d.buySell?.toUpperCase().includes("B"))
  const filings = radarData?.corporate_filings || []
  const insiderTrades = radarData?.insider_trades || []
  const qResults = radarData?.quarterly_results || []
  const commentary = radarData?.management_commentary || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Opportunity Radar</h1>
          <CardDescription>
            NSE deals, filings, insider trades, management commentary & quarterly results • Source: NSE India
          </CardDescription>
          {stockFilter && (
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="gap-1">
                Filtered: {stockFilter}
                <button onClick={() => { setStockFilter(""); router.push("/radar") }} className="ml-1 hover:text-destructive">
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
            <div className="text-xs text-muted-foreground">{radarData?.date || "Live"}</div>
          </div>
          <Button variant="outline" size="icon" onClick={() => fetchRadar(false)} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card><CardContent className="pt-4 pb-3 text-center">
          <div className="text-2xl font-bold">{deals.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Deals</div>
        </CardContent></Card>
        <Card className="border-green-500/20"><CardContent className="pt-4 pb-3 text-center">
          <div className="text-2xl font-bold text-green-500">{buyDeals.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Buy Deals</div>
        </CardContent></Card>
        <Card className="border-red-500/20"><CardContent className="pt-4 pb-3 text-center">
          <div className="text-2xl font-bold text-red-500">{sellDeals.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Sell Deals</div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 pb-3 text-center">
          <div className="text-2xl font-bold">{filings.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Filings</div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 pb-3 text-center">
          <div className="text-2xl font-bold">{insiderTrades.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Insider Trades</div>
        </CardContent></Card>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive p-4 rounded-lg border border-destructive/20 bg-destructive/5">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      {/* Deals */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <CardTitle>Block/Bulk Deals</CardTitle>
          </div>
          <CardDescription>Institutional buying & selling activity • Source: nseindia.com</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />)}</div>
          ) : deals.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              <BarChart3 className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="font-medium">No bulk/block deals found today</p>
              <p className="text-xs mt-1">NSE data updates during market hours (9:15 AM – 3:30 PM IST)</p>
            </div>
          ) : (
            <div className="space-y-2">
              {deals.map((deal, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${deal.buySell?.toUpperCase().includes("B") ? "bg-green-500/10" : "bg-red-500/10"}`}>
                      {deal.buySell?.toUpperCase().includes("B") ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{deal.symbol}</span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">{deal.deal_type}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">{deal.clientName}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold text-sm ${deal.buySell?.toUpperCase().includes("B") ? "text-green-500" : "text-red-500"}`}>
                      {deal.buySell?.toUpperCase().includes("B") ? "BUY" : "SELL"}
                    </div>
                    <div className="text-xs text-muted-foreground">{deal.qty ? `${parseInt(deal.qty.replace(/,/g, "")).toLocaleString("en-IN")} shares` : ""}</div>
                    <div className="text-xs text-muted-foreground">{deal.watp ? `@ ₹${deal.watp}` : ""}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2-Column: Insider Trades + Corporate Filings */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Insider Trades */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <CardTitle>Insider Trading</CardTitle>
            </div>
            <CardDescription>SAST/PIT disclosures • Source: NSE India</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />)}</div>
            ) : insiderTrades.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-20" />
                <p className="text-xs">No insider trades found today</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {insiderTrades.map((t, i) => (
                  <div key={i} className="p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{t.symbol}</span>
                        <Badge variant={t.action?.toLowerCase().includes("buy") ? "default" : "destructive"} className="text-[10px] px-1.5 py-0">
                          {t.action?.toLowerCase().includes("buy") ? "BUY" : "SELL"}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">{t.date?.slice(0, 11)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{t.person}</div>
                    <div className="text-xs text-muted-foreground">
                      {t.category}{t.qty ? ` • Qty: ${t.qty}` : ""}{t.value ? ` • ₹${t.value}` : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Corporate Filings */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <CardTitle>Corporate Filings</CardTitle>
            </div>
            <CardDescription>Board meetings, AGMs, announcements • Source: NSE India</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />)}</div>
            ) : filings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-20" />
                <p className="text-xs">No corporate filings found today</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {filings.map((f, i) => (
                  <div key={i} className="p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{f.symbol}</span>
                      {f.high_impact && <Badge variant="default" className="text-[10px] px-1.5 py-0">High Impact</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{f.subject}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{f.date?.slice(0, 11)}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Management Commentary */}
      {commentary.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Mic className="h-4 w-4 text-primary" />
              <CardTitle>Management Commentary</CardTitle>
            </div>
            <CardDescription>Investor presentations, earnings calls, guidance updates • Source: NSE India</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {commentary.map((c, i) => {
                const typeIcon: Record<string, React.ReactNode> = {
                  "Investor Presentation": <Presentation className="h-4 w-4 text-blue-500" />,
                  "Earnings Call": <Phone className="h-4 w-4 text-green-500" />,
                  "Guidance Update": <Target className="h-4 w-4 text-amber-500" />,
                  "MD&A": <ClipboardList className="h-4 w-4 text-purple-500" />,
                  "Strategy Update": <Rocket className="h-4 w-4 text-orange-500" />,
                  "Management Update": <Briefcase className="h-4 w-4 text-slate-500" />,
                }
                return (
                  <div key={i} className="p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{typeIcon[c.type] || <Briefcase className="h-4 w-4 text-slate-500" />}</span>
                        <span className="font-semibold text-sm">{c.symbol}</span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">{c.type}</Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">{c.date?.slice(0, 11)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.subject}</div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quarterly Results */}
      {qResults.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <BarChart className="h-4 w-4 text-primary" />
              <CardTitle>Quarterly Results</CardTitle>
            </div>
            <CardDescription>Latest earnings reports • Source: NSE India</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {qResults.map((r, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{r.symbol}</span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">{r.period}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{r.date?.slice(0, 11)}</div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    {r.revenue && <div>Revenue: ₹{r.revenue} Cr</div>}
                    {r.net_profit && <div>Profit: ₹{r.net_profit} Cr</div>}
                    {r.eps && <div>EPS: ₹{r.eps}</div>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
