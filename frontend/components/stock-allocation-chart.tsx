"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, Treemap } from "recharts"

// Mock sector allocation data
const sectorData = [
  { name: "Technology", value: 45, color: "#8884d8" },
  { name: "Healthcare", value: 15, color: "#82ca9d" },
  { name: "Financial", value: 12, color: "#ffc658" },
  { name: "Consumer Discretionary", value: 10, color: "#ff8042" },
  { name: "Communication", value: 8, color: "#0088fe" },
  { name: "Industrials", value: 5, color: "#00C49F" },
  { name: "Other", value: 5, color: "#FFBB28" },
]

// Mock stock allocation data for treemap
const stockAllocationData = [
  {
    name: "Technology",
    children: [
      { name: "AAPL", size: 25, value: 25 },
      { name: "MSFT", size: 20, value: 20 },
      { name: "NVDA", size: 15, value: 15 },
      { name: "GOOGL", size: 10, value: 10 },
    ],
  },
  {
    name: "Healthcare",
    children: [
      { name: "JNJ", size: 8, value: 8 },
      { name: "PFE", size: 4, value: 4 },
      { name: "UNH", size: 3, value: 3 },
    ],
  },
  {
    name: "Financial",
    children: [
      { name: "JPM", size: 6, value: 6 },
      { name: "BAC", size: 4, value: 4 },
      { name: "V", size: 2, value: 2 },
    ],
  },
  {
    name: "Consumer Discretionary",
    children: [
      { name: "AMZN", size: 7, value: 7 },
      { name: "WMT", size: 3, value: 3 },
    ],
  },
  {
    name: "Communication",
    children: [
      { name: "META", size: 5, value: 5 },
      { name: "NFLX", size: 3, value: 3 },
    ],
  },
  {
    name: "Other Sectors",
    children: [{ name: "Other Stocks", size: 5, value: 5 }],
  },
]

interface StockAllocationChartProps {
  fullWidth?: boolean
}

// Custom treemap content for better visualization
const CustomizedContent: React.FC<any> = (props) => {
  const { x, y, width, height, name, depth, index, colors, value } = props

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: depth < 2 ? colors[Math.floor((index / 6) * colors.length)] : "#ffffff",
          stroke: "#fff",
          strokeWidth: 2 / (depth + 1e-10),
          strokeOpacity: 1 / (depth + 1e-10),
        }}
      />
      {width > 50 && height > 30 ? (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={depth < 2 ? "#fff" : "#333"}
          fontSize={depth < 2 ? 14 : 12}
          fontWeight={depth < 2 ? "bold" : "normal"}
        >
          {name}
          {depth < 2 ? "" : ` (${value}%)`}
        </text>
      ) : null}
    </g>
  )
}

export function StockAllocationChart({ fullWidth = false }: StockAllocationChartProps) {
  const [viewType, setViewType] = useState("pie")

  // Colors for treemap
  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe", "#00C49F", "#FFBB28"]

  return (
    <Card className={fullWidth ? "col-span-full" : ""}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>Allocation</CardTitle>
          <CardDescription>Stock portfolio allocation by sector</CardDescription>
        </div>
        <Tabs value={viewType} onValueChange={setViewType}>
          <TabsList className="grid w-[180px] grid-cols-2">
            <TabsTrigger value="pie">Pie Chart</TabsTrigger>
            <TabsTrigger value="treemap">Treemap</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer config={{}}>
            <ResponsiveContainer width="100%" height="100%">
              {viewType === "pie" ? (
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
              ) : (
                <Treemap
                  data={stockAllocationData}
                  dataKey="value"
                  aspectRatio={4 / 3}
                  stroke="#fff"
                  fill="#8884d8"
                  content={<CustomizedContent colors={COLORS} />}
                >
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
                </Treemap>
              )}
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
