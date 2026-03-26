"use client"

import { PortfolioTrend } from "@/components/portfolio-trend"
import { PerformanceMetrics } from "@/components/performance-metrics"
import { PerformanceComparison } from "@/components/performance-comparison"

export function PerformancePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Performance</h1>
        <p className="text-muted-foreground">Track the performance of your investments over time.</p>
      </div>

      <PortfolioTrend fullWidth />

      <div className="grid gap-4 md:grid-cols-2">
        <PerformanceMetrics />
        <PerformanceComparison />
      </div>
    </div>
  )
}
