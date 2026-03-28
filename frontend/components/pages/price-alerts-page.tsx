"use client"

import { WatchlistAlerts } from "@/components/watchlist-alerts"

export function PriceAlertsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">
          Price Alerts
        </h1>
        <p className="text-muted-foreground">
          Set custom price alerts for your watchlist stocks.
        </p>
      </div>

      <WatchlistAlerts />
    </div>
  )
}
