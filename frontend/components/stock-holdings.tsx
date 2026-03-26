"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowDown, ArrowUp, Download, Filter, Search, SortAsc } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

// Enhanced realistic stock data with more details
const stocksData = [
  {
    ticker: "AAPL",
    name: "Apple Inc.",
    shares: 25,
    avgPrice: 165.23,
    currentPrice: 187.68,
    value: 4692.0,
    gain: 22.45,
    gainPercent: 13.59,
    sector: "Technology",
    lastUpdated: "2 mins ago",
    dividendYield: 0.51,
  },
  {
    ticker: "MSFT",
    name: "Microsoft Corp.",
    shares: 15,
    avgPrice: 287.18,
    currentPrice: 326.94,
    value: 4904.1,
    gain: 39.76,
    gainPercent: 13.85,
    sector: "Technology",
    lastUpdated: "2 mins ago",
    dividendYield: 0.82,
  },
  {
    ticker: "AMZN",
    name: "Amazon.com Inc.",
    shares: 12,
    avgPrice: 102.3,
    currentPrice: 129.12,
    value: 1549.44,
    gain: 26.82,
    gainPercent: 26.22,
    sector: "Consumer Discretionary",
    lastUpdated: "2 mins ago",
    dividendYield: 0,
  },
  {
    ticker: "GOOGL",
    name: "Alphabet Inc.",
    shares: 8,
    avgPrice: 123.48,
    currentPrice: 142.65,
    value: 1141.2,
    gain: 19.17,
    gainPercent: 15.53,
    sector: "Communication Services",
    lastUpdated: "2 mins ago",
    dividendYield: 0,
  },
  {
    ticker: "NVDA",
    name: "NVIDIA Corp.",
    shares: 20,
    avgPrice: 267.4,
    currentPrice: 435.2,
    value: 8704.0,
    gain: 167.8,
    gainPercent: 62.75,
    sector: "Technology",
    lastUpdated: "2 mins ago",
    dividendYield: 0.05,
  },
  {
    ticker: "JNJ",
    name: "Johnson & Johnson",
    shares: 10,
    avgPrice: 165.5,
    currentPrice: 152.64,
    value: 1526.4,
    gain: -12.86,
    gainPercent: -7.77,
    sector: "Healthcare",
    lastUpdated: "2 mins ago",
    dividendYield: 3.12,
  },
  {
    ticker: "JPM",
    name: "JPMorgan Chase",
    shares: 12,
    avgPrice: 145.25,
    currentPrice: 169.78,
    value: 2037.36,
    gain: 24.53,
    gainPercent: 16.89,
    sector: "Financial",
    lastUpdated: "2 mins ago",
    dividendYield: 2.45,
  },
]

export function StockHoldings() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState("value")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [sectorFilter, setSectorFilter] = useState("all")

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  // Get unique sectors for filter
  const sectors = ["all", ...new Set(stocksData.map((stock) => stock.sector))]

  const filteredStocks = stocksData
    .filter((stock) => {
      const matchesSearch =
        stock.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesSector = sectorFilter === "all" || stock.sector === sectorFilter
      return matchesSearch && matchesSector
    })
    .sort((a, b) => {
      const fieldA = a[sortField as keyof typeof a]
      const fieldB = b[sortField as keyof typeof b]

      if (typeof fieldA === "string" && typeof fieldB === "string") {
        return sortDirection === "asc" ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA)
      } else {
        return sortDirection === "asc"
          ? (fieldA as number) - (fieldB as number)
          : (fieldB as number) - (fieldA as number)
      }
    })

  // Calculate totals
  const totalValue = filteredStocks.reduce((sum, stock) => sum + stock.value, 0)
  const totalGain = filteredStocks.reduce((sum, stock) => sum + stock.gain * stock.shares, 0)
  const totalGainPercent = (totalGain / (totalValue - totalGain)) * 100

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>Stock Holdings</CardTitle>
          <CardDescription>Your current stock portfolio</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="default" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Add Stock
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search stocks..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={sectorFilter} onValueChange={setSectorFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by sector" />
            </SelectTrigger>
            <SelectContent>
              {sectors.map((sector) => (
                <SelectItem key={sector} value={sector}>
                  {sector === "all" ? "All Sectors" : sector}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-1 hidden sm:flex">
            <SortAsc className="h-4 w-4" />
            Sort
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="rounded-lg border p-3">
            <div className="text-sm text-muted-foreground">Total Value</div>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-sm text-muted-foreground">Total Gain/Loss</div>
            <div className={`text-2xl font-bold ${totalGain >= 0 ? "text-green-500" : "text-red-500"}`}>
              {totalGain >= 0 ? "+" : ""}
              {formatCurrency(totalGain)}
            </div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-sm text-muted-foreground">Return</div>
            <div className={`text-2xl font-bold ${totalGainPercent >= 0 ? "text-green-500" : "text-red-500"}`}>
              {totalGainPercent >= 0 ? "+" : ""}
              {totalGainPercent.toFixed(2)}%
            </div>
          </div>
        </div>

        <div className="rounded-md border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px] cursor-pointer" onClick={() => handleSort("ticker")}>
                    Ticker
                    {sortField === "ticker" &&
                      (sortDirection === "asc" ? (
                        <ArrowUp className="inline ml-1 h-4 w-4" />
                      ) : (
                        <ArrowDown className="inline ml-1 h-4 w-4" />
                      ))}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                    Name
                    {sortField === "name" &&
                      (sortDirection === "asc" ? (
                        <ArrowUp className="inline ml-1 h-4 w-4" />
                      ) : (
                        <ArrowDown className="inline ml-1 h-4 w-4" />
                      ))}
                  </TableHead>
                  <TableHead className="text-right cursor-pointer" onClick={() => handleSort("shares")}>
                    Shares
                    {sortField === "shares" &&
                      (sortDirection === "asc" ? (
                        <ArrowUp className="inline ml-1 h-4 w-4" />
                      ) : (
                        <ArrowDown className="inline ml-1 h-4 w-4" />
                      ))}
                  </TableHead>
                  <TableHead className="text-right cursor-pointer" onClick={() => handleSort("currentPrice")}>
                    Price
                    {sortField === "currentPrice" &&
                      (sortDirection === "asc" ? (
                        <ArrowUp className="inline ml-1 h-4 w-4" />
                      ) : (
                        <ArrowDown className="inline ml-1 h-4 w-4" />
                      ))}
                  </TableHead>
                  <TableHead className="text-right cursor-pointer" onClick={() => handleSort("value")}>
                    Value
                    {sortField === "value" &&
                      (sortDirection === "asc" ? (
                        <ArrowUp className="inline ml-1 h-4 w-4" />
                      ) : (
                        <ArrowDown className="inline ml-1 h-4 w-4" />
                      ))}
                  </TableHead>
                  <TableHead className="text-right cursor-pointer" onClick={() => handleSort("gainPercent")}>
                    Gain/Loss
                    {sortField === "gainPercent" &&
                      (sortDirection === "asc" ? (
                        <ArrowUp className="inline ml-1 h-4 w-4" />
                      ) : (
                        <ArrowDown className="inline ml-1 h-4 w-4" />
                      ))}
                  </TableHead>
                  <TableHead className="text-right hidden md:table-cell">Sector</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStocks.map((stock) => (
                  <TableRow key={stock.ticker} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">{stock.ticker}</TableCell>
                    <TableCell>{stock.name}</TableCell>
                    <TableCell className="text-right">{stock.shares}</TableCell>
                    <TableCell className="text-right">{formatCurrency(stock.currentPrice)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(stock.value)}</TableCell>
                    <TableCell className={`text-right ${stock.gain >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {stock.gain >= 0 ? "+" : ""}
                      {stock.gainPercent.toFixed(2)}%
                    </TableCell>
                    <TableCell className="text-right hidden md:table-cell">
                      <Badge variant="outline">{stock.sector}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 text-sm text-muted-foreground">
          <span>
            Showing {filteredStocks.length} of {stocksData.length} stocks
          </span>
          <span>Last updated: 2 minutes ago</span>
        </div>
      </CardContent>
    </Card>
  )
}
