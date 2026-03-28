"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Line, LineChart, ResponsiveContainer } from "recharts"
import { ArrowDown, ArrowUp, TrendingDown, TrendingUp, Clock } from "lucide-react"
import { fetchAllStocks } from "@/lib/stockData"
import { API_BASE_URL } from "@/lib/api"

type MarketIndex = { name: string; value: number; change: number }

const generateMiniChartData = (baseValue: number, isPositive: boolean) => {
  return Array(10).fill(0).map((_, i) => {
    const rf = isPositive ? 0.95 + (i / 10) * 0.1 + Math.random() * 0.02 : 1.05 - (i / 10) * 0.1 - Math.random() * 0.02
    return { name: i, value: baseValue * rf }
  })
}

export function DashboardContent() {
  const [topPerformers, setTopPerformers] = useState<any[]>([])
  const [worstPerformers, setWorstPerformers] = useState<any[]>([])
  const [loadingStocks, setLoadingStocks] = useState(true)
  const [marketIndices, setMarketIndices] = useState<MarketIndex[]>([
    { name: "Nifty 50", value: 0, change: 0 },
    { name: "Sensex", value: 0, change: 0 },
    { name: "Nifty Bank", value: 0, change: 0 },
    { name: "Nifty IT", value: 0, change: 0 },
  ])
  const [marketStatus, setMarketStatus] = useState<"Live" | "Closed">("Closed")

  useEffect(() => {
    async function loadStocks() {
      try {
        const stocks = await fetchAllStocks()
        const sorted = [...stocks].sort((a, b) => parseFloat(b.change) - parseFloat(a.change))
        setTopPerformers(sorted.slice(0, 5))
        setWorstPerformers(sorted.slice(-5).reverse())
      } catch (e) { console.error("Failed to fetch stocks", e) }
      finally { setLoadingStocks(false) }
    }

    async function loadIndices() {
      try {
        const res = await fetch(`${API_BASE_URL}/indices`)
        const data = await res.json()
        setMarketIndices(
          (Array.isArray(data) ? data : []).map((item) => ({
            name: String(item.name ?? ""),
            value: Number(item.value ?? 0),
            change: Number(item.change ?? 0),
          }))
        )
      } catch (e) { console.error("Failed to fetch indices", e) }
    }

    const fetchMarketData = () => { loadStocks(); loadIndices() }
    fetchMarketData()

    // Determine market status
    const updateMarketStatus = () => {
      const now = new Date()
      // IST offset is +5:30. Current UTC hours + 5.5 = IST hours
      const estTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000))
      const hours = estTime.getUTCHours()
      const minutes = estTime.getUTCMinutes()
      const day = estTime.getUTCDay()
      
      const isWeekend = day === 0 || day === 6 // Saturday or Sunday
      const isLiveHours = (hours > 9 || (hours === 9 && minutes >= 15)) && (hours < 15 || (hours === 15 && minutes <= 30))
      
      setMarketStatus(isWeekend || !isLiveHours ? "Closed" : "Live")
    }
    
    updateMarketStatus()
    const intervalId = setInterval(() => {
      fetchMarketData()
      updateMarketStatus()
    }, 10000)
    return () => clearInterval(intervalId)
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <Badge variant={marketStatus === "Live" ? "default" : "secondary"} className="h-6 gap-1 px-2.5 outline-none font-medium">
            <Clock className="h-3 w-3" />
            Market {marketStatus}
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Welcome back! Here's your live Indian market overview • powered by NSE India.
        </p>
      </div>

      {/* Indian Market Indices */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {marketIndices.map((item, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.name}</CardTitle>
              <div className={`flex items-center ${item.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                {item.change >= 0 ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                {item.change >= 0 ? "+" : ""}
                {item.change}%
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{item.value.toLocaleString("en-IN")}
              </div>
              <div className="h-[50px] w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={generateMiniChartData(item.value, item.change >= 0)}>
                    <Line type="monotone" dataKey="value" stroke={item.change >= 0 ? "#4ade80" : "#f87171"} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top & Worst Performers — Live NSE Data */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>Best performing NSE stocks today (Live)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loadingStocks ? (
                <div className="text-sm text-muted-foreground animate-pulse">
                  Loading NSE data...
                </div>
              ) : (
                topPerformers.map((stock, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{stock.ticker}</div>
                      <div className="text-sm text-muted-foreground">
                        ₹{stock.price}
                      </div>
                    </div>
                    <div className="flex items-center text-green-500">
                      <ArrowUp className="mr-1 h-4 w-4" />+{stock.change}%
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Worst Performers</CardTitle>
            <CardDescription>Worst performing NSE stocks today (Live)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loadingStocks ? (
                <div className="text-sm text-muted-foreground animate-pulse">
                  Loading NSE data...
                </div>
              ) : (
                worstPerformers.map((stock, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{stock.ticker}</div>
                      <div className="text-sm text-muted-foreground">
                        ₹{stock.price}
                      </div>
                    </div>
                    <div className="flex items-center text-red-500">
                      <ArrowDown className="mr-1 h-4 w-4" />
                      {stock.change}%
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}