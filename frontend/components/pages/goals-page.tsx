"use client"

import { GoalTracker } from "@/components/goal-tracker"
import { GoalProgress } from "@/components/goal-progress"

export function GoalsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Goals</h1>
        <p className="text-muted-foreground">Track progress towards your financial goals.</p>
      </div>

      <GoalTracker fullWidth />
      <GoalProgress />
    </div>
  )
}
