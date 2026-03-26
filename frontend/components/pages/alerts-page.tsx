"use client"

import { AlertsPanel } from "@/components/alerts-panel"
import { AlertsHistory } from "@/components/alerts-history"

export function AlertsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Alerts</h1>
        <p className="text-muted-foreground">Manage your custom alerts and notifications.</p>
      </div>

      <AlertsPanel fullWidth />
      <AlertsHistory />
    </div>
  )
}
