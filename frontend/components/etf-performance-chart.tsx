"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { CheckCircle2, TrendingDown, TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

// Mock ETF performance data
const etfPerformanceData = [
  { date: "Jan", VOO: 380.5, VTI: 215.3, QQQ: 340.2, VGT: 425.8, VYM: 108.2, Index: 100 },
  { date: "Feb", VOO: 385.2, VTI: 220.5, QQQ: 350.4, VGT: 435.2, VYM: 109.5, Index: 101.2 },
  { date: "Mar", VOO: 390.8, VTI: 225.2, QQQ: 355.8, VGT: 440.5, VYM: 110.2, Index: 102.7 },
  { date: "Apr", VOO: 395.4, VTI: 228.4, QQQ: 360.2, VGT: 445.8, VYM: 110.8, Index: 103.8 },
  { date: "May", VOO: 405.2, VTI: 232.5, QQQ: 370.5, VGT: 455.2, VYM: 111.5, Index: 106.2 },
  { date: "Jun", VOO: 412.7, VTI: 235.8, QQQ: 378.4, VGT: 465.3, VYM: 112.4, Index: 108.4 },
]

interface EtfPerformanceChartProps {
  fullWidth?: boolean
}

export function EtfPerformanceChart({ fullWidth = false }: EtfPerformanceChartProps) {
  const [selectedEtf, setSelectedEtf] = useState("VOO")
  const [period, setPeriod] = useState("6M")
  const [compareToIndex, setCompareToIndex] = useState(true)

  // Calculate performance metrics
  const startValue = etfPerformanceData[0]?.[selectedEtf as keyof (typeof etfPerformanceData)[0]] || 0
  const endValue =
    etfPerformanceData[etfPerformanceData.length - 1]?.[selectedEtf as keyof (typeof etfPerformanceData)[0]] || 0
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
  const normalizedData = etfPerformanceData.map((item) => {
    const etfStart = etfPerformanceData[0][selectedEtf as keyof (typeof etfPerformanceData)[0]] as number

    return {
      date: item.date,
      [selectedEtf]: ((item[selectedEtf as keyof typeof item] as number) / etfStart) * 100,
      Index: item.Index,
    }
  })

  // Generated data based on chart type selection
  const chartData = compareToIndex ? normalizedData : etfPerformanceData

  return (
    <Card className={fullWidth ? "col-span-full" : ""}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>ETF Performance</CardTitle>
          <CardDescription>Historical price performance</CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={selectedEtf} onValueChange={setSelectedEtf}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="ETF" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="VOO">VOO</SelectItem>
              <SelectItem value="VTI">VTI</SelectItem>
              <SelectItem value="QQQ">QQQ</SelectItem>
              <SelectItem value="VGT">VGT</SelectItem>
              <SelectItem value="VYM">VYM</SelectItem>
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
        </div>

        <div className="h-[300px]">
          <ChartContainer config={{}}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorEtf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorIndex" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => (compareToIndex ? `${value}%` : `$${value}`)}
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
                                  {compareToIndex
                                    ? `${entry.value.toFixed(2)}%`
                                    : formatCurrency(entry.value as number)}
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
                  dataKey={selectedEtf}
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#colorEtf)"
                />
                {compareToIndex && (
                  <Area
                    type="monotone"
                    dataKey="Index"
                    stroke="hsl(var(--muted-foreground))"
                    fillOpacity={0.3}
                    fill="url(#colorIndex)"
                    strokeDasharray="5 5"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCompareToIndex(!compareToIndex)}
          className={`gap-1 ${compareToIndex ? "text-primary" : "text-muted-foreground"}`}
        >
          {compareToIndex ? <CheckCircle2 className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4 opacity-50" />}
          Compare to Index
        </Button>
        <div className="text-xs text-muted-foreground">Last updated: 2 minutes ago</div>
      </CardFooter>
    </Card>
  )
}
