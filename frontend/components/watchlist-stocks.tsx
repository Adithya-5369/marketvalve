"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowDown, ArrowUp, Plus, Search, Trash2, RefreshCw, TrendingUp } from "lucide-react"
import { useAuth, userKey } from "@/components/auth-provider"
import { saveUserData, loadUserData } from "@/lib/firestore"
import { API_BASE_URL } from "@/lib/api"

interface WatchlistItem {
  symbol: string
  price?: number
  change?: number
  change_pct?: number
  volume?: number
  market_cap?: number
  loading?: boolean
  error?: string
}

const POPULAR = ["RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK", "SBIN", "WIPRO", "BAJFINANCE", "TMPV", "ADANIENT"]

export function WatchlistStocks() {
  const { user } = useAuth()
  const [items, setItems] = useState<WatchlistItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [addSymbol, setAddSymbol] = useState("")
  const [refreshing, setRefreshing] = useState(false)

  const storageKey = user ? userKey(user.uid, "watchlist") : "mv_watchlist"

  // Load watchlist from Firestore
  useEffect(() => {
    if (!user) return
    loadUserData(user.uid, "watchlist").then(data => {
      if (data && Array.isArray(data)) {
        setItems(data.map((s: any) => typeof s === 'string' ? { symbol: s } : s))
      }
    })
  }, [user])


  const fetchPrices = useCallback(async (watchlist: WatchlistItem[]) => {
    if (watchlist.length === 0) return
    setRefreshing(true)
    const updated = await Promise.all(
      watchlist.map(async (item) => {
        try {
          const r = await fetch(`${API_BASE_URL}/quote/${item.symbol}`)
          const d = await r.json()
          if (d.status === "success") {
            return { ...item, price: d.price, change: d.change, change_pct: d.change_pct, volume: d.volume, market_cap: d.market_cap, loading: false, error: undefined }
          }
          return { ...item, loading: false, error: d.message }
        } catch {
          return { ...item, loading: false, error: "Failed to fetch" }
        }
      })
    )
    setItems(updated)
    setRefreshing(false)
  }, [])


  useEffect(() => {
    if (items.length > 0 && !items[0].price && !refreshing) {
      fetchPrices(items)
    }
  }, [items.length])

  function saveSymbols(newItems: WatchlistItem[]) {
    setItems(newItems)
    localStorage.setItem(storageKey, JSON.stringify(newItems.map(i => i.symbol)))
  }

  function addStock() {
    const sym = addSymbol.trim().toUpperCase().replace(".NS", "")
    if (!sym || items.find(i => i.symbol === sym)) return
    const newItems = [...items, { symbol: sym, loading: true }]
    saveSymbols(newItems)
    setAddSymbol("")
    fetch(`${API_BASE_URL}/quote/${sym}`).then(r => r.json()).then(d => {
      setItems(prev => prev.map(item =>
        item.symbol === sym
          ? { ...item, price: d.price, change: d.change, change_pct: d.change_pct, volume: d.volume, market_cap: d.market_cap, loading: false }
          : item
      ))
    }).catch(() => {
      setItems(prev => prev.map(item =>
        item.symbol === sym ? { ...item, loading: false, error: "Failed" } : item
      ))
    })
  }

  function removeStock(symbol: string) {
    saveSymbols(items.filter(i => i.symbol !== symbol))
  }

  const filtered = items.filter(i =>
    i.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatVol = (v?: number) => v ? new Intl.NumberFormat("en-IN", { notation: "compact" }).format(v) : "—"
  const formatMC = (v?: number) => v ? `₹${(v / 1e7).toFixed(0)}Cr` : "—"

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" /> Watchlist
          </CardTitle>
          <CardDescription>Track NSE stocks with live prices • {items.length} stocks</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchPrices(items)} disabled={refreshing || items.length === 0}>
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>

        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Filter watchlist..." className="pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <Input placeholder="Add symbol (e.g. TCS)" className="w-40" value={addSymbol}
            onChange={e => setAddSymbol(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addStock()} />
          <Button size="sm" onClick={addStock} disabled={!addSymbol.trim()}>
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>


        {items.length === 0 && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">Quick add popular NSE stocks:</p>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR.map(s => (
                <Button key={s} variant="outline" size="sm" className="text-xs h-7" onClick={() => { setAddSymbol(s); setTimeout(() => { const newItems = [...items, { symbol: s, loading: true }]; saveSymbols(newItems); fetch(`${API_BASE_URL}/quote/${s}`).then(r => r.json()).then(d => { setItems(prev => prev.map(item => item.symbol === s ? { ...item, price: d.price, change: d.change, change_pct: d.change_pct, volume: d.volume, market_cap: d.market_cap, loading: false } : item)) }) }, 0) }}>
                  {s}
                </Button>
              ))}
            </div>
          </div>
        )}


        {items.length > 0 && (
          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Symbol</TableHead>
                    <TableHead className="text-right">Price (₹)</TableHead>
                    <TableHead className="text-right">Change</TableHead>
                    <TableHead className="text-right">Volume</TableHead>
                    <TableHead className="text-right">Market Cap</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((stock) => (
                    <TableRow key={stock.symbol}>
                      <TableCell className="font-bold">{stock.symbol}</TableCell>
                      <TableCell className="text-right font-medium">
                        {stock.loading ? <span className="text-muted-foreground text-xs">loading...</span>
                          : stock.price ? `₹${stock.price.toLocaleString()}` : <span className="text-muted-foreground text-xs">{stock.error || "—"}</span>}
                      </TableCell>
                      <TableCell className={`text-right ${(stock.change || 0) >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {stock.price ? (
                          <div className="flex items-center justify-end gap-1">
                            {(stock.change || 0) >= 0 ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
                            {(stock.change || 0) >= 0 ? "+" : ""}{stock.change_pct?.toFixed(2)}%
                          </div>
                        ) : "—"}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">{formatVol(stock.volume)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{formatMC(stock.market_cap)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removeStock(stock.symbol)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
