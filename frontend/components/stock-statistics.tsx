"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ChartContainer } from "@/components/ui/chart"
import { useState } from "react"

// Mock portfolio performance data
const monthlyPerformanceData = [
  { month: "Jan", value: 2.5 },
  { month: "Feb", value: -1.2 },
  { month: "Mar", value: 3.7 },
  { month: "Apr", value: 1.8 },
  { month: "May", value: 4.2 },
  { month: "Jun", value: 2.3 },
]

// Sector performance data
const sectorPerformanceData = [
  { sector: "Technology", value: 8.5 },
  { sector: "Healthcare", value: -2.1 },
  { sector: "Financial", value: 4.3 },
  { sector: "Consumer", value: 1.7 },
  { sector: "Communication", value: 3.2 },
  { sector: "Other", value: -1.5 },
]

// Stock metrics data
const stockMetricsData = [
  {
    name: "AAPL",
    marketCap: "2.85T",
    peRatio: 28.4,
    beta: 1.23,
    divYield: 0.51,
    dayRange: "$185.05 - $189.74",
    yearRange: "$147.92 - $189.74",
    volume: "58.4M",
    avgVolume: "62.3M",
  },
  {
    name: "MSFT",
    marketCap: "2.74T",
    peRatio: 32.1,
    beta: 0.92,
    divYield: 0.82,
    dayRange: "$323.45 - $328.90",
    yearRange: "$245.61 - $331.05",
    volume: "25.3M",
    avgVolume: "24.5M",
  },
  {
    name: "NVDA",
    marketCap: "1.07T",
    peRatio: 64.3,
    beta: 1.74,
    divYield: 0.05,
    dayRange: "$429.80 - $439.75",
    yearRange: "$138.84 - $445.20",
    volume: "48.2M",
    avgVolume: "52.7M",
  },
  {
    name: "GOOGL",
    marketCap: "1.78T",
    peRatio: 24.7,
    beta: 1.05,
    divYield: 0.0,
    dayRange: "$140.12 - $143.85",
    yearRange: "$102.63 - $143.85",
    volume: "32.7M",
    avgVolume: "35.4M",
  },
]

export function StockStatistics() {
  const [metricView, setMetricView] = useState("monthly")

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Monthly and sector performance</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={metricView} onValueChange={setMetricView}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="sector">Sector</TabsTrigger>
            </TabsList>

            <TabsContent value="monthly" className="space-y-4">
              <div className="h-[250px]">
                <ChartContainer config={{}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `${value}%`} />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-sm">
                                <div className="grid gap-2">
                                  <div className="font-medium">{label}</div>
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs text-muted-foreground">Performance</span>
                                    <span
                                      className={`text-xs font-medium ${payload[0].value >= 0 ? "text-green-500" : "text-red-500"}`}
                                    >
                                      {payload[0].value >= 0 ? "+" : ""}
                                      {payload[0].value}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Bar
                        dataKey="value"
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                        className="[&.recharts-bar-rectangle]:fill-green-500 [&.recharts-bar-rectangle[value^='-']]:fill-red-500"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </TabsContent>

            <TabsContent value="sector" className="space-y-4">
              <div className="h-[250px]">
                <ChartContainer config={{}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={sectorPerformanceData}
                      layout="vertical"
                      margin={{ top: 5, right: 5, bottom: 5, left: 80 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" tickFormatter={(value) => `${value}%`} />
                      <YAxis dataKey="sector" type="category" width={80} />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-sm">
                                <div className="grid gap-2">
                                  <div className="font-medium">{label}</div>
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs text-muted-foreground">Performance</span>
                                    <span
                                      className={`text-xs font-medium ${payload[0].value >= 0 ? "text-green-500" : "text-red-500"}`}
                                    >
                                      {payload[0].value >= 0 ? "+" : ""}
                                      {payload[0].value}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Bar
                        dataKey="value"
                        fill="hsl(var(--primary))"
                        radius={[0, 4, 4, 0]}
                        className="[&.recharts-bar-rectangle]:fill-green-500 [&.recharts-bar-rectangle[value^='-']]:fill-red-500"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Key Stock Metrics</CardTitle>
          <CardDescription>Financial metrics for major holdings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Stock</TableHead>
                    <TableHead className="text-right">P/E Ratio</TableHead>
                    <TableHead className="text-right">Div Yield</TableHead>
                    <TableHead className="text-right">Beta</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockMetricsData.map((stock) => (
                    <TableRow key={stock.name} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium">{stock.name}</TableCell>
                      <TableCell className="text-right">{stock.peRatio}</TableCell>
                      <TableCell className="text-right">{stock.divYield}%</TableCell>
                      <TableCell className="text-right">{stock.beta}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            <p>Data updated as of today, 9:30 AM ET</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
