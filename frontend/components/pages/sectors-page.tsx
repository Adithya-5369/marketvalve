"use client"

import { SectorAllocation } from "@/components/sector-allocation"
import { SectorPerformance } from "@/components/sector-performance"
import { SectorRecommendations } from "@/components/sector-recommendations"

export function SectorsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Sector Allocation</h1>
        <p className="text-muted-foreground">Analyze your portfolio distribution across sectors.</p>
      </div>

      <SectorAllocation fullWidth />

      <div className="grid gap-4 md:grid-cols-2">
        <SectorPerformance />
        <SectorRecommendations />
      </div>
    </div>
  )
}
