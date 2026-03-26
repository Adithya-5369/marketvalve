"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export function SettingsNotifications() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>Manage how you receive notifications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="price-alerts">Price Alerts</Label>
            <div className="text-sm text-muted-foreground">
              Receive notifications when stocks hit your price targets
            </div>
          </div>
          <Switch id="price-alerts" defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="earnings-reports">Earnings Reports</Label>
            <div className="text-sm text-muted-foreground">
              Get notified about upcoming and released earnings reports
            </div>
          </div>
          <Switch id="earnings-reports" defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="market-news">Market News</Label>
            <div className="text-sm text-muted-foreground">Receive important news about your portfolio stocks</div>
          </div>
          <Switch id="market-news" defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="portfolio-summary">Portfolio Summary</Label>
            <div className="text-sm text-muted-foreground">
              Receive daily or weekly summaries of your portfolio performance
            </div>
          </div>
          <Switch id="portfolio-summary" />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="email-notifications">Email Notifications</Label>
            <div className="text-sm text-muted-foreground">Receive notifications via email</div>
          </div>
          <Switch id="email-notifications" defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="push-notifications">Push Notifications</Label>
            <div className="text-sm text-muted-foreground">Receive notifications on your device</div>
          </div>
          <Switch id="push-notifications" defaultChecked />
        </div>
        <Button>Save Preferences</Button>
      </CardContent>
    </Card>
  )
}
