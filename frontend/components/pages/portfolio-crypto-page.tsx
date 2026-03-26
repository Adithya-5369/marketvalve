"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CryptoPerformanceChart } from "@/components/crypto-performance-chart"
import { CryptoAllocationChart } from "@/components/crypto-allocation-chart"
import { CryptoHoldings } from "@/components/crypto-holdings"
import { CryptoStatistics } from "@/components/crypto-statistics"

export function PortfolioCryptoPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Crypto Portfolio</h1>
        <p className="text-muted-foreground">Manage and track your cryptocurrency investments.</p>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="allocation">Allocation</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <CryptoPerformanceChart />
            <CryptoAllocationChart />
          </div>
          <CryptoHoldings />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analysis</CardTitle>
              <CardDescription>Detailed cryptocurrency performance metrics over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <CryptoPerformanceChart fullWidth />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allocation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Asset Allocation</CardTitle>
              <CardDescription>Distribution by cryptocurrency type</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <CryptoAllocationChart fullWidth />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-4">
          <CryptoStatistics />
        </TabsContent>
      </Tabs>
    </div>
  )
}
