"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Plus, Trash2 } from "lucide-react"

// Mock watchlist alerts data
const watchlistAlerts = [
  {
    ticker: "TSLA",
    name: "Tesla, Inc.",
    condition: "above",
    price: 250.0,
    currentPrice: 248.42,
    percentAway: 0.64,
  },
  {
    ticker: "META",
    name: "Meta Platforms, Inc.",
    condition: "below",
    price: 300.0,
    currentPrice: 325.76,
    percentAway: -7.91,
    triggered: true,
  },
  {
    ticker: "PYPL",
    name: "PayPal Holdings, Inc.",
    condition: "below",
    price: 60.0,
    currentPrice: 62.38,
    percentAway: -3.82,
  },
]

export function WatchlistAlerts() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>Price Alerts</CardTitle>
          <CardDescription>Get notified when stocks hit your target price</CardDescription>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Alert
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {watchlistAlerts.map((alert, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-md border hover:bg-muted">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{alert.ticker}</span>
                  {alert.triggered && <Badge variant="destructive">Triggered</Badge>}
                </div>
                <div className="text-sm text-muted-foreground">{alert.name}</div>
                <div className="text-sm">
                  Alert when price goes {alert.condition}{" "}
                  <span className="font-medium">{formatCurrency(alert.price)}</span>
                </div>
              </div>
              <div className="text-right space-y-1">
                <div className="font-medium">{formatCurrency(alert.currentPrice)}</div>
                <div className={`text-sm ${alert.percentAway > 0 ? "text-green-500" : "text-red-500"}`}>
                  {Math.abs(alert.percentAway).toFixed(2)}% {alert.percentAway > 0 ? "away" : "exceeded"}
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
