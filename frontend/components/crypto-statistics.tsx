"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ChartContainer } from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"

// Crypto market data
const cryptoMarketData = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    marketCap: "$1.2T",
    volume24h: "$38.5B",
    supply: "19.5M",
    maxSupply: "21M",
    allTimeHigh: "$69,000",
    athDate: "Nov 10, 2021",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    marketCap: "$425.8B",
    volume24h: "$15.2B",
    supply: "120.2M",
    maxSupply: "N/A",
    allTimeHigh: "$4,891",
    athDate: "Nov 16, 2021",
  },
  {
    symbol: "SOL",
    name: "Solana",
    marketCap: "$62.5B",
    volume24h: "$4.8B",
    supply: "439.5M",
    maxSupply: "N/A",
    allTimeHigh: "$260",
    athDate: "Nov 6, 2021",
  },
  {
    symbol: "ADA",
    name: "Cardano",
    marketCap: "$16.2B",
    volume24h: "$850M",
    supply: "36.2B",
    maxSupply: "45B",
    allTimeHigh: "$3.10",
    athDate: "Sep 2, 2021",
  },
]

// Volatility data
const volatilityData = [
  { date: "Jan", BTC: 4.2, ETH: 5.8, SOL: 8.5, ADA: 7.2 },
  { date: "Feb", BTC: 3.8, ETH: 4.9, SOL: 7.8, ADA: 6.5 },
  { date: "Mar", BTC: 5.1, ETH: 6.2, SOL: 9.2, ADA: 7.8 },
  { date: "Apr", BTC: 4.5, ETH: 5.5, SOL: 8.1, ADA: 6.9 },
  { date: "May", BTC: 6.2, ETH: 7.1, SOL: 10.5, ADA: 8.4 },
  { date: "Jun", BTC: 5.5, ETH: 6.8, SOL: 9.8, ADA: 7.5 },
]

export function CryptoStatistics() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Market Metrics</CardTitle>
          <CardDescription>Key statistics for major cryptocurrencies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Crypto</TableHead>
                    <TableHead className="text-right">Market Cap</TableHead>
                    <TableHead className="text-right">24h Volume</TableHead>
                    <TableHead className="text-right">All-Time High</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cryptoMarketData.map((crypto) => (
                    <TableRow key={crypto.symbol} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <div className="font-medium">{crypto.symbol}</div>
                        <div className="text-xs text-muted-foreground">{crypto.name}</div>
                      </TableCell>
                      <TableCell className="text-right">{crypto.marketCap}</TableCell>
                      <TableCell className="text-right">{crypto.volume24h}</TableCell>
                      <TableCell className="text-right">
                        <div>{crypto.allTimeHigh}</div>
                        <div className="text-xs text-muted-foreground">{crypto.athDate}</div>
                      </TableCell>
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

      <Card>
        <CardHeader>
          <CardTitle>Volatility Comparison</CardTitle>
          <CardDescription>30-day volatility index (lower is more stable)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ChartContainer
              config={{
                BTC: {
                  label: "Bitcoin",
                  color: "hsl(var(--primary))",
                },
                ETH: {
                  label: "Ethereum",
                  color: "hsl(var(--chart-2))",
                },
                SOL: {
                  label: "Solana",
                  color: "hsl(var(--chart-3))",
                },
                ADA: {
                  label: "Cardano",
                  color: "hsl(var(--chart-4))",
                },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={volatilityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => `${value}%`} />
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
                                  <span className="text-xs font-medium">{entry.value}%</span>
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
                    dataKey="BTC"
                    name="BTC"
                    stroke="var(--color-BTC)"
                    strokeWidth={2}
                    dot={{ r: 4, strokeWidth: 1 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="ETH"
                    name="ETH"
                    stroke="var(--color-ETH)"
                    strokeWidth={2}
                    dot={{ r: 4, strokeWidth: 1 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="SOL"
                    name="SOL"
                    stroke="var(--color-SOL)"
                    strokeWidth={2}
                    dot={{ r: 4, strokeWidth: 1 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="ADA"
                    name="ADA"
                    stroke="var(--color-ADA)"
                    strokeWidth={2}
                    dot={{ r: 4, strokeWidth: 1 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {["BTC", "ETH", "SOL", "ADA"].map((symbol) => (
              <Badge key={symbol} variant="outline" className="flex items-center gap-1">
                <div
                  className={`h-2 w-2 rounded-full bg-${symbol === "BTC" ? "primary" : `chart-${["ETH", "SOL", "ADA"].indexOf(symbol) + 2}`}`}
                ></div>
                {symbol}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
