"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { CheckCircle2, HelpCircle, TrendingDown, TrendingUp } from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

// Mock historical stock performance data with multiple tickers
const stockPerformanceData = [
  { date: "Jan", AAPL: 165.2, MSFT: 310.5, NVDA: 280.3, GOOGL: 135.2, AMZN: 115.8, SP500: 4800 },
  { date: "Feb", AAPL: 168.5, MSFT: 315.2, NVDA: 295.7, GOOGL: 138.4, AMZN: 118.2, SP500: 4850 },
  { date: "Mar", AAPL: 172.3, MSFT: 320.8, NVDA: 320.4, GOOGL: 140.1, AMZN: 120.5, SP500: 4900 },
  { date: "Apr", AAPL: 175.8, MSFT: 318.4, NVDA: 345.2, GOOGL: 139.8, AMZN: 122.3, SP500: 4920 },
  { date: "May", AAPL: 180.2, MSFT: 325.6, NVDA: 380.1, GOOGL: 141.2, AMZN: 124.8, SP500: 4980 },
  { date: "Jun", AAPL: 187.7, MSFT: 326.9, NVDA: 435.2, GOOGL: 142.7, AMZN: 129.1, SP500: 5050 },
]

type ChartType = "line" | "area" | "bar"

interface StockPerformanceChartProps {
  fullWidth?: boolean
}

export function StockPerformanceChart({ fullWidth = false }: StockPerformanceChartProps) {
  const [selectedStock, setSelectedStock] = useState("AAPL")
  const [period, setPeriod] = useState("6M")
  const [chartType, setChartType] = useState<ChartType>("area")
  const [compareToSP, setCompareToSP] = useState(true)

  // Calculate performance metrics
  const startValue = stockPerformanceData[0]?.[selectedStock as keyof (typeof stockPerformanceData)[0]] || 0
  const endValue =
    stockPerformanceData[stockPerformanceData.length - 1]?.[selectedStock as keyof (typeof stockPerformanceData)[0]] ||
    0
  const changeValue = endValue - startValue
  const changePercent = (changeValue / startValue) * 100
  const isPositive = changeValue >= 0

  // Format currency for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  // Calculate performance relative to starting value (for percentage comparison)
  const normalizedData = stockPerformanceData.map((item) => {
    const stockStart = stockPerformanceData[0][selectedStock as keyof (typeof stockPerformanceData)[0]] as number
    const sp500Start = stockPerformanceData[0].SP500 as number

    return {
      date: item.date,
      [selectedStock]: ((item[selectedStock as keyof typeof item] as number) / stockStart) * 100,
      SP500: (item.SP500 / sp500Start) * 100,
    }
  })

  // Generated data based on chart type selection
  const chartData = compareToSP ? normalizedData : stockPerformanceData

  // Render the appropriate chart based on the selected chart type
  const renderChart = () => {
    switch (chartType) {
      case "line":
        return (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => (compareToSP ? `${value}%` : `$${value}`)}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid gap-2">
                        <div className="font-medium">{payload[0].payload.date}</div>
                        {payload.map((entry, index) => (
                          <div key={index} className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1">
                              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                              <span className="text-xs text-muted-foreground">{entry.name}</span>
                            </div>
                            <span className="text-xs font-medium">
                              {compareToSP ? `${entry.value.toFixed(2)}%` : formatCurrency(entry.value as number)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Line
              type="monotone"
              dataKey={selectedStock}
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
            />
            {compareToSP && (
              <Line
                type="monotone"
                dataKey="SP500"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={1.5}
                strokeDasharray="5 5"
                dot={false}
                activeDot={{ r: 4, fill: "hsl(var(--muted-foreground))" }}
              />
            )}
          </LineChart>
        )

      case "area":
        return (
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorSP500" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => (compareToSP ? `${value}%` : `$${value}`)}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid gap-2">
                        <div className="font-medium">{payload[0].payload.date}</div>
                        {payload.map((entry, index) => (
                          <div key={index} className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1">
                              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                              <span className="text-xs text-muted-foreground">{entry.name}</span>
                            </div>
                            <span className="text-xs font-medium">
                              {compareToSP ? `${entry.value.toFixed(2)}%` : formatCurrency(entry.value as number)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Area
              type="monotone"
              dataKey={selectedStock}
              stroke="hsl(var(--primary))"
              fillOpacity={1}
              fill="url(#colorStock)"
            />
            {compareToSP && (
              <Area
                type="monotone"
                dataKey="SP500"
                stroke="hsl(var(--muted-foreground))"
                fillOpacity={0.3}
                fill="url(#colorSP500)"
                strokeDasharray="5 5"
              />
            )}
          </AreaChart>
        )

      case "bar":
        return (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => (compareToSP ? `${value}%` : `$${value}`)}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid gap-2">
                        <div className="font-medium">{payload[0].payload.date}</div>
                        {payload.map((entry, index) => (
                          <div key={index} className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1">
                              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                              <span className="text-xs text-muted-foreground">{entry.name}</span>
                            </div>
                            <span className="text-xs font-medium">
                              {compareToSP ? `${entry.value.toFixed(2)}%` : formatCurrency(entry.value as number)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Bar dataKey={selectedStock} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            {compareToSP && (
              <Bar dataKey="SP500" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} fillOpacity={0.5} />
            )}
          </BarChart>
        )
    }
  }

  return (
    <Card className={fullWidth ? "col-span-full" : ""}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>Stock Performance</CardTitle>
          <CardDescription>Historical price performance</CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={selectedStock} onValueChange={setSelectedStock}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Stock" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AAPL">AAPL</SelectItem>
              <SelectItem value="MSFT">MSFT</SelectItem>
              <SelectItem value="NVDA">NVDA</SelectItem>
              <SelectItem value="GOOGL">GOOGL</SelectItem>
              <SelectItem value="AMZN">AMZN</SelectItem>
            </SelectContent>
          </Select>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1M">1M</SelectItem>
              <SelectItem value="3M">3M</SelectItem>
              <SelectItem value="6M">6M</SelectItem>
              <SelectItem value="1Y">1Y</SelectItem>
              <SelectItem value="5Y">5Y</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-2xl font-bold">{formatCurrency(endValue)}</div>
            <div className={`flex items-center gap-1 text-sm ${isPositive ? "text-green-500" : "text-red-500"}`}>
              {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span>
                {isPositive ? "+" : ""}
                {formatCurrency(changeValue)} ({isPositive ? "+" : ""}
                {changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>

          <div className="flex gap-1">
            <Button
              variant={chartType === "line" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartType("line")}
              className="h-8 w-8 p-0"
            >
              <LineChart className="h-4 w-4" />
            </Button>
            <Button
              variant={chartType === "area" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartType("area")}
              className="h-8 w-8 p-0"
            >
              <AreaChart className="h-4 w-4" />
            </Button>
            <Button
              variant={chartType === "bar" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartType("bar")}
              className="h-8 w-8 p-0"
            >
              <BarChart className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="h-[300px]">
          <ChartContainer config={{}}>
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCompareToSP(!compareToSP)}
          className={`gap-1 ${compareToSP ? "text-primary" : "text-muted-foreground"}`}
        >
          {compareToSP ? <CheckCircle2 className="h-4 w-4" /> : <HelpCircle className="h-4 w-4" />}
          Compare to S&P 500
        </Button>
        <div className="text-xs text-muted-foreground">Last updated: 2 minutes ago</div>
      </CardFooter>
    </Card>
  )
}
