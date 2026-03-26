"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

// Mock crypto allocation data
const cryptoAllocationData = [
  { name: "Bitcoin (BTC)", value: 45, color: "#F7931A" },
  { name: "Ethereum (ETH)", value: 30, color: "#627EEA" },
  { name: "Solana (SOL)", value: 10, color: "#00FFA3" },
  { name: "Cardano (ADA)", value: 8, color: "#0033AD" },
  { name: "Polkadot (DOT)", value: 5, color: "#E6007A" },
  { name: "Other", value: 2, color: "#8884d8" },
]

// Risk categorization
const riskCategoryData = [
  { name: "High Cap (Lower Risk)", value: 75, color: "#4CAF50" },
  { name: "Mid Cap (Medium Risk)", value: 20, color: "#FF9800" },
  { name: "Low Cap (Higher Risk)", value: 5, color: "#F44336" },
]

interface CryptoAllocationChartProps {
  fullWidth?: boolean
}

export function CryptoAllocationChart({ fullWidth = false }: CryptoAllocationChartProps) {
  return (
    <Card className={fullWidth ? "col-span-full" : ""}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>Portfolio Distribution</CardTitle>
          <CardDescription>Cryptocurrency allocation</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium mb-2 text-center">By Asset</h3>
            <div className="h-[230px]">
              <ChartContainer config={{}}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={cryptoAllocationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {cryptoAllocationData.map((entry, index) => (
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
                    <Legend layout="vertical" verticalAlign="bottom" align="center" />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2 text-center">By Risk Category</h3>
            <div className="h-[230px]">
              <ChartContainer config={{}}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskCategoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {riskCategoryData.map((entry, index) => (
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
                    <Legend layout="vertical" verticalAlign="bottom" align="center" />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
