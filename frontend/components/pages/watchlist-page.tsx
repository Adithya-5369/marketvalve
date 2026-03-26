"use client"

import { WatchlistStocks } from "@/components/watchlist-stocks"
import { WatchlistAlerts } from "@/components/watchlist-alerts"

export function WatchlistPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Watchlist</h1>
        <p className="text-muted-foreground">Monitor stocks you're interested in.</p>
      </div>

      <WatchlistStocks />
      <WatchlistAlerts />
    </div>
  )
}
