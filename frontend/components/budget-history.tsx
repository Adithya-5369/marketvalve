"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Mock budget history data
const budgetHistoryData = [
  { month: "Jan", budget: 2500, actual: 2100 },
  { month: "Feb", budget: 2500, actual: 2300 },
  { month: "Mar", budget: 2800, actual: 2650 },
  { month: "Apr", budget: 2850, actual: 563 },
  { month: "May", budget: 2850, actual: 0 },
  { month: "Jun", budget: 2850, actual: 0 },
]

export function BudgetHistory() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget History</CardTitle>
        <CardDescription>Monthly budget vs. actual spending</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer
            config={{
              budget: {
                label: "Budget",
                color: "hsl(var(--muted-foreground))",
              },
              actual: {
                label: "Actual",
                color: "hsl(var(--primary))",
              },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetHistoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="budget" name="budget" fill="var(--color-budget)" />
                <Bar dataKey="actual" name="actual" fill="var(--color-actual)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
