"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Mock sector performance data
const sectorPerformanceData = [
  { name: "Technology", performance: 18.5 },
  { name: "Healthcare", performance: -3.2 },
  { name: "Financial", performance: 12.7 },
  { name: "Consumer", performance: 8.4 },
  { name: "Energy", performance: -5.8 },
]

export function SectorPerformance() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sector Performance</CardTitle>
        <CardDescription>Year-to-date performance by sector</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer
            config={{
              performance: {
                label: "Performance",
                color: "hsl(var(--primary))",
              },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorPerformanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="performance"
                  name="performance"
                  fill="var(--color-performance)"
                  radius={[4, 4, 0, 0]}
                  fillOpacity={0.8}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
