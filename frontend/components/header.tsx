"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Bell, Search, TrendingUp, BarChart2, Radar, MessageSquare, Newspaper, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Try to import auth - gracefully handle if not available
let useAuth: any = () => ({ user: null, logout: () => { } })
try { useAuth = require("@/components/auth-provider").useAuth } catch { }

const POPULAR_STOCKS = [
  "RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK",
  "WIPRO", "SBIN", "BAJFINANCE", "HINDUNILVR", "ITC",
  "BHARTIARTL", "KOTAKBANK", "LT", "AXISBANK", "MARUTI",
  "TMPV", "SUNPHARMA", "TITAN", "ADANIENT", "TECHM",
  "HCLTECH", "DRREDDY", "NESTLEIND", "BAJAJ-AUTO", "M&M",
  "NTPC", "ONGC", "POWERGRID", "COALINDIA", "JSWSTEEL",
  "TATASTEEL", "ULTRACEMCO", "CIPLA", "DIVISLAB", "GRASIM",
  "EICHERMOT", "HEROMOTOCO", "HINDALCO", "INDUSINDBK", "VEDL",
  "APOLLOHOSP", "ASIANPAINT", "BPCL", "BRITANNIA", "SBILIFE",
  "HDFCLIFE", "BAJAJFINSV", "ADANIPORTS", "TATACONSUM", "SHRIRAMFIN",
]

interface Action {
  icon: React.ReactNode
  label: string
  sub: string
  action: () => void
}

export function Header() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [query, setQuery] = useState("")
  const [showResults, setShowResults] = useState(false)
  const [selectedIdx, setSelectedIdx] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const filtered = query.trim().length > 0
    ? POPULAR_STOCKS.filter(s => s.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
    : []

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  function getStockActions(ticker: string): Action[] {
    return [
      {
        icon: <BarChart2 className="h-3.5 w-3.5 text-blue-500" />,
        label: `Chart Analysis`,
        sub: `Technical indicators, patterns & AI analysis for ${ticker}`,
        action: () => { setQuery(""); setShowResults(false); router.push(`/chart-analysis?stock=${ticker}`) }
      },
      {
        icon: <Radar className="h-3.5 w-3.5 text-amber-500" />,
        label: `Opportunity Radar`,
        sub: `Deals, filings, insider trades & signals for ${ticker}`,
        action: () => { setQuery(""); setShowResults(false); router.push(`/radar?stock=${ticker}`) }
      },
      {
        icon: <Newspaper className="h-3.5 w-3.5 text-purple-500" />,
        label: `Market Signals`,
        sub: `AI sentiment & news signals for ${ticker}`,
        action: () => { setQuery(""); setShowResults(false); router.push(`/market-signals?stock=${ticker}`) }
      },
      {
        icon: <MessageSquare className="h-3.5 w-3.5 text-green-500" />,
        label: `Ask AI`,
        sub: `"Analyze ${ticker} • price, patterns, signals & opportunities"`,
        action: () => {
          setQuery(""); setShowResults(false)
          window.dispatchEvent(new CustomEvent("marketvalve-ask-ai", {
            detail: { message: `Give me a complete analysis of ${ticker} • current price, chart patterns, technical signals, recent deals, insider trades, and any opportunities I should watch.` }
          }))
        }
      },
    ]
  }

  function getAllActions(): Action[] {
    const actions: Action[] = []
    for (const stock of filtered) { actions.push(...getStockActions(stock)) }
    if (query.trim() && !filtered.some(s => s === query.trim().toUpperCase())) {
      actions.push(...getStockActions(query.trim().toUpperCase()))
    }
    return actions
  }

  const allActions = query.trim() ? getAllActions() : []

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx(prev => Math.min(prev + 1, allActions.length - 1)) }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIdx(prev => Math.max(prev - 1, 0)) }
    else if (e.key === "Enter") {
      e.preventDefault()
      if (selectedIdx >= 0 && allActions[selectedIdx]) { allActions[selectedIdx].action() }
      else if (query.trim()) {
        const ticker = query.trim().toUpperCase()
        setQuery(""); setShowResults(false)
        window.dispatchEvent(new CustomEvent("marketvalve-ask-ai", {
          detail: { message: `Give me a complete analysis of ${ticker} — current price, chart patterns, technical signals, recent deals, insider trades, and any opportunities I should watch.` }
        }))
      }
    } else if (e.key === "Escape") { setShowResults(false) }
  }

  const displayName = user?.displayName || "User"
  const email = user?.email || ""
  const photoURL = user?.photoURL || ""
  const initials = displayName?.[0]?.toUpperCase() || "U"

  return (
    <>
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <div className="hidden md:block md:w-64 md:flex-none" />
      <div className="hidden md:flex md:flex-1 md:items-center md:gap-4 lg:gap-8">
        <div className="relative flex-1" ref={wrapperRef}>
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search stocks • chart, signals, AI analysis... (e.g., RELIANCE)"
            className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/2"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowResults(true); setSelectedIdx(-1) }}
            onFocus={() => query.trim() && setShowResults(true)}
            onKeyDown={handleKeyDown}
          />
          {showResults && (filtered.length > 0 || (query.trim() && !filtered.some(s => s === query.trim().toUpperCase()))) && (
            <div className="absolute top-full left-0 mt-1 w-full md:w-2/3 lg:w-1/2 bg-background border border-border rounded-xl shadow-2xl z-50 overflow-hidden max-h-[420px] overflow-y-auto">
              {filtered.map((stock) => (
                <div key={stock}>
                  <div className="px-3 pt-3 pb-1.5 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-sm font-semibold">{stock}</span>
                    <span className="text-[10px] text-muted-foreground">NSE</span>
                  </div>
                  {getStockActions(stock).map((act, j) => {
                    const globalIdx = allActions.indexOf(act)
                    return (
                      <button key={j} className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm hover:bg-muted/60 transition-colors ${globalIdx === selectedIdx ? "bg-muted" : ""}`}
                        onClick={act.action} onMouseEnter={() => setSelectedIdx(globalIdx)}>
                        <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center shrink-0 ml-4">{act.icon}</div>
                        <div className="min-w-0">
                          <div className="font-medium text-xs">{act.label}</div>
                          <div className="text-[10px] text-muted-foreground truncate">{act.sub}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              ))}
              {query.trim() && !filtered.some(s => s === query.trim().toUpperCase()) && (
                <div>
                  <div className="px-3 pt-3 pb-1.5 flex items-center gap-2 border-t border-border">
                    <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                      <Search className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-sm font-semibold">{query.trim().toUpperCase()}</span>
                    <span className="text-[10px] text-muted-foreground">Search</span>
                  </div>
                  {getStockActions(query.trim().toUpperCase()).map((act, j) => {
                    const globalIdx = allActions.indexOf(act)
                    return (
                      <button key={j} className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm hover:bg-muted/60 transition-colors ${globalIdx === selectedIdx ? "bg-muted" : ""}`}
                        onClick={act.action} onMouseEnter={() => setSelectedIdx(globalIdx)}>
                        <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center shrink-0 ml-4">{act.icon}</div>
                        <div className="min-w-0">
                          <div className="font-medium text-xs">{act.label}</div>
                          <div className="text-[10px] text-muted-foreground truncate">{act.sub}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
              <div className="px-3 py-2 text-[10px] text-muted-foreground text-center border-t border-border bg-muted/30">
                ↑↓ Navigate • Enter to Ask AI • Esc to close
              </div>
            </div>
          )}
        </div>
        <nav className="flex items-center gap-3">
          {/* Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  {photoURL && <AvatarImage src={photoURL} alt={displayName} />}
                  <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{displayName}</span>
                  {email && <span className="text-xs text-muted-foreground font-normal">{email}</span>}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/settings")}>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive">
                <LogOut className="h-4 w-4 mr-2" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
      <div className="flex md:hidden ml-auto">
        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => { const el = document.getElementById('mobile-search-wrapper'); if (el) el.classList.toggle('hidden'); }}>
            <Search className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  {photoURL && <AvatarImage src={photoURL} alt={displayName} />}
                  <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{displayName}</span>
                  {email && <span className="text-xs text-muted-foreground font-normal">{email}</span>}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/settings")}>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive">
                <LogOut className="h-4 w-4 mr-2" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
    {/* Mobile Search Bar */}
    <div id="mobile-search-wrapper" className="hidden md:hidden sticky top-14 z-20 border-b bg-background px-4 py-2">
      <div className="relative" ref={wrapperRef}>
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search stocks..."
          className="w-full appearance-none bg-background pl-8 shadow-none"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowResults(true); setSelectedIdx(-1) }}
          onFocus={() => query.trim() && setShowResults(true)}
          onKeyDown={handleKeyDown}
        />
        {showResults && (filtered.length > 0 || (query.trim() && !filtered.some(s => s === query.trim().toUpperCase()))) && (
          <div className="absolute top-full left-0 mt-1 w-full bg-background border border-border rounded-xl shadow-2xl z-50 overflow-hidden max-h-[420px] overflow-y-auto">
            {filtered.map((stock) => (
              <div key={stock}>
                <div className="px-3 pt-3 pb-1.5 flex items-center gap-2">
                  <TrendingUp className="h-3 w-3 text-primary" />
                  <span className="text-sm font-semibold">{stock}</span>
                  <span className="text-[10px] text-muted-foreground">NSE</span>
                </div>
                {getStockActions(stock).map((act, j) => (
                  <button key={j} className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm hover:bg-muted/60 transition-colors"
                    onClick={() => { act.action(); document.getElementById('mobile-search-wrapper')?.classList.add('hidden'); }}>
                    <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center shrink-0 ml-4">{act.icon}</div>
                    <div className="min-w-0">
                      <div className="font-medium text-xs">{act.label}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{act.sub}</div>
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  )
}
