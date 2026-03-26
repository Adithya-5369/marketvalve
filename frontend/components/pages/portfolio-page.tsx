"use client"

import { PortfolioOverview } from "@/components/portfolio-overview"
import { SectorAllocation } from "@/components/sector-allocation"
import { PortfolioTrend } from "@/components/portfolio-trend"
import { PortfolioStocks } from "@/components/portfolio-stocks"

export function PortfolioPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Portfolio</h1>
        <p className="text-muted-foreground">Manage and track your investment portfolio.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <PortfolioOverview />
        <div className="md:col-span-1 lg:col-span-2">
          <PortfolioTrend />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SectorAllocation />
        <PortfolioStocks />
      </div>
    </div>
  )
}
