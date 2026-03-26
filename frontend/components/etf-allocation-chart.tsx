"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock ETF sector allocation data
const etfSectorData = {
  VOO: [
    { name: "Technology", value: 28.5, color: "#8884d8" },
    { name: "Healthcare", value: 15.2, color: "#82ca9d" },
    { name: "Financial", value: 13.8, color: "#ffc658" },
    { name: "Consumer", value: 10.5, color: "#ff8042" },
    { name: "Communication", value: 8.7, color: "#0088fe" },
    { name: "Other", value: 23.3, color: "#00C49F" },
  ],
  VTI: [
    { name: "Technology", value: 25.8, color: "#8884d8" },
    { name: "Healthcare", value: 14.5, color: "#82ca9d" },
    { name: "Financial", value: 12.9, color: "#ffc658" },
    { name: "Consumer", value: 11.2, color: "#ff8042" },
    { name: "Industrials", value: 9.8, color: "#0088fe" },
    { name: "Other", value: 25.8, color: "#00C49F" },
  ],
  QQQ: [
    { name: "Technology", value: 48.5, color: "#8884d8" },
    { name: "Communication", value: 18.2, color: "#82ca9d" },
    { name: "Consumer", value: 15.8, color: "#ffc658" },
    { name: "Healthcare", value: 7.5, color: "#ff8042" },
    { name: "Industrials", value: 5.2, color: "#0088fe" },
    { name: "Other", value: 4.8, color: "#00C49F" },
  ],
}

interface EtfAllocationChartProps {
  fullWidth?: boolean
}

export function EtfAllocationChart({ fullWidth = false }: EtfAllocationChartProps) {
  const [selectedEtf, setSelectedEtf] = useState("VOO")

  const sectorData = etfSectorData[selectedEtf as keyof typeof etfSectorData] || etfSectorData.VOO

  return (
    <Card className={fullWidth ? "col-span-full" : ""}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>Sector Allocation</CardTitle>
          <CardDescription>ETF sector breakdown</CardDescription>
        </div>
        <Select value={selectedEtf} onValueChange={setSelectedEtf}>
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="ETF" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="VOO">VOO</SelectItem>
            <SelectItem value="VTI">VTI</SelectItem>
            <SelectItem value="QQQ">QQQ</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer config={{}}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sectorData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {sectorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid gap-2">
                            <div className="font-medium">{data.name}</div>
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1">
                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: data.color }} />
                                <span className="text-xs text-muted-foreground">Allocation</span>
                              </div>
                              <span className="text-xs font-medium">{data.value}%</span>
                            </div>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
        <div className="mt-2 text-sm text-muted-foreground text-center">
          {selectedEtf === "VOO" && <p>S&P 500 ETF representing 500 largest US companies</p>}
          {selectedEtf === "VTI" && <p>Total Stock Market ETF representing the entire US market</p>}
          {selectedEtf === "QQQ" && <p>Nasdaq-100 ETF with heavy technology weighting</p>}
        </div>
      </CardContent>
    </Card>
  )
}
