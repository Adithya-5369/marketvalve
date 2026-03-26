"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Mock forecast trend data
const forecastTrendData = [
  { month: "Jan", actual: 2100, forecast: 2100 },
  { month: "Feb", actual: 2300, forecast: 2300 },
  { month: "Mar", actual: 2650, forecast: 2650 },
  { month: "Apr", actual: 563, forecast: 563 },
  { month: "May", actual: null, forecast: 580 },
  { month: "Jun", actual: null, forecast: 610 },
  { month: "Jul", actual: null, forecast: 590 },
  { month: "Aug", actual: null, forecast: 620 },
  { month: "Sep", actual: null, forecast: 650 },
  { month: "Oct", actual: null, forecast: 680 },
  { month: "Nov", actual: null, forecast: 710 },
  { month: "Dec", actual: null, forecast: 750 },
]

export function ForecastTrend() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Annual Forecast Trend</CardTitle>
        <CardDescription>Projected spending for the year</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer
            config={{
              actual: {
                label: "Actual",
                color: "hsl(var(--primary))",
              },
              forecast: {
                label: "Forecast",
                color: "hsl(var(--muted-foreground))",
                strokeDasharray: "4 4",
              },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastTrendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="actual"
                  name="actual"
                  stroke="var(--color-actual)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  name="forecast"
                  stroke="var(--color-forecast)"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
