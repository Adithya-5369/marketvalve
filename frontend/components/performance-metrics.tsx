"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock performance metrics data
const performanceMetrics = {
  "1M": {
    return: 3.2,
    alpha: 0.8,
    beta: 1.1,
    sharpe: 1.2,
    volatility: 12.5,
    maxDrawdown: -5.3,
  },
  "3M": {
    return: 8.7,
    alpha: 1.2,
    beta: 1.05,
    sharpe: 1.4,
    volatility: 11.8,
    maxDrawdown: -7.2,
  },
  "6M": {
    return: 15.3,
    alpha: 2.1,
    beta: 0.95,
    sharpe: 1.6,
    volatility: 10.9,
    maxDrawdown: -8.5,
  },
  "1Y": {
    return: 27.4,
    alpha: 3.5,
    beta: 0.92,
    sharpe: 1.8,
    volatility: 10.2,
    maxDrawdown: -12.3,
  },
}

export function PerformanceMetrics() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Metrics</CardTitle>
        <CardDescription>Key metrics to evaluate portfolio performance</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="1M">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="1M">1M</TabsTrigger>
            <TabsTrigger value="3M">3M</TabsTrigger>
            <TabsTrigger value="6M">6M</TabsTrigger>
            <TabsTrigger value="1Y">1Y</TabsTrigger>
          </TabsList>
          {Object.entries(performanceMetrics).map(([period, metrics]) => (
            <TabsContent key={period} value={period} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Return</div>
                  <div className={`text-xl font-bold ${metrics.return >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {metrics.return >= 0 ? "+" : ""}
                    {metrics.return}%
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Alpha</div>
                  <div className={`text-xl font-bold ${metrics.alpha >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {metrics.alpha >= 0 ? "+" : ""}
                    {metrics.alpha}%
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Beta</div>
                  <div className="text-xl font-bold">{metrics.beta}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Sharpe Ratio</div>
                  <div className="text-xl font-bold">{metrics.sharpe}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Volatility</div>
                  <div className="text-xl font-bold">{metrics.volatility}%</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Max Drawdown</div>
                  <div className="text-xl font-bold text-red-500">{metrics.maxDrawdown}%</div>
                </div>
              </div>
              <div className="pt-2 text-sm text-muted-foreground">
                <p>
                  Your portfolio has {metrics.return >= 0 ? "outperformed" : "underperformed"} the S&P 500 by{" "}
                  {Math.abs(metrics.alpha)}% over the past {period} period.
                </p>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
