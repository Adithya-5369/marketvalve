"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowDown, ArrowUp, Download, Filter, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Bar, BarChart, ResponsiveContainer } from "recharts"

// Mock transaction data
const transactionData = [
  { id: 1, date: "2023-04-15", ticker: "AAPL", type: "buy", shares: 10, price: 165.23, total: 1652.3 },
  { id: 2, date: "2023-04-10", ticker: "MSFT", type: "buy", shares: 5, price: 287.18, total: 1435.9 },
  { id: 3, date: "2023-04-05", ticker: "NVDA", type: "sell", shares: 3, price: 267.4, total: 802.2 },
  { id: 4, date: "2023-03-28", ticker: "GOOGL", type: "buy", shares: 8, price: 123.48, total: 987.84 },
  { id: 5, date: "2023-03-20", ticker: "AMZN", type: "buy", shares: 12, price: 102.3, total: 1227.6 },
  { id: 6, date: "2023-03-15", ticker: "TSLA", type: "sell", shares: 4, price: 180.13, total: 720.52 },
  { id: 7, date: "2023-03-10", ticker: "META", type: "buy", shares: 6, price: 185.25, total: 1111.5 },
  { id: 8, date: "2023-03-05", ticker: "NFLX", type: "buy", shares: 3, price: 375.62, total: 1126.86 },
  { id: 9, date: "2023-03-01", ticker: "PYPL", type: "sell", shares: 10, price: 75.48, total: 754.8 },
  { id: 10, date: "2023-02-25", ticker: "ADBE", type: "buy", shares: 2, price: 458.92, total: 917.84 },
]

// Transaction summary data for chart
const transactionSummaryData = [
  { type: "Buy", count: 7 },
  { type: "Sell", count: 3 },
]

export function TransactionsPanel({ fullWidth = false }: { fullWidth?: boolean }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [transactionType, setTransactionType] = useState("all")
  const [page, setPage] = useState(1)
  const itemsPerPage = 5

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date)
  }

  const filteredTransactions = transactionData.filter((transaction) => {
    const matchesSearch = transaction.ticker.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = transactionType === "all" || transaction.type === transactionType
    return matchesSearch && matchesType
  })

  const paginatedTransactions = filteredTransactions.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)

  return (
    <Card className={fullWidth ? "col-span-full" : ""}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>Transactions</CardTitle>
          <CardDescription>Recent stock trades</CardDescription>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by ticker..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={transactionType} onValueChange={setTransactionType}>
            <SelectTrigger className="w-[130px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="buy">Buy Only</SelectItem>
              <SelectItem value="sell">Sell Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="rounded-lg border p-3">
            <div className="text-sm text-muted-foreground">Total Transactions</div>
            <div className="text-2xl font-bold">{filteredTransactions.length}</div>
            <div className="h-[50px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={transactionSummaryData}>
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-sm text-muted-foreground">Buy Transactions</div>
            <div className="text-2xl font-bold text-green-500">
              {filteredTransactions.filter((t) => t.type === "buy").length}
            </div>
            <div className="h-[50px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{ count: filteredTransactions.filter((t) => t.type === "buy").length }]}>
                  <Bar dataKey="count" fill="#4ade80" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-sm text-muted-foreground">Sell Transactions</div>
            <div className="text-2xl font-bold text-red-500">
              {filteredTransactions.filter((t) => t.type === "sell").length}
            </div>
            <div className="h-[50px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{ count: filteredTransactions.filter((t) => t.type === "sell").length }]}>
                  <Bar dataKey="count" fill="#f87171" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="rounded-md border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Ticker</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Shares</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTransactions.length > 0 ? (
                  paginatedTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{formatDate(transaction.date)}</TableCell>
                      <TableCell className="font-medium">{transaction.ticker}</TableCell>
                      <TableCell>
                        <Badge
                          variant={transaction.type === "buy" ? "default" : "destructive"}
                          className="flex w-16 items-center justify-center"
                        >
                          {transaction.type === "buy" ? (
                            <ArrowDown className="mr-1 h-3 w-3" />
                          ) : (
                            <ArrowUp className="mr-1 h-3 w-3" />
                          )}
                          {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{transaction.shares}</TableCell>
                      <TableCell className="text-right">{formatCurrency(transaction.price)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(transaction.total)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      No transactions found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {filteredTransactions.length > 0 && (
          <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
            <span>
              Showing {Math.min(page * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length}{" "}
              transactions
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
