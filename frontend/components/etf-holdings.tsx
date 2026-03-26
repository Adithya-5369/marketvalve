"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowDown, ArrowUp, Download, Filter, Search, SortAsc } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

// Enhanced realistic ETF data
const etfsData = [
  {
    ticker: "VOO",
    name: "Vanguard S&P 500 ETF",
    shares: 35,
    avgPrice: 375.42,
    currentPrice: 412.65,
    value: 14442.75,
    gain: 37.23,
    gainPercent: 9.92,
    category: "Large Cap",
    expenseRatio: 0.03,
    dividendYield: 1.42,
  },
  {
    ticker: "VTI",
    name: "Vanguard Total Stock Market ETF",
    shares: 28,
    avgPrice: 210.35,
    currentPrice: 235.78,
    value: 6601.84,
    gain: 25.43,
    gainPercent: 12.09,
    category: "Total Market",
    expenseRatio: 0.03,
    dividendYield: 1.35,
  },
  {
    ticker: "QQQ",
    name: "Invesco QQQ Trust",
    shares: 15,
    avgPrice: 325.68,
    currentPrice: 378.42,
    value: 5676.3,
    gain: 52.74,
    gainPercent: 16.19,
    category: "Technology",
    expenseRatio: 0.2,
    dividendYield: 0.58,
  },
  {
    ticker: "VGT",
    name: "Vanguard Information Technology ETF",
    shares: 12,
    avgPrice: 410.25,
    currentPrice: 465.32,
    value: 5583.84,
    gain: 55.07,
    gainPercent: 13.42,
    category: "Technology",
    expenseRatio: 0.1,
    dividendYield: 0.65,
  },
  {
    ticker: "VYM",
    name: "Vanguard High Dividend Yield ETF",
    shares: 25,
    avgPrice: 105.42,
    currentPrice: 112.35,
    value: 2808.75,
    gain: 6.93,
    gainPercent: 6.57,
    category: "Dividend",
    expenseRatio: 0.06,
    dividendYield: 2.95,
  },
  {
    ticker: "VXUS",
    name: "Vanguard Total International Stock ETF",
    shares: 40,
    avgPrice: 54.25,
    currentPrice: 58.42,
    value: 2336.8,
    gain: 4.17,
    gainPercent: 7.69,
    category: "International",
    expenseRatio: 0.08,
    dividendYield: 3.12,
  },
  {
    ticker: "BND",
    name: "Vanguard Total Bond Market ETF",
    shares: 45,
    avgPrice: 82.15,
    currentPrice: 78.42,
    value: 3528.9,
    gain: -3.73,
    gainPercent: -4.54,
    category: "Bond",
    expenseRatio: 0.03,
    dividendYield: 2.85,
  },
]

export function EtfHoldings() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState("value")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [categoryFilter, setCategoryFilter] = useState("all")

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

  // Get unique categories for filter
  const categories = ["all", ...new Set(etfsData.map((etf) => etf.category))]

  const filteredEtfs = etfsData
    .filter((etf) => {
      const matchesSearch =
        etf.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        etf.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = categoryFilter === "all" || etf.category === categoryFilter
      return matchesSearch && matchesCategory
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
  const totalValue = filteredEtfs.reduce((sum, etf) => sum + etf.value, 0)
  const totalGain = filteredEtfs.reduce((sum, etf) => sum + etf.gain * etf.shares, 0)
  const totalGainPercent = (totalGain / (totalValue - totalGain)) * 100

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>ETF Holdings</CardTitle>
          <CardDescription>Your ETF portfolio</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="default" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Add ETF
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search ETFs..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
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
                  <TableHead className="text-right hidden md:table-cell">Category</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEtfs.map((etf) => (
                  <TableRow key={etf.ticker} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">{etf.ticker}</TableCell>
                    <TableCell>{etf.name}</TableCell>
                    <TableCell className="text-right">{etf.shares}</TableCell>
                    <TableCell className="text-right">{formatCurrency(etf.currentPrice)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(etf.value)}</TableCell>
                    <TableCell className={`text-right ${etf.gain >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {etf.gain >= 0 ? "+" : ""}
                      {etf.gainPercent.toFixed(2)}%
                    </TableCell>
                    <TableCell className="text-right hidden md:table-cell">
                      <Badge variant="outline">{etf.category}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 text-sm text-muted-foreground">
          <span>
            Showing {filteredEtfs.length} of {etfsData.length} ETFs
          </span>
          <span>Last updated: 2 minutes ago</span>
        </div>
      </CardContent>
    </Card>
  )
}
