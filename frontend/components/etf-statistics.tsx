"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ChartContainer } from "@/components/ui/chart"

// ETF stats data
const etfStatsData = [
  {
    ticker: "VOO",
    expenseRatio: 0.03,
    ytdReturn: 12.5,
    oneYrReturn: 18.3,
    threeYrReturn: 45.8,
    fiveYrReturn: 82.1,
    holdingsCount: 508,
    aum: "1.2T",
  },
  {
    ticker: "VTI",
    expenseRatio: 0.03,
    ytdReturn: 11.2,
    oneYrReturn: 16.8,
    threeYrReturn: 42.3,
    fiveYrReturn: 78.5,
    holdingsCount: 3800,
    aum: "1.5T",
  },
  {
    ticker: "QQQ",
    expenseRatio: 0.2,
    ytdReturn: 15.7,
    oneYrReturn: 24.2,
    threeYrReturn: 52.1,
    fiveYrReturn: 120.8,
    holdingsCount: 100,
    aum: "245.8B",
  },
  {
    ticker: "VYM",
    expenseRatio: 0.06,
    ytdReturn: 6.5,
    oneYrReturn: 9.8,
    threeYrReturn: 32.5,
    fiveYrReturn: 58.2,
    holdingsCount: 462,
    aum: "80.2B",
  },
]

// Return comparison data
const returnComparisonData = [
  { name: "YTD", VOO: 12.5, VTI: 11.2, QQQ: 15.7, VYM: 6.5 },
  { name: "1Y", VOO: 18.3, VTI: 16.8, QQQ: 24.2, VYM: 9.8 },
  { name: "3Y", VOO: 45.8, VTI: 42.3, QQQ: 52.1, VYM: 32.5 },
  { name: "5Y", VOO: 82.1, VTI: 78.5, QQQ: 120.8, VYM: 58.2 },
]

export function EtfStatistics() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>ETF Metrics</CardTitle>
          <CardDescription>Key statistics for portfolio ETFs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ETF</TableHead>
                    <TableHead className="text-right">Expense Ratio</TableHead>
                    <TableHead className="text-right">1Y Return</TableHead>
                    <TableHead className="text-right">Holdings</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {etfStatsData.map((etf) => (
                    <TableRow key={etf.ticker} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium">{etf.ticker}</TableCell>
                      <TableCell className="text-right">{etf.expenseRatio}%</TableCell>
                      <TableCell className={`text-right ${etf.oneYrReturn >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {etf.oneYrReturn >= 0 ? "+" : ""}
                        {etf.oneYrReturn}%
                      </TableCell>
                      <TableCell className="text-right">{etf.holdingsCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            <p>Data updated as of today, 9:30 AM ET</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance Comparison</CardTitle>
          <CardDescription>Returns across different timeframes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={returnComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `${value}%`} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="grid gap-2">
                              <div className="font-medium">{label}</div>
                              {payload.map((entry, index) => (
                                <div key={index} className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-1">
                                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                    <span className="text-xs text-muted-foreground">{entry.name}</span>
                                  </div>
                                  <span
                                    className={`text-xs font-medium ${Number(entry.value) >= 0 ? "text-green-500" : "text-red-500"}`}
                                  >
                                    {Number(entry.value) >= 0 ? "+" : ""}
                                    {entry.value}%
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="VOO" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="VTI" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="QQQ" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="VYM" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
