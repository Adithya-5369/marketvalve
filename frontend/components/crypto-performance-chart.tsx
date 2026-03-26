"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { AlertCircle, TrendingDown, TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

// Mock crypto performance data with volatility
const cryptoPerformanceData = [
  { date: "Jan", BTC: 42500, ETH: 2850, SOL: 85, ADA: 0.52, DOT: 12.35 },
  { date: "Feb", BTC: 45200, ETH: 3050, SOL: 95, ADA: 0.48, DOT: 11.25 },
  { date: "Mar", BTC: 48500, ETH: 3250, SOL: 105, ADA: 0.45, DOT: 10.15 },
  { date: "Apr", BTC: 52800, ETH: 3350, SOL: 115, ADA: 0.42, DOT: 9.25 },
  { date: "May", BTC: 58500, ETH: 3450, SOL: 125, ADA: 0.44, DOT: 8.45 },
  { date: "Jun", BTC: 65432, ETH: 3543, SOL: 142, ADA: 0.45, DOT: 7.85 },
]

interface CryptoPerformanceChartProps {
  fullWidth?: boolean
}

export function CryptoPerformanceChart({ fullWidth = false }: CryptoPerformanceChartProps) {
  const [selectedCrypto, setSelectedCrypto] = useState("BTC")
  const [period, setPeriod] = useState("6M")
  const [showVolatility, setShowVolatility] = useState(true)

  // Calculate performance metrics
  const startValue = cryptoPerformanceData[0]?.[selectedCrypto as keyof (typeof cryptoPerformanceData)[0]] || 0
  const endValue =
    cryptoPerformanceData[cryptoPerformanceData.length - 1]?.[
      selectedCrypto as keyof (typeof cryptoPerformanceData)[0]
    ] || 0
  const changeValue = endValue - startValue
  const changePercent = (changeValue / startValue) * 100
  const isPositive = changeValue >= 0

  // Format price based on value range
  const formatPrice = (price: number) => {
    if (price < 1) {
      return `$${price.toFixed(4)}`
    } else if (price < 1000) {
      return `$${price.toFixed(2)}`
    } else {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(price)
    }
  }

  // Generate enhanced data with volatility bands
  const enhancedData = cryptoPerformanceData.map((item) => {
    const baseValue = item[selectedCrypto as keyof typeof item] as number
    const volatilityFactor = selectedCrypto === "BTC" ? 0.05 : selectedCrypto === "ETH" ? 0.07 : 0.1

    return {
      date: item.date,
      [selectedCrypto]: baseValue,
      upperBand: baseValue * (1 + volatilityFactor),
      lowerBand: baseValue * (1 - volatilityFactor),
    }
  })

  return (
    <Card className={fullWidth ? "col-span-full" : ""}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>Crypto Performance</CardTitle>
          <CardDescription>Historical price performance</CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Crypto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BTC">BTC</SelectItem>
              <SelectItem value="ETH">ETH</SelectItem>
              <SelectItem value="SOL">SOL</SelectItem>
              <SelectItem value="ADA">ADA</SelectItem>
              <SelectItem value="DOT">DOT</SelectItem>
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
            <div className="text-2xl font-bold">{formatPrice(endValue)}</div>
            <div className={`flex items-center gap-1 text-sm ${isPositive ? "text-green-500" : "text-red-500"}`}>
              {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span>
                {isPositive ? "+" : ""}
                {formatPrice(changeValue)} ({isPositive ? "+" : ""}
                {changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        <div className="h-[300px]">
          <ChartContainer config={{}}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={enhancedData}>
                <defs>
                  <linearGradient id="colorCrypto" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorBand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  domain={["auto", "auto"]}
                  tickFormatter={(value) => formatPrice(value)}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid gap-2">
                            <div className="font-medium">{payload[0].payload.date}</div>
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1">
                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: payload[0].color }} />
                                <span className="text-xs text-muted-foreground">{selectedCrypto}</span>
                              </div>
                              <span className="text-xs font-medium">{formatPrice(payload[0].value as number)}</span>
                            </div>
                            {showVolatility && (
                              <>
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs text-muted-foreground">Volatility Upper</span>
                                  <span className="text-xs font-medium">
                                    {formatPrice(payload[1]?.value as number)}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs text-muted-foreground">Volatility Lower</span>
                                  <span className="text-xs font-medium">
                                    {formatPrice(payload[2]?.value as number)}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                {showVolatility && (
                  <Area
                    type="monotone"
                    dataKey="upperBand"
                    stroke="transparent"
                    fillOpacity={1}
                    fill="url(#colorBand)"
                  />
                )}
                <Area
                  type="monotone"
                  dataKey={selectedCrypto}
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#colorCrypto)"
                />
                {showVolatility && <Area type="monotone" dataKey="lowerBand" stroke="transparent" fillOpacity={0} />}
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowVolatility(!showVolatility)}
          className="gap-1 text-muted-foreground"
        >
          <AlertCircle className={`h-4 w-4 ${showVolatility ? "text-primary" : "opacity-50"}`} />
          Show Volatility Bands
        </Button>
        <div className="text-xs text-muted-foreground">Last updated: 1 minute ago</div>
      </CardFooter>
    </Card>
  )
}
