"use client"

import { ForecastSpending } from "@/components/forecast-spending"
import { ForecastTrend } from "@/components/forecast-trend"
import { ForecastFactors } from "@/components/forecast-factors"

export function ForecastPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Forecast</h1>
        <p className="text-muted-foreground">Predict future investment spending and returns.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ForecastSpending />
        <ForecastFactors />
      </div>

      <ForecastTrend />
    </div>
  )
}
