"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SettingsPreferences() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Display Preferences</CardTitle>
        <CardDescription>Customize how information is displayed</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Theme</Label>
          <RadioGroup defaultValue="system" className="flex gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="light" id="theme-light" />
              <Label htmlFor="theme-light">Light</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="dark" id="theme-dark" />
              <Label htmlFor="theme-dark">Dark</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="system" id="theme-system" />
              <Label htmlFor="theme-system">System</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>Default Chart Period</Label>
          <RadioGroup defaultValue="1M" className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1W" id="period-1w" />
              <Label htmlFor="period-1w">1 Week</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1M" id="period-1m" />
              <Label htmlFor="period-1m">1 Month</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="3M" id="period-3m" />
              <Label htmlFor="period-3m">3 Months</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1Y" id="period-1y" />
              <Label htmlFor="period-1y">1 Year</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="chart-type">Default Chart Type</Label>
          <Select defaultValue="line">
            <SelectTrigger id="chart-type">
              <SelectValue placeholder="Select chart type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">Line Chart</SelectItem>
              <SelectItem value="candle">Candlestick Chart</SelectItem>
              <SelectItem value="ohlc">OHLC Chart</SelectItem>
              <SelectItem value="area">Area Chart</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Data Refresh Rate</Label>
          <RadioGroup defaultValue="auto" className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="auto" id="refresh-auto" />
              <Label htmlFor="refresh-auto">Auto</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1min" id="refresh-1min" />
              <Label htmlFor="refresh-1min">1 Minute</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="5min" id="refresh-5min" />
              <Label htmlFor="refresh-5min">5 Minutes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="15min" id="refresh-15min" />
              <Label htmlFor="refresh-15min">15 Minutes</Label>
            </div>
          </RadioGroup>
        </div>

        <Button>Save Preferences</Button>
      </CardContent>
    </Card>
  )
}
