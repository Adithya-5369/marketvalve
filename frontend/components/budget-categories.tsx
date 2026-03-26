"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

// Mock budget categories data
const budgetCategories = [
  { name: "Technology Stocks", allocated: 1500, spent: 425.5, color: "bg-blue-500" },
  { name: "Healthcare Stocks", allocated: 600, spent: 137.58, color: "bg-green-500" },
  { name: "Financial Stocks", allocated: 400, spent: 0, color: "bg-yellow-500" },
  { name: "ETFs", allocated: 350, spent: 0, color: "bg-purple-500" },
]

export function BudgetCategories() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Categories</CardTitle>
        <CardDescription>Allocation and spending by category</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {budgetCategories.map((category, index) => {
            const percentSpent = (category.spent / category.allocated) * 100

            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(category.spent)} of {formatCurrency(category.allocated)}
                  </span>
                </div>
                <Progress value={percentSpent} className="h-2" indicatorClassName={category.color} />
                <div className="text-xs text-right text-muted-foreground">{percentSpent.toFixed(1)}% spent</div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
