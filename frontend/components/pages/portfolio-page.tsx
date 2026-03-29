"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Briefcase, TrendingUp, TrendingDown, Plus, Trash2, RefreshCw, Search, ArrowUp, ArrowDown
} from "lucide-react"
import { useAuth, userKey } from "@/components/auth-provider"
import { saveUserData, loadUserData } from "@/lib/firestore"
import { API_BASE_URL } from "@/lib/api"

interface StockHolding {
  symbol: string; qty: number; avg_price: number
  ltp?: number; pnl?: number; pnl_pct?: number
}

interface MFHolding {
  scheme_code: string; scheme_name: string; avg_price: number; units: number
  nav?: number; current_value?: number; pnl?: number; pnl_pct?: number
}

const SAMPLE_STOCKS: StockHolding[] = [
  { symbol: "RELIANCE", qty: 25, avg_price: 2450.50 },
  { symbol: "TCS", qty: 15, avg_price: 3820.15 },
  { symbol: "HDFCBANK", qty: 120, avg_price: 1420.80 },
  { symbol: "INFY", qty: 45, avg_price: 1610.25 },
]

const SAMPLE_MFS: MFHolding[] = [
  { scheme_code: "120844", scheme_name: "quant Small Cap Fund - Growth Option - Direct Plan", avg_price: 212.45, units: 85.2 },
  { scheme_code: "122639", scheme_name: "Parag Parikh Flexi Cap Fund - Direct Plan - Growth", avg_price: 72.18, units: 240.5 },
  { scheme_code: "119598", scheme_name: "SBI Large Cap FUND-DIRECT PLAN -GROWTH", avg_price: 88.42, units: 1200 },
]

export function PortfolioPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<"stocks" | "mf">("stocks")


  const [stocks, setStocks] = useState<StockHolding[]>([])
  const [newSym, setNewSym] = useState("")
  const [newQty, setNewQty] = useState("")
  const [newAvg, setNewAvg] = useState("")
  const [refreshing, setRefreshing] = useState(false)


  const [mfs, setMfs] = useState<MFHolding[]>([])
  const [mfSearch, setMfSearch] = useState("")
  const [mfResults, setMfResults] = useState<any[]>([])
  const [mfSearching, setMfSearching] = useState(false)
  const [mfInputs, setMfInputs] = useState<Record<string, { units: string, avg_price: string }>>({})

  const stockKey = user ? userKey(user.uid, "portfolio_stocks") : "mv_portfolio_stocks"
  const mfKey = user ? userKey(user.uid, "portfolio_mf") : "mv_portfolio_mf"


  useEffect(() => {
    if (!user) return
    loadUserData(user.uid, "portfolio_stocks").then(data => {
      if (data && Array.isArray(data) && data.length > 0) {
        setStocks(data)
      } else {
        setStocks(SAMPLE_STOCKS)
        saveStocks(SAMPLE_STOCKS)
      }
    })
    loadUserData(user.uid, "portfolio_mf").then(data => {
      if (data && Array.isArray(data) && data.length > 0) {
        // Migration: convert old 'invested' (total) to 'avg_price' (per unit)
        // Also auto-correct "illogical" dummy data (₹1, ₹2 total invested)
        const migrated = data.map((m: any) => {
          if (m.invested !== undefined && m.avg_price === undefined) {
            let avg = m.units > 0 ? m.invested / m.units : 0
            if (avg < 1) {
              if (m.scheme_code === "120844") avg = 212.45
              if (m.scheme_code === "122639") avg = 72.18
              if (m.scheme_code === "119598") avg = 88.42
            }
            return { ...m, avg_price: avg }
          }
          return m
        })
        setMfs(migrated)
        saveMfs(migrated)
      } else {
        setMfs(SAMPLE_MFS)
        saveMfs(SAMPLE_MFS)
      }
    })
  }, [user])

  function saveStocks(s: StockHolding[]) {
    setStocks(s)
    if (user) saveUserData(user.uid, "portfolio_stocks", s)
  }
  function saveMfs(m: MFHolding[]) {
    setMfs(m)
    if (user) saveUserData(user.uid, "portfolio_mf", m)
  }


  function addStock() {
    const sym = newSym.trim().toUpperCase().replace(".NS", "")
    if (!sym) return
    const updated = [...stocks, { symbol: sym, qty: parseInt(newQty) || 0, avg_price: parseFloat(newAvg) || 0 }]
    saveStocks(updated)
    setNewSym(""); setNewQty(""); setNewAvg("")
    // Fetch live price after adding
    fetchStockPrices(updated)
  }

  async function fetchStockPrices(list?: StockHolding[]) {
    const src = list || stocks
    if (src.length === 0) return
    setRefreshing(true)
    const updated = await Promise.all(
      src.map(async (h) => {
        try {
          const r = await fetch(`${API_BASE_URL}/quote/${h.symbol}`)
          const d = await r.json()
          if (d.status === "success" && d.price) {
            const ltp = d.price
            const invested = h.qty * h.avg_price
            const current = h.qty * ltp
            const pnl = current - invested
            const pnl_pct = invested > 0 ? (pnl / invested) * 100 : 0
            return { ...h, ltp, pnl: Math.round(pnl * 100) / 100, pnl_pct: Math.round(pnl_pct * 100) / 100 }
          }
          return h
        } catch { return h }
      })
    )
    saveStocks(updated)
    setRefreshing(false)
  }


  async function searchMF() {
    if (!mfSearch.trim()) return
    setMfSearching(true)
    try {
      const r = await fetch(`${API_BASE_URL}/mf/search?q=${encodeURIComponent(mfSearch)}`)
      const d = await r.json()
      setMfResults(d.slice(0, 8))
    } catch {} finally { setMfSearching(false) }
  }

  function addMF(fund: any) {
    if (mfs.find(m => m.scheme_code === String(fund.schemeCode))) return
    const inputs = mfInputs[fund.schemeCode] || { units: "0", avg_price: "0" }
    const updated = [...mfs, {
      scheme_code: String(fund.schemeCode),
      scheme_name: fund.schemeName || "",
      avg_price: parseFloat(inputs.avg_price) || 0,
      units: parseFloat(inputs.units) || 0,
    }]
    saveMfs(updated)
    const newInputs = { ...mfInputs }
    delete newInputs[fund.schemeCode]
    setMfInputs(newInputs)
    setMfResults([]); setMfSearch("")
    fetchMFNavs(updated)
  }

  async function fetchMFNavs(list?: MFHolding[]) {
    const src = list || mfs
    if (src.length === 0) return
    setRefreshing(true)
    const updated = await Promise.all(
      src.map(async (m) => {
        try {
          const r = await fetch(`${API_BASE_URL}/mf/nav/${m.scheme_code}`)
          const d = await r.json()
          if (d.status === "success" && d.current_nav) {
            const cv = m.units * d.current_nav
            const total_cost = m.units * m.avg_price
            const pnl = cv - total_cost
            const pnl_pct = total_cost > 0 ? (pnl / total_cost) * 100 : 0
            return { ...m, nav: d.current_nav, current_value: Math.round(cv * 100) / 100, pnl: Math.round(pnl * 100) / 100, pnl_pct: Math.round(pnl_pct * 100) / 100 }
          }
          return m
        } catch { return m }
      })
    )
    saveMfs(updated)
    setRefreshing(false)
  }


  useEffect(() => { if (stocks.length > 0 && !stocks[0].ltp) fetchStockPrices() }, [stocks.length])
  useEffect(() => { if (mfs.length > 0 && !mfs[0].nav) fetchMFNavs() }, [mfs.length])


  const stockInvested = stocks.reduce((s, h) => s + h.qty * h.avg_price, 0)
  const stockCurrent = stocks.reduce((s, h) => s + h.qty * (h.ltp || h.avg_price), 0)
  const stockPnl = stockCurrent - stockInvested
  const mfInvested = mfs.reduce((s, m) => s + (m.units * m.avg_price), 0)
  const mfCurrent = mfs.reduce((s, m) => s + (m.current_value || (m.units * m.avg_price)), 0)
  const mfPnl = mfCurrent - mfInvested
  const totalInvested = stockInvested + mfInvested
  const totalCurrent = stockCurrent + mfCurrent
  const totalPnl = totalCurrent - totalInvested
  const totalPnlPct = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0

  return (
    <div className="space-y-6 pb-32">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Portfolio</h1>
        <p className="text-muted-foreground">Track your stocks & mutual funds with live P&L.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-5">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Total Invested</div>
            <div className="text-xl font-bold mt-1">₹{totalInvested.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Current Value</div>
            <div className="text-xl font-bold mt-1">₹{totalCurrent.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Total P&L</div>
            <div className={`text-xl font-bold mt-1 flex items-center gap-1 ${totalPnl >= 0 ? "text-green-500" : "text-red-500"}`}>
              {totalPnl >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              ₹{Math.abs(totalPnl).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Returns</div>
            <div className={`text-xl font-bold mt-1 ${totalPnlPct >= 0 ? "text-green-500" : "text-red-500"}`}>
              {totalPnlPct >= 0 ? "+" : ""}{totalPnlPct.toFixed(2)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-1 border-b border-border">
        <button onClick={() => setTab("stocks")} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === "stocks" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
          <TrendingUp className="h-3.5 w-3.5 inline mr-1.5" /> Stocks ({stocks.length})
        </button>
        <button onClick={() => setTab("mf")} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === "mf" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
          <Briefcase className="h-3.5 w-3.5 inline mr-1.5" /> Mutual Funds ({mfs.length})
        </button>
        <div className="flex-1" />
        <Button variant="outline" size="sm" className="mb-1" onClick={() => tab === "stocks" ? fetchStockPrices() : fetchMFNavs()} disabled={refreshing}>
          <RefreshCw className={`h-3 w-3 mr-1.5 ${refreshing ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {/* ─── Stocks Tab ─── */}
      {tab === "stocks" && (
        <div className="space-y-4">
          {/* Add stock */}
          <Card>
            <CardContent className="pt-4">
              <div className="text-xs font-medium text-muted-foreground mb-2">Add Stock Holding</div>
              <div className="flex items-center gap-2">
                <Input placeholder="Symbol (e.g. TCS)" className="w-36" value={newSym} onChange={e => setNewSym(e.target.value)} />
                <Input placeholder="Quantity" className="w-24" value={newQty} onChange={e => setNewQty(e.target.value)} />
                <Input placeholder="Avg Price ₹" className="w-28" value={newAvg} onChange={e => setNewAvg(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addStock()} />
                <Button size="sm" onClick={addStock} disabled={!newSym.trim()}>
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Holdings */}
          {stocks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <TrendingUp className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No stock holdings</p>
              <p className="text-xs mt-1">Add your stocks above to track live P&L</p>
            </div>
          ) : (
            <div className="space-y-2">
              {stocks.map((h, i) => {
                const invested = h.qty * h.avg_price
                const current = h.qty * (h.ltp || h.avg_price)
                return (
                  <Card key={i}>
                    <CardContent className="py-3 px-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{h.symbol}</span>
                            {h.ltp && <span className="text-sm text-muted-foreground">₹{h.ltp.toLocaleString()}</span>}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {h.qty} shares @ ₹{h.avg_price} • Invested: ₹{invested.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-sm font-medium">₹{current.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
                            {h.pnl !== undefined && (
                              <div className={`text-xs font-medium ${h.pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                                {h.pnl >= 0 ? "+" : ""}₹{h.pnl.toLocaleString()} ({h.pnl_pct?.toFixed(2)}%)
                              </div>
                            )}
                          </div>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => saveStocks(stocks.filter((_, j) => j !== i))}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── Mutual Funds Tab ─── */}
      {tab === "mf" && (
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-xs font-medium text-muted-foreground mb-2">Add Mutual Fund</div>
              <div className="flex items-center gap-2 mb-2">
                <Input placeholder="Search fund name..." className="flex-1" value={mfSearch} onChange={e => setMfSearch(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && searchMF()} />
                <Button size="sm" onClick={searchMF} disabled={mfSearching}>
                  <Search className="h-4 w-4 mr-1" /> Search
                </Button>
              </div>

              {mfResults.length > 0 && (
                <div className="space-y-1.5 max-h-[200px] overflow-y-auto border rounded-lg p-2">
                  {mfResults.map((fund, i) => (
                    <div key={i} className="p-2 rounded border border-border hover:bg-muted/50 text-xs">
                      <div className="font-medium leading-tight mb-1.5 line-clamp-2">{fund.schemeName}</div>
                      <div className="flex items-center gap-1.5">
                        <Input
                          placeholder="Units"
                          className="h-7 w-16 text-xs"
                          value={mfInputs[fund.schemeCode]?.units || ""}
                          onChange={e => setMfInputs({ ...mfInputs, [fund.schemeCode]: { ...(mfInputs[fund.schemeCode] || { invested: "" }), units: e.target.value } })}
                        />
                        <Input
                          placeholder="Avg. Price"
                          className="h-7 w-20 text-xs"
                          value={mfInputs[fund.schemeCode]?.avg_price || ""}
                          onChange={e => setMfInputs({ ...mfInputs, [fund.schemeCode]: { ...(mfInputs[fund.schemeCode] || { units: "" }), avg_price: e.target.value } })}
                        />
                        <Button size="sm" className="h-7 text-xs px-2" onClick={() => addMF(fund)}>Add</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {mfs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No mutual fund holdings</p>
              <p className="text-xs mt-1">Search & add funds above to track NAV & returns</p>
            </div>
          ) : (
            <div className="space-y-2">
              {mfs.map((m, i) => (
                <Card key={i}>
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1 mr-4">
                        <div className="font-semibold text-sm leading-tight line-clamp-1">{m.scheme_name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {m.units} units • Avg: ₹{(m.avg_price || 0).toLocaleString()} • Cost: ₹{(m.units * (m.avg_price || 0)).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                          {m.nav && <span> • NAV: ₹{m.nav}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          {m.current_value ? (
                            <>
                              <div className="text-sm font-medium">₹{m.current_value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
                              <div className={`text-xs font-medium ${(m.pnl || 0) >= 0 ? "text-green-500" : "text-red-500"}`}>
                                {(m.pnl || 0) >= 0 ? "+" : ""}₹{m.pnl?.toLocaleString()} ({m.pnl_pct?.toFixed(2)}%)
                              </div>
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground">loading...</span>
                          )}
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => saveMfs(mfs.filter((_, j) => j !== i))}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
