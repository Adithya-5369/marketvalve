"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, Plus, Settings } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock alerts data
const priceAlerts = [
  { id: 1, ticker: "AAPL", condition: "above", price: 180.0, active: true },
  { id: 2, ticker: "MSFT", condition: "below", price: 270.0, active: true },
  { id: 3, ticker: "NVDA", condition: "above", price: 300.0, active: false },
]

const newsAlerts = [
  { id: 1, ticker: "AAPL", type: "earnings", active: true },
  { id: 2, ticker: "AMZN", type: "news", active: true },
  { id: 3, ticker: "TSLA", type: "analyst_ratings", active: true },
]

const eventAlerts = [
  { id: 1, ticker: "MSFT", event: "Earnings Call", date: "2023-04-25", active: true },
  { id: 2, ticker: "GOOGL", event: "Dividend Payment", date: "2023-05-10", active: true },
  { id: 3, ticker: "META", event: "Product Launch", date: "2023-05-15", active: false },
]

export function AlertsPanel({ fullWidth = false }: { fullWidth?: boolean }) {
  const [activeTab, setActiveTab] = useState("price")

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date)
  }

  return (
    <Card className={fullWidth ? "col-span-full" : ""}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>Alerts & Notifications</CardTitle>
          <CardDescription>Manage your custom alerts</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
            <span className="sr-only">Settings</span>
          </Button>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Alert
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="price" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="price">Price Alerts</TabsTrigger>
            <TabsTrigger value="news">News Alerts</TabsTrigger>
            <TabsTrigger value="events">Event Reminders</TabsTrigger>
          </TabsList>

          <TabsContent value="price" className="space-y-4">
            {priceAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                <div className="flex items-center gap-3">
                  <Bell className={`h-4 w-4 ${alert.active ? "text-primary" : "text-muted-foreground"}`} />
                  <div>
                    <div className="font-medium">{alert.ticker}</div>
                    <div className="text-sm text-muted-foreground">
                      Alert when price goes {alert.condition} {formatCurrency(alert.price)}
                    </div>
                  </div>
                </div>
                <Switch checked={alert.active} />
              </div>
            ))}
          </TabsContent>

          <TabsContent value="news" className="space-y-4">
            {newsAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                <div className="flex items-center gap-3">
                  <Bell className={`h-4 w-4 ${alert.active ? "text-primary" : "text-muted-foreground"}`} />
                  <div>
                    <div className="font-medium">{alert.ticker}</div>
                    <div className="text-sm text-muted-foreground">
                      Alert on{" "}
                      {alert.type === "earnings"
                        ? "earnings reports"
                        : alert.type === "news"
                          ? "major news"
                          : "analyst ratings"}
                    </div>
                  </div>
                </div>
                <Switch checked={alert.active} />
              </div>
            ))}
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            {eventAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                <div className="flex items-center gap-3">
                  <Bell className={`h-4 w-4 ${alert.active ? "text-primary" : "text-muted-foreground"}`} />
                  <div>
                    <div className="font-medium">
                      {alert.ticker}: {alert.event}
                    </div>
                    <div className="text-sm text-muted-foreground">Scheduled for {formatDate(alert.date)}</div>
                  </div>
                </div>
                <Switch checked={alert.active} />
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
