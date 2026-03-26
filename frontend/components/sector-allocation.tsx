"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip } from "recharts"
import { Button } from "@/components/ui/button"

// Mock sector allocation data
const sectorData = [
  { name: "Technology", value: 45, color: "#8884d8" },
  { name: "Healthcare", value: 15, color: "#82ca9d" },
  { name: "Financial", value: 12, color: "#ffc658" },
  { name: "Consumer", value: 10, color: "#ff8042" },
  { name: "Energy", value: 8, color: "#0088fe" },
  { name: "Other", value: 10, color: "#00C49F" },
]

// Mock stock data by sector
const stocksBySector = {
  Technology: [
    { name: "AAPL", value: 15 },
    { name: "MSFT", value: 12 },
    { name: "NVDA", value: 10 },
    { name: "GOOGL", value: 8 },
  ],
  Healthcare: [
    { name: "JNJ", value: 8 },
    { name: "PFE", value: 4 },
    { name: "UNH", value: 3 },
  ],
  Financial: [
    { name: "JPM", value: 6 },
    { name: "BAC", value: 4 },
    { name: "V", value: 2 },
  ],
  Consumer: [
    { name: "AMZN", value: 7 },
    { name: "WMT", value: 3 },
  ],
  Energy: [
    { name: "XOM", value: 5 },
    { name: "CVX", value: 3 },
  ],
  Other: [{ name: "Other Stocks", value: 10 }],
}

export function SectorAllocation({ fullWidth = false }: { fullWidth?: boolean }) {
  const [selectedSector, setSelectedSector] = useState<string | null>(null)
  const [viewType, setViewType] = useState("pie")

  // Colors for charts
  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe", "#00C49F", "#FFBB28"]

  return (
    <Card className={fullWidth ? "col-span-full" : ""}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>Sector Allocation</CardTitle>
          <CardDescription>Portfolio distribution by sector</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {selectedSector && (
            <Button variant="ghost" size="sm" onClick={() => setSelectedSector(null)}>
              Back to Sectors
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!selectedSector ? (
          <div className="h-[300px]">
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
                  onClick={(data) => setSelectedSector(data.name)}
                  cursor="pointer"
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
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="font-medium text-lg">{selectedSector} Sector</h3>
            <div className="space-y-2">
              {stocksBySector[selectedSector as keyof typeof stocksBySector]?.map((stock, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                  <div className="font-medium">{stock.name}</div>
                  <div className="text-right">
                    <div>{stock.value}%</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="h-[200px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stocksBySector[selectedSector as keyof typeof stocksBySector]?.map((item, index) => ({
                      ...item,
                      color: COLORS[index % COLORS.length],
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {stocksBySector[selectedSector as keyof typeof stocksBySector]?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                                <span className="text-xs text-muted-foreground">Allocation</span>
                                <span className="text-xs font-medium">{data.value}%</span>
                              </div>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
