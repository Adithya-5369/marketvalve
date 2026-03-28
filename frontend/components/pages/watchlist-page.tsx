"use client"

import { WatchlistStocks } from "@/components/watchlist-stocks"

export function WatchlistPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Watchlist</h1>
        <p className="text-muted-foreground">Track your favorite NSE stocks with live prices.</p>
      </div>

      <WatchlistStocks />
    </div>
  )
}
