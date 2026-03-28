"use client";
import { useState, useRef, useEffect } from "react";
import { API_BASE_URL } from "@/lib/api";

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
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [portfolio, setPortfolio] = useState<{ symbol: string; qty: number; avg_price: number }[]>([]);
  const [newStock, setNewStock] = useState("");
  const [newQty, setNewQty] = useState("");
  const [newAvg, setNewAvg] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) {
      setHasNew(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);


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


  useEffect(() => {
    const saved = localStorage.getItem("marketvalve-portfolio");
    if (saved) {
      try { setPortfolio(JSON.parse(saved)); } catch {}
    }
  }, []);

  function savePortfolio(p: typeof portfolio) {
    setPortfolio(p);
    localStorage.setItem("marketvalve-portfolio", JSON.stringify(p));
  }

  function addHolding() {
    if (!newStock.trim()) return;
    const updated = [...portfolio, {
      symbol: newStock.trim().toUpperCase(),
      qty: parseInt(newQty) || 0,
      avg_price: parseFloat(newAvg) || 0,
    }];
    savePortfolio(updated);
    setNewStock(""); setNewQty(""); setNewAvg("");
  }

  function removeHolding(idx: number) {
    const updated = portfolio.filter((_, i) => i !== idx);
    savePortfolio(updated);
  }

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
    const userMsg: Message = { role: "user", content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const history = messages.slice(-10).map(m => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          portfolio: portfolio,
          history: history,
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
          sources: data.sources || [],
          reasoning_steps: data.reasoning_steps || [],
          tools_used: data.tools_used || 0,
        },
      ]);
      if (!isOpen) setHasNew(true);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Unable to reach MarketValve API. Please check if the backend is running.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const showSuggestions = messages.length === 1;

  return (
    <>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)     scale(1);    }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        @keyframes pulse-dot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%            { transform: scale(1);   opacity: 1;   }
        }
        .chat-panel  { animation: slideUp 0.25s cubic-bezier(0.16,1,0.3,1) forwards; }
        .msg-bubble  { animation: fadeIn 0.2s ease forwards; }
        .chat-dot {
          display: inline-block; width: 6px; height: 6px; border-radius: 50%;
          background: hsl(var(--primary)); margin: 0 2px;
        }
        .chat-dot:nth-child(1){ animation: pulse-dot 1.2s ease-in-out infinite 0s;   }
        .chat-dot:nth-child(2){ animation: pulse-dot 1.2s ease-in-out infinite 0.2s; }
        .chat-dot:nth-child(3){ animation: pulse-dot 1.2s ease-in-out infinite 0.4s; }
        .chat-scrollbar::-webkit-scrollbar { width: 4px; }
        .chat-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .chat-scrollbar::-webkit-scrollbar-thumb { background: hsl(var(--muted-foreground) / 0.3); border-radius: 2px; }
      `}</style>


      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95 bg-primary text-primary-foreground"
        aria-label="Toggle MarketValve AI"
      >
        {hasNew && !isOpen && (
          <span className="absolute top-1 right-1 w-3 h-3 bg-destructive rounded-full border-2 border-background" />
        )}
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>


      {isOpen && (
        <div className="chat-panel fixed bottom-24 right-6 z-50 flex flex-col rounded-2xl overflow-hidden w-[440px] h-[600px] bg-background border border-border shadow-2xl">

          <div className="flex items-center justify-between px-4 py-3 shrink-0 border-b border-border bg-muted/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-primary text-primary-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <div className="text-foreground font-semibold text-sm leading-tight">
                  MarketValve AI
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  <span className="text-muted-foreground text-xs">
                    Next Gen • {portfolio.length > 0 ? `${portfolio.length} holdings` : "No portfolio"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
  
              <button
                onClick={() => setShowPortfolio(!showPortfolio)}
                className={`text-xs px-2 py-1 rounded transition-colors ${showPortfolio ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}
              >
                💼 Portfolio
              </button>
              <button
                onClick={() =>
                  setMessages([
                    {
                      role: "assistant",
                      content: "Hi! I'm MarketValve AI • your next-gen market intelligence assistant. I can analyze stocks with multi-step reasoning, track your portfolio, and cite all my sources. Try asking me anything!",
                    },
                  ])
                }
                className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-accent"
              >
                Clear
              </button>
            </div>
          </div>


          {showPortfolio && (
            <div className="px-4 py-3 border-b border-border bg-muted/30 space-y-2">
              <div className="text-xs font-semibold text-foreground">Your Portfolio</div>
              {portfolio.length === 0 ? (
                <div className="text-xs text-muted-foreground">Add holdings for portfolio-aware AI responses</div>
              ) : (
                <div className="space-y-1 max-h-[100px] overflow-y-auto">
                  {portfolio.map((h, i) => (
                    <div key={i} className="flex items-center justify-between text-xs bg-background rounded px-2 py-1 border border-border">
                      <span><span className="font-semibold">{h.symbol}</span> • {h.qty} shares @ ₹{h.avg_price}</span>
                      <button onClick={() => removeHolding(i)} className="text-muted-foreground hover:text-destructive ml-2">✕</button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-1">
                <input className="flex-1 text-xs px-2 py-1 rounded border border-border bg-background" placeholder="Symbol" value={newStock} onChange={e => setNewStock(e.target.value)} />
                <input className="w-14 text-xs px-2 py-1 rounded border border-border bg-background" placeholder="Qty" value={newQty} onChange={e => setNewQty(e.target.value)} />
                <input className="w-16 text-xs px-2 py-1 rounded border border-border bg-background" placeholder="Avg ₹" value={newAvg} onChange={e => setNewAvg(e.target.value)} />
                <button onClick={addHolding} className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground hover:opacity-90">Add</button>
              </div>
            </div>
          )}


          <div className="flex-1 overflow-y-auto chat-scrollbar px-4 py-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i}>
                <div className={`msg-bubble flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 mr-2 mt-0.5 bg-primary text-primary-foreground">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed break-words ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted text-foreground border border-border rounded-bl-sm"
                    }`}
                  >
                    {renderContent(msg.content)}
                  </div>
                </div>


                {msg.role === "assistant" && (msg.reasoning_steps?.length || msg.sources?.length) ? (
                  <div className="ml-8 mt-1.5 space-y-1">

                    {msg.reasoning_steps && msg.reasoning_steps.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {msg.reasoning_steps.map((step, j) => (
                          <span key={j} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                            🔍 {step}
                          </span>
                        ))}
                      </div>
                    )}

                    {msg.sources && msg.sources.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {msg.sources.map((src, j) => (
                          <span key={j} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                            📋 {src}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            ))}


            {loading && (
              <div className="msg-bubble flex justify-start">
                <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 mr-2 mt-0.5 bg-primary text-primary-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="rounded-xl px-4 py-3 bg-muted border border-border rounded-bl-sm">
                  <div className="text-[10px] text-muted-foreground mb-1">Analyzing with multi-step reasoning...</div>
                  <span className="chat-dot" />
                  <span className="chat-dot" />
                  <span className="chat-dot" />
                </div>
              </div>
            )}


            {showSuggestions && !loading && (
              <div className="pt-1">
                <p className="text-xs text-muted-foreground mb-2 px-1">
                  Try asking:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(s)}
                      className="text-xs px-3 py-1.5 rounded-full transition-all hover:scale-105 active:scale-95 bg-primary/10 border border-primary/25 text-primary hover:bg-primary/20"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>


          <div className="shrink-0 px-3 py-3 border-t border-border">
            <div className="flex items-center gap-2 rounded-xl px-3 py-2 bg-muted border border-border">
              <input
                ref={inputRef}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                placeholder="Ask about any NSE stock..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !loading && sendMessage()
                }
                disabled={loading}
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shrink-0 ${
                  input.trim() && !loading
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted-foreground/10 text-muted-foreground"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-center text-[10px] text-muted-foreground mt-2">
              Multi-step reasoning • Portfolio-aware • Source-cited • Powered by Sarvam AI
            </p>
          </div>
        </div>
      )}
    </>
  );
}