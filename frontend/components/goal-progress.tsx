"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, ReferenceLine } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Mock goal progress data
const goalProgressData = [
  { month: "Jan", value: 100000 },
  { month: "Feb", value: 105000 },
  { month: "Mar", value: 112000 },
  { month: "Apr", value: 125863 },
  { month: "May", value: null },
  { month: "Jun", value: null },
  { month: "Jul", value: null },
  { month: "Aug", value: null },
  { month: "Sep", value: null },
  { month: "Oct", value: null },
  { month: "Nov", value: null },
  { month: "Dec", value: null },
]

// Target line
const targetValue = 500000

// Projected line
const projectedData = [
  { month: "Jan", value: 100000 },
  { month: "Feb", value: 105000 },
  { month: "Mar", value: 112000 },
  { month: "Apr", value: 125863 },
  { month: "May", value: 135000 },
  { month: "Jun", value: 145000 },
  { month: "Jul", value: 156000 },
  { month: "Aug", value: 168000 },
  { month: "Sep", value: 181000 },
  { month: "Oct", value: 195000 },
  { month: "Nov", value: 210000 },
  { month: "Dec", value: 226000 },
]

export function GoalProgress() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Retirement Fund Progress</CardTitle>
        <CardDescription>Track your progress towards your retirement goal</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer
            config={{
              actual: {
                label: "Actual",
                color: "hsl(var(--primary))",
              },
              projected: {
                label: "Projected",
                color: "hsl(var(--muted-foreground))",
                strokeDasharray: "4 4",
              },
              target: {
                label: "Target",
                color: "hsl(var(--destructive))",
                strokeDasharray: "2 2",
              },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" type="category" allowDuplicatedCategory={false} data={goalProgressData} />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} domain={[0, targetValue * 1.1]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  data={goalProgressData.filter((d) => d.value !== null)}
                  type="monotone"
                  dataKey="value"
                  name="actual"
                  stroke="var(--color-actual)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  data={projectedData}
                  type="monotone"
                  dataKey="value"
                  name="projected"
                  stroke="var(--color-projected)"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                  activeDot={{ r: 6 }}
                />
                <ReferenceLine
                  y={targetValue}
                  stroke="var(--color-target)"
                  strokeDasharray="2 2"
                  label={{
                    value: "Target",
                    position: "right",
                    fill: "var(--color-target)",
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Current</div>
            <div className="text-xl font-bold">{formatCurrency(125863)}</div>
            <div className="text-sm text-muted-foreground">25.2% of goal</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Projected EOY</div>
            <div className="text-xl font-bold">{formatCurrency(226000)}</div>
            <div className="text-sm text-muted-foreground">45.2% of goal</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Target</div>
            <div className="text-xl font-bold">{formatCurrency(500000)}</div>
            <div className="text-sm text-muted-foreground">By 2040</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
