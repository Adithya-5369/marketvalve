"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

export function BudgetTracker({ fullWidth = false }: { fullWidth?: boolean }) {
  const [date, setDate] = useState<Date>(new Date())
  const [open, setOpen] = useState(false)

  const totalBudget = 2850.0
  const spentAmount = 563.08
  const percentUsed = (spentAmount / totalBudget) * 100
  const isOverBudget = percentUsed > 100

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const handlePreviousMonth = () => {
    const newDate = new Date(date)
    newDate.setMonth(newDate.getMonth() - 1)
    setDate(newDate)
  }

  const handleNextMonth = () => {
    const newDate = new Date(date)
    newDate.setMonth(newDate.getMonth() + 1)
    setDate(newDate)
  }

  // Monthly spending data
  const monthlySpendingData = [
    { category: "Stocks", amount: 425.5 },
    { category: "ETFs", amount: 137.58 },
    { category: "Crypto", amount: 0.0 },
  ]

  return (
    <Card className={fullWidth ? "col-span-full" : ""}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>Budget Status</CardTitle>
          <CardDescription>Monthly investment budget</CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous month</span>
          </Button>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{format(date, "MMMM yyyy")}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={(date) => {
                  if (date) {
                    setDate(date)
                    setOpen(false)
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next month</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{formatCurrency(totalBudget - spentAmount)}</div>
        <div className="text-sm text-muted-foreground">
          {formatCurrency(spentAmount)} of {formatCurrency(totalBudget)} used
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span>{percentUsed.toFixed(1)}% of budget used</span>
            <span className={isOverBudget ? "text-red-500" : "text-green-500"}>
              {isOverBudget ? "Over budget" : "Under budget"}
            </span>
          </div>
          <Progress
            value={percentUsed}
            className={`h-2 ${isOverBudget ? "bg-red-200" : "bg-muted"}`}
            indicatorClassName={isOverBudget ? "bg-red-500" : "bg-green-500"}
          />
        </div>

        <div className="mt-4 h-[150px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlySpendingData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <XAxis dataKey="category" />
              <YAxis hide />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid gap-2">
                          <div className="font-medium">{label}</div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-muted-foreground">Amount</span>
                            <span className="text-xs font-medium">{formatCurrency(payload[0].value as number)}</span>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar dataKey="amount" name="Amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Stocks</span>
            <span>{formatCurrency(425.5)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">ETFs</span>
            <span>{formatCurrency(137.58)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Crypto</span>
            <span>{formatCurrency(0.0)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
