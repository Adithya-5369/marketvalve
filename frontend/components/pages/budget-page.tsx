"use client"

import { BudgetTracker } from "@/components/budget-tracker"
import { BudgetHistory } from "@/components/budget-history"
import { BudgetCategories } from "@/components/budget-categories"

export function BudgetPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Budget</h1>
        <p className="text-muted-foreground">Track and manage your investment budget.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <BudgetTracker />
        <BudgetCategories />
      </div>

      <BudgetHistory />
    </div>
  )
}
