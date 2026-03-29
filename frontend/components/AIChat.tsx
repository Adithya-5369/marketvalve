"use client";
import { useState, useRef, useEffect } from "react";
import { API_BASE_URL } from "@/lib/api";
import { MarketValveLogo } from "@/components/logo";
import { Maximize2, Minimize2, ExternalLink, Briefcase, X, Send } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { loadUserData } from "@/lib/firestore";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const SUGGESTIONS = [
  "Give me a full analysis of RELIANCE",
  "Are insiders buying TCS?",
  "Which Nifty stocks are oversold?",
  "Latest news and deals for HDFCBANK",
  "Compare INFY vs TCS technicals",
];

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  reasoning_steps?: string[];
  tools_used?: number;
}

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm MarketValve AI — your next-gen market intelligence assistant. I can analyze stocks with multi-step reasoning, track your portfolio, and cite all my sources. Try asking me anything!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasNew, setHasNew] = useState(false);
  const { user } = useAuth();
  
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [mfPortfolio, setMfPortfolio] = useState<any[]>([]);
  const hasLoadedRef = useRef(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (isOpen && panelRef.current && !panelRef.current.contains(e.target as Node)) {
        // Ignore if clicking the toggle button itself
        const toggle = document.querySelector('.chat-toggle-btn');
        if (toggle && toggle.contains(e.target as Node)) return;
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) {
      setHasNew(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Load chat & portfolio
  useEffect(() => {
    if (!user) return;
    const key = `mv_chat_mini_${user.uid}`;
    const savedChat = localStorage.getItem(key);
    if (savedChat && !hasLoadedRef.current) {
        try { 
            const parsed = JSON.parse(savedChat);
            if (Array.isArray(parsed) && parsed.length > 0) {
                setMessages(parsed);
                hasLoadedRef.current = true;
            }
        } catch {}
    }

    loadUserData(user.uid, "portfolio_stocks").then(d => d && setPortfolio(d));
    loadUserData(user.uid, "portfolio_mf").then(d => d && setMfPortfolio(d));
  }, [user]);

  // Save chat
  useEffect(() => {
    if (user && hasLoadedRef.current && messages.length > 0) {
        const key = `mv_chat_mini_${user.uid}`;
        localStorage.setItem(key, JSON.stringify(messages));
    } else if (user && messages.length > 1) {
        // First save setting the loaded flag
        const key = `mv_chat_mini_${user.uid}`;
        localStorage.setItem(key, JSON.stringify(messages));
        hasLoadedRef.current = true;
    }
  }, [messages, user]);

  useEffect(() => {
    function handleAskAI(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail?.message) {
        setIsOpen(true);
        setTimeout(() => sendMessage(detail.message), 300);
      }
    }
    window.addEventListener("marketvalve-ask-ai", handleAskAI);
    return () => window.removeEventListener("marketvalve-ask-ai", handleAskAI);
  }, []);

  function renderContent(text: string) {
    const urlRegex = /(https?:\/\/[^\s)]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) =>
      urlRegex.test(part) ? (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-2 break-all hover:opacity-80 transition-opacity"
        >
          {part}
        </a>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  }

  async function sendMessage(text?: string) {
    const msg = text || input;
    if (!msg.trim()) return;
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setInput("");
    setLoading(true);
    hasLoadedRef.current = true; // Mark as modified so it saves even if loading hasn't finished

    const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));
    const fullPortfolio = [
      ...portfolio.map(h => ({ ...h, type: "stock" })),
      ...mfPortfolio.map(h => ({ ...h, symbol: h.scheme_name, type: "mutual_fund" }))
    ];

    try {
      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, portfolio: fullPortfolio, history }),
      });
      const data = await res.json();
      const responseText = data.response?.trim() || "I apologize, but I couldn't generate a specific analysis for that query. Please try rephrasing or asking about a specific stock in your portfolio.";
      
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: responseText,
          sources: data.sources || [],
          reasoning_steps: data.reasoning_steps || [],
          tools_used: data.tools_used || 0,
        },
      ]);
      if (!isOpen) setHasNew(true);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Unable to reach MarketValve API. Please check if the backend is running." }]);
    } finally {
      setLoading(false);
    }
  }

  const showSuggestions = messages.length <= 1;

  return (
    <>
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse-dot { 0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; } 40% { transform: scale(1); opacity: 1; } }
        .chat-panel { animation: slideUp 0.25s cubic-bezier(0.16,1,0.3,1) forwards; }
        .msg-bubble { animation: fadeIn 0.2s ease forwards; }
        .chat-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: hsl(var(--primary)); margin: 0 2px; }
        .chat-dot:nth-child(1){ animation: pulse-dot 1.2s ease-in-out infinite 0s; }
        .chat-dot:nth-child(2){ animation: pulse-dot 1.2s ease-in-out infinite 0.2s; }
        .chat-dot:nth-child(3){ animation: pulse-dot 1.2s ease-in-out infinite 0.4s; }
        .chat-scrollbar::-webkit-scrollbar { width: 4px; }
        .chat-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .chat-scrollbar::-webkit-scrollbar-thumb { background: hsl(var(--muted-foreground)/0.3); border-radius: 2px; }
      `}</style>

      <button onClick={() => setIsOpen(!isOpen)} className="chat-toggle-btn fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95 bg-background border border-border">
        {hasNew && !isOpen && <span className="absolute top-1 right-1 w-3 h-3 bg-destructive rounded-full border-2 border-background" />}
        {isOpen ? <X className="w-5 h-5 text-muted-foreground" /> : <MarketValveLogo className="w-8 h-8" />}
      </button>

      {isOpen && (
        <div ref={panelRef} className={`chat-panel fixed z-50 flex flex-col rounded-2xl overflow-hidden bg-background border border-border shadow-2xl transition-all duration-300 ease-in-out ${
          isExpanded ? "bottom-4 right-4 w-[calc(100vw-2rem)] h-[calc(100vh-2rem)] md:bottom-12 md:right-12 md:w-[700px] md:h-[calc(100vh-6rem)]" 
          : "bottom-24 right-6 w-[440px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)]"
        }`}>
          <div className="flex items-center justify-between px-4 py-3 shrink-0 border-b border-border bg-muted/50">
            <div className="flex items-center gap-2.5">
              <MarketValveLogo className="w-8 h-8 shrink-0" />
              <div>
                <div className="text-foreground font-semibold text-sm leading-tight">MarketValve AI</div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  <span className="text-muted-foreground text-[10px]">Next Gen • {portfolio.length + mfPortfolio.length} assets</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-accent hidden sm:block">
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <Link href="/portfolio">
                <Button variant="ghost" size="sm" className="h-7 text-[10px] px-2 text-muted-foreground">
                  <Briefcase className="w-3 h-3 mr-1" /> Portfolio
                </Button>
              </Link>
              <button onClick={() => { setMessages([{ role: "assistant", content: "Hi! I'm MarketValve AI • your next-gen market intelligence assistant. I can analyze stocks with multi-step reasoning, track your portfolio, and cite all my sources. Try asking me anything!" }]); localStorage.removeItem(`mv_chat_mini_${user?.uid}`); hasLoadedRef.current = false; }} className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded hover:bg-accent">Clear</button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto chat-scrollbar px-4 py-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i}>
                <div className={`msg-bubble flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && <MarketValveLogo className="w-6 h-6 rounded-md shrink-0 mr-2 mt-0.5" />}
                  <div className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed break-words ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground border border-border rounded-bl-sm"}`}>{renderContent(msg.content)}</div>
                </div>
                {msg.role === "assistant" && (msg.reasoning_steps?.length || msg.sources?.length) && (
                  <div className="ml-8 mt-1.5 space-y-1">
                    {msg.reasoning_steps && msg.reasoning_steps.length > 0 && (
                      <div className="flex flex-wrap gap-1">{msg.reasoning_steps.map((step, j) => (<span key={j} className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">🔍 {step}</span>))}</div>
                    )}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="flex flex-wrap gap-1">{msg.sources.map((src, j) => (<span key={j} className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">📋 {src}</span>))}</div>
                    )}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="msg-bubble flex justify-start">
                <MarketValveLogo className="w-6 h-6 rounded-md shrink-0 mr-2 mt-0.5" />
                <div className="rounded-xl px-4 py-3 bg-muted border border-border rounded-bl-sm">
                  <div className="text-[10px] text-muted-foreground mb-1 italic">Analyzing with multi-step reasoning...</div>
                  <span className="chat-dot" /> <span className="chat-dot" /> <span className="chat-dot" />
                </div>
              </div>
            )}
            {showSuggestions && !loading && (
              <div className="pt-1">
                <p className="text-xs text-muted-foreground mb-2 px-1">Try asking:</p>
                <div className="flex flex-wrap gap-1.5">{SUGGESTIONS.map((s, i) => (<button key={i} onClick={() => sendMessage(s)} className="text-[11px] px-3 py-1.5 rounded-full transition-all hover:scale-105 active:scale-95 bg-primary/10 border border-primary/25 text-primary hover:bg-primary/20">{s}</button>))}</div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="shrink-0 px-3 py-3 border-t border-border bg-background">
            <div className="flex items-center gap-2 rounded-xl px-3 py-2 bg-muted border border-border">
              <input ref={inputRef} className="flex-1 bg-transparent text-sm text-foreground focus:outline-none" placeholder="Ask about any NSE stock..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !loading && sendMessage()} disabled={loading} />
              <button onClick={() => sendMessage()} disabled={loading || !input.trim()} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${input.trim() && !loading ? "bg-primary text-primary-foreground hover:scale-105" : "bg-muted-foreground/10 text-muted-foreground"}`}>
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-center text-[9px] text-muted-foreground mt-2">Reasoning • Portfolio-aware • Source-cited • Sarvam AI</p>
          </div>
        </div>
      )}
    </>
  );
}