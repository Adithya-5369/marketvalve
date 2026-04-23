"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
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

export function AlertsHistory() {
  const [signals, setSignals] = useState<Signal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
      async function fetchSignals(isBackground = false) {
        if (!isBackground) setLoading(true)
        
        try {
          const res = await fetch(`${API_BASE_URL}/radar?stock=ALL`)
          const data = await res.json()
          const incoming = data.signals || []
          if (isBackground && signals.length > 0) {
            // Merge: add only new signals not already present
            const existingTitles = new Set(signals.map(s => s.title))
            const newSignals = incoming.filter((s: Signal) => !existingTitles.has(s.title))
            if (newSignals.length > 0) {
              setSignals(prev => [...newSignals, ...prev])
            }
          } else {
            setSignals(incoming)
          }
        } catch {
          if (!isBackground) setSignals([])
        } finally {
          if (!isBackground) setLoading(false)
        }
      }

      fetchSignals(false)
    }, [])

  function getSignalType(signals: string[]): string {
    if (signals.includes("fii_buy") || signals.includes("fii_sell")) return "FII"
    if (signals.includes("insider_buy") || signals.includes("insider_sell")) return "Insider"
    if (signals.includes("bulk_deal")) return "Deal"
    if (signals.includes("upgrade") || signals.includes("downgrade")) return "Analyst"
    if (signals.includes("breakout") || signals.includes("breakdown")) return "Technical"
    if (signals.includes("earnings")) return "Earnings"
    return "News"
  }

  function getBadgeVariant(type: string): "default" | "secondary" | "destructive" | "outline" {
    if (type === "FII" || type === "Deal") return "default"
    if (type === "Earnings") return "secondary"
    if (type === "Analyst") return "outline"
    return "destructive"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Signal History</CardTitle>
        <CardDescription>AI-detected sentiment signals from ET Markets</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Headline</TableHead>
                  <TableHead>Sentiment</TableHead>
                  <TableHead>Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground animate-pulse">
                      Loading live signals...
                    </TableCell>
                  </TableRow>
                ) : signals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No signals detected today.
                    </TableCell>
                  </TableRow>
                ) : (
                  signals.map((signal, i) => {
                    const type = getSignalType(signal.signals)
                    return (
                      <TableRow key={i}>
                        <TableCell className="text-sm whitespace-nowrap">
                          {signal.date ? signal.date.slice(0, 16) : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getBadgeVariant(type)}>{type}</Badge>
                        </TableCell>
                        <TableCell className="max-w-[300px]">
                          <div className="text-sm font-medium line-clamp-2">{signal.title}</div>
                        </TableCell>
                        <TableCell>
                          <span className={
                            signal.sentiment.includes("Bullish")
                              ? "text-green-500 text-sm font-medium"
                              : signal.sentiment.includes("Bearish")
                              ? "text-red-500 text-sm font-medium"
                              : "text-muted-foreground text-sm"
                          }>
                            {signal.sentiment.includes("Bullish") ? "🟢 Bullish"
                              : signal.sentiment.includes("Bearish") ? "🔴 Bearish"
                              : "⚪ Neutral"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {signal.link ? (
                            <a
                              href={signal.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline"
                            >
                              {signal.source || "ET Markets"} →
                            </a>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              {signal.source || "ET Markets"}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}