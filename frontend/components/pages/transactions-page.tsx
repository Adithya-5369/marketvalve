"use client"

import { useState } from "react"
import { TransactionsPanel } from "@/components/transactions-panel"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

// Transaction summary data
const transactionSummaryData = [
  { month: "Jan", buy: 3500, sell: 1200 },
  { month: "Feb", buy: 4200, sell: 2100 },
  { month: "Mar", buy: 3800, sell: 1800 },
  { month: "Apr", buy: 5100, sell: 2400 },
  { month: "May", buy: 4700, sell: 3100 },
  { month: "Jun", buy: 5500, sell: 2800 },
]

// Transaction type data
const transactionTypeData = [
  { name: "Buy", value: 65, color: "#4ade80" },
  { name: "Sell", value: 35, color: "#f87171" },
]

// Asset class distribution data
const assetClassData = [
  { name: "Stocks", value: 68, color: "#8884d8" },
  { name: "ETFs", value: 22, color: "#82ca9d" },
  { name: "Crypto", value: 10, color: "#ffc658" },
]

// Monthly transaction volume data
const monthlyVolumeData = [
  { name: "Jan", volume: 4700 },
  { name: "Feb", volume: 6300 },
  { name: "Mar", volume: 5600 },
  { name: "Apr", volume: 7500 },
  { name: "May", volume: 7800 },
  { name: "Jun", volume: 8300 },
]

export function TransactionsPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground">View and manage your investment transactions.</p>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Transaction Summary</CardTitle>
                <CardDescription>Buy vs. Sell transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ChartContainer
                    config={{
                      buy: {
                        label: "Buy",
                        color: "hsl(142, 76%, 36%)",
                      },
                      sell: {
                        label: "Sell",
                        color: "hsl(0, 84%, 60%)",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={transactionSummaryData}>
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
                                          <div
                                            className="h-2 w-2 rounded-full"
                                            style={{ backgroundColor: entry.color }}
                                          />
                                          <span className="text-xs text-muted-foreground">{entry.name}</span>
                                        </div>
                                        <span className="text-xs font-medium">
                                          ${Number(entry.value).toLocaleString()}
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
                        <Bar dataKey="buy" name="Buy" fill="var(--color-buy)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="sell" name="Sell" fill="var(--color-sell)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Transaction Types</CardTitle>
                <CardDescription>Distribution by transaction type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ChartContainer config={{}}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={transactionTypeData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {transactionTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload
                              return (
                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                  <div className="grid gap-2">
                                    <div className="font-medium">{data.name}</div>
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="flex items-center gap-1">
                                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: data.color }} />
                                        <span className="text-xs text-muted-foreground">Percentage</span>
                                      </div>
                                      <span className="text-xs font-medium">{data.value}%</span>
                                    </div>
                                  </div>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Asset Distribution</CardTitle>
                <CardDescription>Transactions by asset class</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ChartContainer config={{}}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={assetClassData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {assetClassData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload
                              return (
                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                  <div className="grid gap-2">
                                    <div className="font-medium">{data.name}</div>
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="flex items-center gap-1">
                                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: data.color }} />
                                        <span className="text-xs text-muted-foreground">Percentage</span>
                                      </div>
                                      <span className="text-xs font-medium">{data.value}%</span>
                                    </div>
                                  </div>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Monthly Transaction Volume</CardTitle>
              <CardDescription>Total transaction volume by month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ChartContainer
                  config={{
                    volume: {
                      label: "Volume",
                      color: "hsl(var(--primary))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyVolumeData}>
                      <defs>
                        <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-sm">
                                <div className="grid gap-2">
                                  <div className="font-medium">{label}</div>
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs text-muted-foreground">Volume</span>
                                    <span className="text-xs font-medium">
                                      ${Number(payload[0].value).toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="volume"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ r: 4, strokeWidth: 2 }}
                        activeDot={{ r: 6, strokeWidth: 2 }}
                        fill="url(#colorVolume)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          <TransactionsPanel fullWidth />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <TransactionsPanel fullWidth />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Transaction Trends</CardTitle>
                <CardDescription>Monthly buy/sell patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ChartContainer
                    config={{
                      buy: {
                        label: "Buy",
                        color: "hsl(142, 76%, 36%)",
                      },
                      sell: {
                        label: "Sell",
                        color: "hsl(0, 84%, 60%)",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={transactionSummaryData}>
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
                                          <div
                                            className="h-2 w-2 rounded-full"
                                            style={{ backgroundColor: entry.color }}
                                          />
                                          <span className="text-xs text-muted-foreground">{entry.name}</span>
                                        </div>
                                        <span className="text-xs font-medium">
                                          ${Number(entry.value).toLocaleString()}
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
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="buy"
                          name="Buy"
                          stroke="var(--color-buy)"
                          strokeWidth={2}
                          dot={{ r: 4, strokeWidth: 2 }}
                          activeDot={{ r: 6, strokeWidth: 2 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="sell"
                          name="Sell"
                          stroke="var(--color-sell)"
                          strokeWidth={2}
                          dot={{ r: 4, strokeWidth: 2 }}
                          activeDot={{ r: 6, strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Asset Class Analysis</CardTitle>
                <CardDescription>Transaction distribution by asset type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ChartContainer
                    config={{
                      stocks: {
                        label: "Stocks",
                        color: "#8884d8",
                      },
                      etfs: {
                        label: "ETFs",
                        color: "#82ca9d",
                      },
                      crypto: {
                        label: "Crypto",
                        color: "#ffc658",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { month: "Jan", stocks: 3200, etfs: 1100, crypto: 400 },
                          { month: "Feb", stocks: 4300, etfs: 1400, crypto: 600 },
                          { month: "Mar", stocks: 3800, etfs: 1200, crypto: 600 },
                          { month: "Apr", stocks: 5100, etfs: 1600, crypto: 800 },
                          { month: "May", stocks: 4900, etfs: 2000, crypto: 900 },
                          { month: "Jun", stocks: 5600, etfs: 1800, crypto: 900 },
                        ]}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
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
                                          <div
                                            className="h-2 w-2 rounded-full"
                                            style={{ backgroundColor: entry.color }}
                                          />
                                          <span className="text-xs text-muted-foreground">{entry.name}</span>
                                        </div>
                                        <span className="text-xs font-medium">
                                          ${Number(entry.value).toLocaleString()}
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
                        <Legend />
                        <Bar dataKey="stocks" name="Stocks" stackId="a" fill="var(--color-stocks)" />
                        <Bar dataKey="etfs" name="ETFs" stackId="a" fill="var(--color-etfs)" />
                        <Bar dataKey="crypto" name="Crypto" stackId="a" fill="var(--color-crypto)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Total Transactions</CardTitle>
                <CardDescription>Last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">248</div>
                <p className="text-xs text-muted-foreground">+12% from previous period</p>
                <div className="mt-4 h-[150px]">
                  <ChartContainer config={{}}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { month: "Jan", count: 32 },
                          { month: "Feb", count: 40 },
                          { month: "Mar", count: 35 },
                          { month: "Apr", count: 48 },
                          { month: "May", count: 42 },
                          { month: "Jun", count: 51 },
                        ]}
                      >
                        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Buy Volume</CardTitle>
                <CardDescription>Last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">$26,800</div>
                <p className="text-xs text-green-500">+18% from previous period</p>
                <div className="mt-4 h-[150px]">
                  <ChartContainer config={{}}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={transactionSummaryData}>
                        <Bar dataKey="buy" fill="#4ade80" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sell Volume</CardTitle>
                <CardDescription>Last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">$13,400</div>
                <p className="text-xs text-red-500">-5% from previous period</p>
                <div className="mt-4 h-[150px]">
                  <ChartContainer config={{}}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={transactionSummaryData}>
                        <Bar dataKey="sell" fill="#f87171" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <TransactionsPanel fullWidth />
        </TabsContent>
      </Tabs>
    </div>
  )
}
