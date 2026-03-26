"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Area, AreaChart, Tooltip } from "recharts"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"

// Mock forecast data
const forecastData = [
  { month: "Jan", actual: 450, forecast: 0 },
  { month: "Feb", actual: 620, forecast: 0 },
  { month: "Mar", actual: 380, forecast: 0 },
  { month: "Apr", actual: 563, forecast: 0 },
  { month: "May", actual: 0, forecast: 580 },
  { month: "Jun", actual: 0, forecast: 610 },
  { month: "Jul", actual: 0, forecast: 590 },
]

// Detailed forecast data
const detailedForecastData = [
  { month: "May", stocks: 350, etfs: 180, crypto: 50 },
  { month: "Jun", stocks: 370, etfs: 190, crypto: 50 },
  { month: "Jul", stocks: 360, etfs: 180, crypto: 50 },
]

export function ForecastSpending({ fullWidth = false }: { fullWidth?: boolean }) {
  const [chartType, setChartType] = useState<"line" | "area">("area")

  const currentMonth = "Apr"
  const nextMonth = "May"
  const forecastAmount = 563.08
  const underBudget = 2286.92

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <Card className={fullWidth ? "col-span-full" : ""}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>Forecast</CardTitle>
          <CardDescription>Next month's predicted spending</CardDescription>
        </div>
        <Tabs value={chartType} onValueChange={(value) => setChartType(value as "line" | "area")}>
          <TabsList className="grid w-[180px] grid-cols-2">
            <TabsTrigger value="line">Line Chart</TabsTrigger>
            <TabsTrigger value="area">Area Chart</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{formatCurrency(forecastAmount)}</div>
        <div className="text-sm text-green-500">{formatCurrency(underBudget)} under budget</div>
        <div className="h-[200px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "line" ? (
              <LineChart data={forecastData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="month"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid gap-2">
                            <div className="font-medium">{label}</div>
                            {payload.map((entry, index) => (
                              <div key={index} className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1">
                                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                  <span className="text-xs text-muted-foreground">{entry.name}</span>
                                </div>
                                <span className="text-xs font-medium">{formatCurrency(entry.value as number)}</span>
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
                  dataKey="actual"
                  name="Actual"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  stroke="hsl(var(--primary))"
                />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  name="Forecast"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  stroke="hsl(var(--muted-foreground))"
                />
              </LineChart>
            ) : (
              <AreaChart data={forecastData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="month"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid gap-2">
                            <div className="font-medium">{label}</div>
                            {payload.map((entry, index) => (
                              <div key={index} className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1">
                                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                  <span className="text-xs text-muted-foreground">{entry.name}</span>
                                </div>
                                <span className="text-xs font-medium">{formatCurrency(entry.value as number)}</span>
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
                  dataKey="actual"
                  name="Actual"
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#colorActual)"
                />
                <Area
                  type="monotone"
                  dataKey="forecast"
                  name="Forecast"
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="4 4"
                  fillOpacity={0.5}
                  fill="url(#colorForecast)"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>

        <div className="mt-4 h-[150px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={detailedForecastData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid gap-2">
                          <div className="font-medium">{label}</div>
                          {payload.map((entry, index) => (
                            <div key={index} className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1">
                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                <span className="text-xs text-muted-foreground">{entry.name}</span>
                              </div>
                              <span className="text-xs font-medium">{formatCurrency(entry.value as number)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area type="monotone" dataKey="stocks" stackId="1" name="Stocks" stroke="#8884d8" fill="#8884d8" />
              <Area type="monotone" dataKey="etfs" stackId="1" name="ETFs" stroke="#82ca9d" fill="#82ca9d" />
              <Area type="monotone" dataKey="crypto" stackId="1" name="Crypto" stroke="#ffc658" fill="#ffc658" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          <p>
            Based on your spending patterns, we predict you'll invest {formatCurrency(forecastAmount)} in {nextMonth}.
          </p>
          <p className="mt-1">This is {formatCurrency(underBudget)} under your monthly budget.</p>
        </div>
      </CardContent>
    </Card>
  )
}
