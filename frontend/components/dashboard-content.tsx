"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PortfolioOverview } from "@/components/portfolio-overview"
import { BudgetTracker } from "@/components/budget-tracker"
import { ForecastSpending } from "@/components/forecast-spending"
import { SectorAllocation } from "@/components/sector-allocation"
import { PortfolioTrend } from "@/components/portfolio-trend"
import { PortfolioHealth } from "@/components/portfolio-health"
import { TransactionsPanel } from "@/components/transactions-panel"
import { GoalTracker } from "@/components/goal-tracker"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ArrowDown, ArrowUp, TrendingDown, TrendingUp } from "lucide-react"
import { fetchAllStocks } from "@/lib/stockData"

type MarketIndex = {
  name: string
  value: number
  change: number
}
const portfolioPerformanceData = [
  { month: "Jan", value: 100 },
  { month: "Feb", value: 103 },
  { month: "Mar", value: 106 },
  { month: "Apr", value: 109 },
  { month: "May", value: 114 },
  { month: "Jun", value: 118 },
  { month: "Jul", value: 121 },
  { month: "Aug", value: 125 },
  { month: "Sep", value: 123 },
  { month: "Oct", value: 127 },
  { month: "Nov", value: 131 },
  { month: "Dec", value: 135 },
]

const generateMiniChartData = (baseValue: number, isPositive: boolean) => {
  return Array(10)
    .fill(0)
    .map((_, i) => {
      const randomFactor = isPositive
        ? 0.95 + (i / 10) * 0.1 + Math.random() * 0.02
        : 1.05 - (i / 10) * 0.1 - Math.random() * 0.02
      return { name: i, value: baseValue * randomFactor }
    })
}

export function DashboardContent() {
  const [activeTab, setActiveTab] = useState("overview")
  const [topPerformers, setTopPerformers] = useState<any[]>([])
  const [worstPerformers, setWorstPerformers] = useState<any[]>([])
  const [loadingStocks, setLoadingStocks] = useState(true)
  const [marketIndices, setMarketIndices] = useState<MarketIndex[]>([
    { name: "Nifty 50", value: 0, change: 0 },
    { name: "Sensex", value: 0, change: 0 },
    { name: "Nifty Bank", value: 0, change: 0 },
    { name: "Nifty IT", value: 0, change: 0 },
  ])

  useEffect(() => {
    async function loadStocks() {
      try {
        const stocks = await fetchAllStocks()
        const sorted = [...stocks].sort(
          (a, b) => parseFloat(b.change) - parseFloat(a.change)
        )
        setTopPerformers(sorted.slice(0, 4))
        setWorstPerformers(sorted.slice(-4).reverse())
      } catch (e) {
        console.error("Failed to fetch stocks", e)
      } finally {
        setLoadingStocks(false)
      }
    }

    async function loadIndices() {
      try {
        const res = await fetch("http://localhost:8000/indices")
        const data = await res.json()
        setMarketIndices(
          (Array.isArray(data) ? data : []).map((item) => ({
            name: String(item.name ?? ""),
            value: Number(item.value ?? 0),
            change: Number(item.change ?? 0),
          }))
        )
      } catch (e) {
        console.error("Failed to fetch indices", e)
      }
    }

    // 1. Create a wrapper function to fetch everything at once
    const fetchMarketData = () => {
      loadStocks()
      loadIndices()
    }

    // 2. Fetch immediately when the page first loads
    fetchMarketData()

    // 3. Set up a continuous loop to fetch fresh data every 10 seconds (10000 ms)
    const intervalId = setInterval(fetchMarketData, 10000)

    // 4. Clean up the interval if the user navigates away from the dashboard
    return () => clearInterval(intervalId)
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your Indian market portfolio.
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
                  <LineChart
                    data={generateMiniChartData(item.value, item.change >= 0)}
                  >
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={item.change >= 0 ? "#4ade80" : "#f87171"}
                      strokeWidth={2}
                      dot={false}
                    />
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
            <CardDescription>Best performing NSE stocks today</CardDescription>
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
            <CardDescription>Worst performing NSE stocks today</CardDescription>
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

      {/* Portfolio Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Performance</CardTitle>
          <CardDescription>
            Year-to-date performance (indexed to 100)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={portfolioPerformanceData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="colorPortfolio"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis dataKey="month" />
                <YAxis domain={[95, 140]} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid gap-2">
                            <div className="font-medium">{label}</div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs text-muted-foreground">
                                Value
                              </span>
                              <span className="text-xs font-medium">
                                {payload[0].value}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#colorPortfolio)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-5 md:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
          <TabsTrigger value="allocation">Allocation</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <PortfolioOverview />
            <BudgetTracker />
            <ForecastSpending />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <SectorAllocation />
            <PortfolioTrend />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <PortfolioHealth />
            <TransactionsPanel />
            <GoalTracker />
          </div>
        </TabsContent>

        <TabsContent value="budget" className="space-y-4">
          <BudgetTracker fullWidth />
        </TabsContent>

        <TabsContent value="forecast" className="space-y-4">
          <ForecastSpending fullWidth />
        </TabsContent>

        <TabsContent value="allocation" className="space-y-4">
          <SectorAllocation fullWidth />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <PortfolioTrend fullWidth />
        </TabsContent>
      </Tabs>
    </div>
  )
}