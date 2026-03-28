"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TrendingUp, Plus, Trash2, RefreshCw, Search, ArrowUp, ArrowDown } from "lucide-react"
import { useAuth, userKey } from "@/components/auth-provider"
import { saveUserData, loadUserData } from "@/lib/firestore"
import { API_BASE_URL } from "@/lib/api"

interface StockHolding {
  symbol: string; qty: number; avg_price: number
  ltp?: number; pnl?: number; pnl_pct?: number
}

export function PortfolioStocksPage() {
  const { user } = useAuth()
  const [stocks, setStocks] = useState<StockHolding[]>([])
  const [newSym, setNewSym] = useState("")
  const [newQty, setNewQty] = useState("")
  const [newAvg, setNewAvg] = useState("")
  const [refreshing, setRefreshing] = useState(false)
  const [searchQ, setSearchQ] = useState("")

  const stockKey = user ? userKey(user.uid, "portfolio_stocks") : "mv_portfolio_stocks"


  useEffect(() => {
    if (!user) return
    loadUserData(user.uid, "portfolio_stocks").then(data => {
      if (data && Array.isArray(data)) setStocks(data)
    })
  }, [user])

  function saveStocks(s: StockHolding[]) {
    setStocks(s)
    if (user) saveUserData(user.uid, "portfolio_stocks", s)
  }

  function addStock() {
    const sym = newSym.trim().toUpperCase().replace(".NS", "")
    if (!sym) return
    const updated = [...stocks, { symbol: sym, qty: parseInt(newQty) || 0, avg_price: parseFloat(newAvg) || 0 }]
    saveStocks(updated)
    setNewSym(""); setNewQty(""); setNewAvg("")
    fetchPrices(updated)
  }

  async function fetchPrices(list?: StockHolding[]) {
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

  useEffect(() => { if (stocks.length > 0 && !stocks[0].ltp) fetchPrices() }, [stocks.length])

  const filtered = stocks.filter(s => s.symbol.toLowerCase().includes(searchQ.toLowerCase()))
  const totalInvested = stocks.reduce((s, h) => s + h.qty * h.avg_price, 0)
  const totalCurrent = stocks.reduce((s, h) => s + h.qty * (h.ltp || h.avg_price), 0)
  const totalPnl = totalCurrent - totalInvested
  const totalPnlPct = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Portfolio</h1>
          <p className="text-muted-foreground">Track your NSE stock holdings with live P&L.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchPrices()} disabled={refreshing || stocks.length === 0}>
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      {stocks.length > 0 && (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card><CardContent className="pt-5">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Total Invested</div>
            <div className="text-xl font-bold mt-1">₹{totalInvested.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
          </CardContent></Card>
          <Card><CardContent className="pt-5">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Current Value</div>
            <div className="text-xl font-bold mt-1">₹{totalCurrent.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
          </CardContent></Card>
          <Card><CardContent className="pt-5">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Total P&L</div>
            <div className={`text-xl font-bold mt-1 flex items-center gap-1 ${totalPnl >= 0 ? "text-green-500" : "text-red-500"}`}>
              {totalPnl >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              ₹{Math.abs(totalPnl).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </div>
          </CardContent></Card>
          <Card><CardContent className="pt-5">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Returns</div>
            <div className={`text-xl font-bold mt-1 ${totalPnlPct >= 0 ? "text-green-500" : "text-red-500"}`}>
              {totalPnlPct >= 0 ? "+" : ""}{totalPnlPct.toFixed(2)}%
            </div>
          </CardContent></Card>
        </div>
      )}

      {/* Add + Search */}
      <Card>
        <CardContent className="pt-4">
          <div className="text-xs font-medium text-muted-foreground mb-2">Add Stock Holding</div>
          <div className="flex items-center gap-2 mb-3">
            <Input placeholder="Symbol (e.g. TCS)" className="w-36" value={newSym} onChange={e => setNewSym(e.target.value)} />
            <Input placeholder="Quantity" className="w-24" value={newQty} onChange={e => setNewQty(e.target.value)} />
            <Input placeholder="Avg Price ₹" className="w-28" value={newAvg} onChange={e => setNewAvg(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addStock()} />
            <Button size="sm" onClick={addStock} disabled={!newSym.trim()}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
          {stocks.length > 3 && (
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Filter holdings..." className="pl-8" value={searchQ} onChange={e => setSearchQ(e.target.value)} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Holdings */}
      {stocks.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">No stock holdings</p>
          <p className="text-sm mt-1">Add your NSE stocks above to track live P&L</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((h, i) => {
            const invested = h.qty * h.avg_price
            const current = h.qty * (h.ltp || h.avg_price)
            return (
              <Card key={i}>
                <CardContent className="py-4 px-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{h.symbol}</span>
                        {h.ltp && <span className="text-xs text-muted-foreground">₹{h.ltp.toLocaleString()}</span>}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {h.qty} shares @ ₹{h.avg_price} • Invested: ₹{invested.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-semibold">₹{current.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
                        {h.pnl !== undefined && (
                          <div className={`text-xs font-medium ${h.pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {h.pnl >= 0 ? "+" : ""}₹{h.pnl.toLocaleString()} ({h.pnl_pct?.toFixed(2)}%)
                          </div>
                        )}
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => saveStocks(stocks.filter((_, j) => j !== i))}>
                        <Trash2 className="h-4 w-4" />
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
  )
}
