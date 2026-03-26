"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

// Mock investment goals
const goals = [
  {
    id: 1,
    name: "Retirement Fund",
    target: 500000,
    current: 125863,
    targetDate: "2040-01-01",
    color: "bg-blue-500",
  },
  {
    id: 2,
    name: "House Down Payment",
    target: 100000,
    current: 78500,
    targetDate: "2025-06-01",
    color: "bg-green-500",
  },
  {
    id: 3,
    name: "Education Fund",
    target: 50000,
    current: 12300,
    targetDate: "2030-09-01",
    color: "bg-purple-500",
  },
]

export function GoalTracker({ fullWidth = false }: { fullWidth?: boolean }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short" }).format(date)
  }

  const calculateProgress = (current: number, target: number) => {
    return (current / target) * 100
  }

  const getTimeRemaining = (targetDate: string) => {
    const now = new Date()
    const target = new Date(targetDate)
    const diffTime = Math.abs(target.getTime() - now.getTime())
    const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365))
    const diffMonths = Math.floor((diffTime % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30))

    if (diffYears > 0) {
      return `${diffYears} year${diffYears > 1 ? "s" : ""} ${diffMonths} month${diffMonths > 1 ? "s" : ""}`
    }
    return `${diffMonths} month${diffMonths > 1 ? "s" : ""}`
  }

  return (
    <Card className={fullWidth ? "col-span-full" : ""}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>Goal Tracker</CardTitle>
          <CardDescription>Track your investment milestones</CardDescription>
        </div>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Goal
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {goals.map((goal) => {
            const progress = calculateProgress(goal.current, goal.target)

            return (
              <div key={goal.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{goal.name}</h4>
                    <div className="text-sm text-muted-foreground">
                      Target: {formatCurrency(goal.target)} by {formatDate(goal.targetDate)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(goal.current)}</div>
                    <div className="text-sm text-muted-foreground">{progress.toFixed(0)}% complete</div>
                  </div>
                </div>
                <Progress value={progress} className="h-2" indicatorClassName={goal.color} />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatCurrency(goal.current)}</span>
                  <span>{formatCurrency(goal.target)}</span>
                </div>
                <div className="text-sm">
                  {progress >= 80 ? (
                    <span className="text-green-500">You're {progress.toFixed(0)}% there!</span>
                  ) : (
                    <span>{getTimeRemaining(goal.targetDate)} remaining</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
