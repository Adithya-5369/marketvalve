"use client"

import { useState, useRef, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Send, RefreshCw, Briefcase, TrendingUp,
  X, Zap, Shield, MessageSquare, ExternalLink,
  BarChart4, Search, TrendingDown, Scale, FileText, Coins
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { loadUserData } from "@/lib/firestore"
import { API_BASE_URL } from "@/lib/api"
import { MarketValveLogo } from "@/components/logo"
import Link from "next/link"

const SUGGESTIONS = [
  { text: "Full analysis of RELIANCE", icon: <BarChart4 className="h-4 w-4 text-blue-500" /> },
  { text: "Are insiders buying TCS?", icon: <Search className="h-4 w-4 text-amber-500" /> },
  { text: "Nifty stocks oversold right now?", icon: <TrendingDown className="h-4 w-4 text-red-500" /> },
  { text: "Compare INFY vs TCS technicals", icon: <Scale className="h-4 w-4 text-purple-500" /> },
  { text: "Deals and filings for HDFCBANK", icon: <FileText className="h-4 w-4 text-green-500" /> },
  { text: "Best performing mutual funds?", icon: <Coins className="h-4 w-4 text-yellow-600" /> },
]

interface Message {
  role: "user" | "assistant"
  content: string
  sources?: string[]
  reasoning_steps?: string[]
  tools_used?: number
}

interface Holding { symbol: string; qty: number; avg_price: number; ltp?: number; pnl?: number; pnl_pct?: number; current_value?: number; invested?: number }
interface MFHolding { scheme_code: string; scheme_name: string; invested: number; units: number; nav?: number; current_value?: number; pnl?: number; pnl_pct?: number; returns?: any }

export function AIFullPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()

  const [rightTab, setRightTab] = useState<"stocks" | "mf">("stocks")
  const [portfolio, setPortfolio] = useState<Holding[]>([])
  const [mfPortfolio, setMfPortfolio] = useState<MFHolding[]>([])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages, loading])
  useEffect(() => {
    inputRef.current?.focus()
    // Load chat history
    if (user) {
      const saved = localStorage.getItem(`mv_chat_${user.uid}`)
      if (saved) try { setMessages(JSON.parse(saved)) } catch {}
    }
  }, [user])

  useEffect(() => {
    if (user && messages.length > 0) {
      localStorage.setItem(`mv_chat_${user.uid}`, JSON.stringify(messages))
    }
  }, [user, messages])

  useEffect(() => {
    if (!user) return
    loadUserData(user.uid, "portfolio_stocks").then(data => {
      if (data && Array.isArray(data)) {
        setPortfolio(data)
        fetchStockPrices(data)
      }
    })
    loadUserData(user.uid, "portfolio_mf").then(data => {
      if (data && Array.isArray(data)) {
        setMfPortfolio(data)
        fetchMFNavs(data)
      }
    })
  }, [user])

  async function fetchStockPrices(list: Holding[]) {
    const updated = await Promise.all(
      list.map(async (h) => {
        try {
          const r = await fetch(`${API_BASE_URL}/quote/${h.symbol}`)
          const d = await r.json()
          if (d.status === "success" && d.price) {
            const invested = h.qty * h.avg_price
            const pnl = (h.qty * d.price) - invested
            const pnl_pct = invested > 0 ? (pnl / invested) * 100 : 0
            return { ...h, ltp: d.price, pnl, pnl_pct }
          }
          return h
        } catch { return h }
      })
    )
    setPortfolio(updated)
  }

  async function fetchMFNavs(list: MFHolding[]) {
    const updated = await Promise.all(
      list.map(async (m) => {
        try {
          const r = await fetch(`${API_BASE_URL}/mf/nav/${m.scheme_code}`)
          const d = await r.json()
          if (d.status === "success" && d.current_nav) {
            return { ...m, nav: d.current_nav }
          }
          return m
        } catch { return m }
      })
    )
    setMfPortfolio(updated)
  }

  function renderContent(text: string) {
    const urlRegex = /(https?:\/\/[^\s)]+)/g
    const parts = text.split(urlRegex)
    return parts.map((part, i) => urlRegex.test(part) ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 break-all hover:opacity-80">{part}</a>
    ) : (<span key={i}>{part}</span>))
  }

  async function sendMessage(text?: string) {
    const msg = text || input; if (!msg.trim()) return
    setMessages(prev => [...prev, { role: "user", content: msg }]); setInput(""); setLoading(true)
    const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }))

    const fullPortfolio = [
      ...portfolio.map(h => ({ ...h, type: "stock" })),
      ...mfPortfolio.map(h => ({ ...h, symbol: h.scheme_name, type: "mutual_fund" }))
    ]
    try {
      const r = await fetch(`${API_BASE_URL}/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: msg, portfolio: fullPortfolio, history }) })
      const d = await r.json()
      const responseText = d.response?.trim() || "I apologize, but I couldn't generate a specific analysis for that query. Please try rephrasing or asking about a specific stock in your portfolio."
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: responseText, 
        sources: d.sources || [], 
        reasoning_steps: d.reasoning_steps || [], 
        tools_used: d.tools_used || 0 
      }])
    } catch { setMessages(prev => [...prev, { role: "assistant", content: "Unable to reach MarketValve API. Please check if the backend is running." }]) }
    finally { setLoading(false) }
  }

  const isEmpty = messages.length === 0

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .msg-enter { animation: fadeUp 0.3s cubic-bezier(0.16,1,0.3,1) forwards; }
        .shimmer-bg { background: linear-gradient(90deg, transparent 25%, hsl(var(--primary)/0.08) 50%, transparent 75%); background-size: 200% 100%; animation: shimmer 2s infinite; }
        .chat-scroll::-webkit-scrollbar { width: 4px; }
        .chat-scroll::-webkit-scrollbar-track { background: transparent; }
        .chat-scroll::-webkit-scrollbar-thumb { background: hsl(var(--muted-foreground)/0.2); border-radius: 2px; }
      `}</style>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between px-6 py-3 border-b border-border shrink-0 bg-background">
          <div className="flex items-center gap-3">
            <MarketValveLogo className="w-7 h-7 shrink-0" />
            <div>
              <h1 className="text-lg font-bold tracking-tight flex items-center gap-2">MarketValve AI</h1>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Live Data</span>
                <span>•</span><span>{portfolio.length} stocks</span>
                <span>•</span><span>{mfPortfolio.length} MFs</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-xs h-8" onClick={() => { setMessages([]); if (user) localStorage.removeItem(`mv_chat_${user.uid}`) }}><RefreshCw className="h-3 w-3 mr-1.5" /> New Chat</Button>
        </div>

        <div className="flex-1 overflow-y-auto chat-scroll px-6 py-5">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto">
              <MarketValveLogo className="w-14 h-14 mb-4 drop-shadow-sm" />
              <h2 className="text-2xl font-bold mb-2">What can I help you with?</h2>
              <p className="text-muted-foreground text-sm text-center mb-8 max-w-md">Multi-step stock analysis, mutual fund tracking, portfolio intelligence, and market signals • all with cited sources.</p>
              <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} onClick={() => sendMessage(s.text)} className="group flex items-center gap-3 text-left px-4 py-3.5 rounded-xl border border-border bg-background hover:bg-muted hover:border-primary/30 hover:shadow-sm transition-all duration-200">
                    <div className="p-2 rounded-lg bg-muted group-hover:bg-background transition-colors">
                      {s.icon}
                    </div>
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{s.text}</span>
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-10 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-amber-500" /> Multi-step analysis</span>
                <span className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5 text-blue-500" /> Portfolio-aware</span>
                <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-green-500" /> Source-cited</span>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-5">
              {messages.map((msg, i) => (
                <div key={i} className="msg-enter">
                  <div className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                    {msg.role === "assistant" ? <MarketValveLogo className="w-8 h-8 shrink-0 mt-0.5" /> : <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 bg-muted border border-border"><span className="text-xs font-semibold">U</span></div>}
                    <div className={`max-w-[80%] space-y-1 ${msg.role === "user" ? "items-end" : ""}`}>
                      <div className={`text-[10px] font-medium px-1 ${msg.role === "user" ? "text-right" : ""} text-muted-foreground`}>{msg.role === "assistant" ? "MarketValve AI" : "You"}{msg.tools_used && msg.tools_used > 0 ? ` • ${msg.tools_used} tools used` : ""}</div>
                      <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted/60 text-foreground border border-border/60 rounded-tl-sm"}`}>{renderContent(msg.content)}</div>
                    </div>
                  </div>
                  {msg.role === "assistant" && (msg.reasoning_steps?.length || msg.sources?.length) && (
                    <div className="ml-11 mt-2 space-y-2">
                      {msg.reasoning_steps && msg.reasoning_steps.length > 0 && (
                        <div>
                          <div className="text-[10px] text-muted-foreground font-medium mb-1">Reasoning Chain</div>
                          <div className="flex flex-wrap gap-1.5">{msg.reasoning_steps.map((step, j) => (<div key={j} className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg bg-primary/5 border border-primary/15 text-primary"><Zap className="h-2.5 w-2.5" />{step}</div>))}</div>
                        </div>
                      )}
                      {msg.sources && msg.sources.length > 0 && (
                        <div>
                          <div className="text-[10px] text-muted-foreground font-medium mb-1">Sources</div>
                          <div className="flex flex-wrap gap-1.5">{msg.sources.map((src, j) => (<div key={j} className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg bg-muted border border-border text-muted-foreground"><Shield className="h-2.5 w-2.5 text-green-500" />{src}</div>))}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="msg-enter flex gap-3">
                  <MarketValveLogo className="w-8 h-8 shrink-0" />
                  <div className="space-y-1">
                    <div className="text-[10px] font-medium text-muted-foreground px-1">MarketValve AI</div>
                    <div className="rounded-2xl px-5 py-4 bg-muted/60 border border-border/60 rounded-tl-sm">
                      <div className="text-[10px] text-muted-foreground mb-2.5 flex items-center gap-1.5"><Zap className="h-3 w-3 text-amber-500 animate-pulse" /> Analyzing with multi-step reasoning...</div>
                      <div className="shimmer-bg h-3 w-48 rounded mb-1.5" /><div className="shimmer-bg h-3 w-36 rounded mb-1.5" /><div className="shimmer-bg h-3 w-52 rounded" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <div className="shrink-0 px-6 py-4 border-t border-border bg-background/80 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 rounded-2xl px-4 py-3 bg-muted/50 border border-border focus-within:border-primary/40 focus-within:shadow-sm focus-within:shadow-primary/10 transition-all duration-200">
              <input ref={inputRef} className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" placeholder="Ask about stocks, mutual funds, or market signals..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !loading && sendMessage()} disabled={loading} />
              <Button size="icon" onClick={() => sendMessage()} disabled={loading || !input.trim()} className="shrink-0 h-9 w-9 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:shadow-md hover:shadow-primary/20 transition-all"><Send className="h-4 w-4" /></Button>
            </div>
            <div className="flex items-center justify-center gap-3 mt-2 text-[10px] text-muted-foreground"><span>Sarvam AI</span><span>•</span><span>NSE India</span><span>•</span><span>MFAPI</span><span>•</span><span>Yahoo Finance</span></div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-[300px] shrink-0 border-l border-border overflow-y-auto chat-scroll hidden lg:flex lg:flex-col bg-muted/10">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <div className="text-xs font-bold flex items-center gap-2"><Briefcase className="h-3.5 w-3.5 text-primary" /> Active Portfolio</div>
          <Link href="/portfolio">
            <Button variant="ghost" size="sm" className="h-7 text-[10px] px-2 text-muted-foreground hover:text-primary">
              <ExternalLink className="h-3 w-3 mr-1" /> Manage
            </Button>
          </Link>
        </div>
        
        <div className="flex border-b border-border shrink-0">
          {[{ id: "stocks", label: "Stocks", icon: <TrendingUp className="h-3 w-3" /> }, { id: "mf", label: "Mutual Funds", icon: <Briefcase className="h-3 w-3" /> }].map(tab => (
            <button key={tab.id} onClick={() => setRightTab(tab.id as "stocks" | "mf")} className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[11px] font-medium border-b-2 transition-colors ${rightTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{tab.icon}{tab.label}</button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto chat-scroll p-4 space-y-3">
          {rightTab === "stocks" && (
            <>
              {portfolio.length === 0 ? (
                <div className="text-center py-12">
                  <TrendingUp className="h-8 w-8 mx-auto text-muted-foreground/20 mb-3" />
                  <p className="text-xs text-muted-foreground font-medium">No stocks analyzed</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1 max-w-[150px] mx-auto leading-relaxed">Add stocks to your main portfolio to see them here.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {portfolio.map((h, i) => (
                    <div key={i} className="group flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted/60 transition-colors border border-transparent hover:border-border">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5"><span className="text-xs font-bold leading-none">{h.symbol}</span>{h.ltp && <span className="text-[10px] text-muted-foreground">₹{h.ltp}</span>}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">{h.qty} shares @ ₹{h.avg_price}</div>
                        {h.pnl !== undefined && <div className={`text-[10px] font-medium mt-0.5 ${h.pnl >= 0 ? "text-green-500" : "text-red-500"}`}>{h.pnl >= 0 ? "+" : ""}₹{h.pnl.toFixed(0)} ({h.pnl_pct?.toFixed(1)}%)</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {rightTab === "mf" && (
            <>
              {mfPortfolio.length > 0 ? (
                <div className="space-y-1">
                  {mfPortfolio.map((h, i) => (
                    <div key={i} className="group py-2.5 px-3 rounded-lg hover:bg-muted/60 transition-colors border border-transparent hover:border-border">
                      <div className="text-[11px] font-semibold leading-tight line-clamp-2">{h.scheme_name}</div>
                      <div className="text-[10px] text-muted-foreground mt-1">{h.units} units • ₹{h.invested.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Briefcase className="h-8 w-8 mx-auto text-muted-foreground/20 mb-3" />
                  <p className="text-xs text-muted-foreground font-medium">No mutual funds</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1 max-w-[150px] mx-auto leading-relaxed">Add funds to your main portfolio to analyze them with AI.</p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="shrink-0 p-3 border-t border-border bg-muted/40">
          <div className="text-[9px] text-muted-foreground mb-2 px-1 uppercase tracking-wider font-bold">AI Capabilities</div>
          <div className="grid grid-cols-2 gap-1.5 text-[9px] text-muted-foreground">
            <span className="flex items-center gap-1"><Zap className="h-2.5 w-2.5 text-amber-500" /> Reasoning</span>
            <span className="flex items-center gap-1"><Briefcase className="h-2.5 w-2.5 text-blue-500" /> Portfolio</span>
            <span className="flex items-center gap-1"><Shield className="h-2.5 w-2.5 text-green-500" /> Verified</span>
            <span className="flex items-center gap-1"><MessageSquare className="h-2.5 w-2.5 text-purple-500" /> Context</span>
          </div>
        </div>
      </div>
    </div>
  )
}
