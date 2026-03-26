"use client"

import { SettingsGeneral } from "@/components/settings-general"
import { SettingsNotifications } from "@/components/settings-notifications"
import { SettingsPreferences } from "@/components/settings-preferences"

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SettingsGeneral />
        <SettingsNotifications />
      </div>

      <SettingsPreferences />
    </div>
  )
}
