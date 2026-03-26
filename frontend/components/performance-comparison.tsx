"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

// Mock performance comparison data
const generateComparisonData = (period: string) => {
  const baseData: Record<string, any[]> = {
    "1M": Array.from({ length: 30 }, (_, i) => ({
      date: `${i + 1}`,
      portfolio: 100 + (Math.random() * 2 - 0.5) * i,
      sp500: 100 + (Math.random() * 1.5 - 0.7) * i,
      nasdaq: 100 + (Math.random() * 2.2 - 0.6) * i,
    })),
    "3M": Array.from({ length: 12 }, (_, i) => ({
      date: `Week ${i + 1}`,
      portfolio: 100 + (Math.random() * 5 - 1) * i,
      sp500: 100 + (Math.random() * 4 - 1.5) * i,
      nasdaq: 100 + (Math.random() * 6 - 1.2) * i,
    })),
    "6M": Array.from({ length: 6 }, (_, i) => ({
      date: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"][i],
      portfolio: 100 + (Math.random() * 10 - 2) * i,
      sp500: 100 + (Math.random() * 8 - 3) * i,
      nasdaq: 100 + (Math.random() * 12 - 2.5) * i,
    })),
    "1Y": Array.from({ length: 12 }, (_, i) => ({
      date: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
      portfolio: 100 + ((Math.random() * 20 - 5) * i) / 2,
      sp500: 100 + ((Math.random() * 15 - 6) * i) / 2,
      nasdaq: 100 + ((Math.random() * 25 - 5) * i) / 2,
    })),
  }

  return baseData[period] || baseData["1M"]
}

export function PerformanceComparison() {
  const [period, setPeriod] = useState("1Y")
  const comparisonData = generateComparisonData(period)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>Benchmark Comparison</CardTitle>
          <CardDescription>Portfolio performance vs. market indices</CardDescription>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[80px]">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1M">1M</SelectItem>
            <SelectItem value="3M">3M</SelectItem>
            <SelectItem value="6M">6M</SelectItem>
            <SelectItem value="1Y">1Y</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer
            config={{
              portfolio: {
                label: "Your Portfolio",
                color: "hsl(var(--primary))",
              },
              sp500: {
                label: "S&P 500",
                color: "hsl(var(--muted-foreground))",
              },
              nasdaq: {
                label: "NASDAQ",
                color: "hsl(var(--chart-3))",
              },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" />
                <YAxis domain={["dataMin - 5", "dataMax + 5"]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="portfolio"
                  name="portfolio"
                  stroke="var(--color-portfolio)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="sp500"
                  name="sp500"
                  stroke="var(--color-sp500)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="nasdaq"
                  name="nasdaq"
                  stroke="var(--color-nasdaq)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
