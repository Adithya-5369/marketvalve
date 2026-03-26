"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowDown, ArrowUp, Download, Filter, Search, SortAsc } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

// Enhanced realistic crypto data
const cryptoData = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    amount: 0.45,
    avgPrice: 42500.25,
    currentPrice: 65432.18,
    value: 29444.48,
    gain: 22931.93,
    gainPercent: 53.96,
    category: "Large Cap",
    marketCap: 1285.4,
    volume24h: 28.5,
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    amount: 3.2,
    avgPrice: 2850.75,
    currentPrice: 3542.65,
    value: 11336.48,
    gain: 2213.28,
    gainPercent: 24.62,
    category: "Large Cap",
    marketCap: 425.8,
    volume24h: 15.2,
  },
  {
    symbol: "SOL",
    name: "Solana",
    amount: 25.0,
    avgPrice: 85.42,
    currentPrice: 142.35,
    value: 3558.75,
    gain: 1423.25,
    gainPercent: 66.65,
    category: "Large Cap",
    marketCap: 62.5,
    volume24h: 4.8,
  },
  {
    symbol: "ADA",
    name: "Cardano",
    amount: 1500.0,
    avgPrice: 0.52,
    currentPrice: 0.45,
    value: 675.0,
    gain: -105.0,
    gainPercent: -13.46,
    category: "Large Cap",
    marketCap: 16.2,
    volume24h: 0.85,
  },
  {
    symbol: "DOT",
    name: "Polkadot",
    amount: 120.0,
    avgPrice: 12.35,
    currentPrice: 7.85,
    value: 942.0,
    gain: -540.0,
    gainPercent: -36.44,
    category: "Mid Cap",
    marketCap: 9.8,
    volume24h: 0.42,
  },
  {
    symbol: "LINK",
    name: "Chainlink",
    amount: 75.0,
    avgPrice: 15.25,
    currentPrice: 18.45,
    value: 1383.75,
    gain: 240.0,
    gainPercent: 20.98,
    category: "Mid Cap",
    marketCap: 10.5,
    volume24h: 0.65,
  },
]

export function CryptoHoldings() {
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

  const formatCrypto = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
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
  const categories = ["all", ...new Set(cryptoData.map((crypto) => crypto.category))]

  const filteredCrypto = cryptoData
    .filter((crypto) => {
      const matchesSearch =
        crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crypto.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = categoryFilter === "all" || crypto.category === categoryFilter
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
  const totalValue = filteredCrypto.reduce((sum, crypto) => sum + crypto.value, 0)
  const totalGain = filteredCrypto.reduce((sum, crypto) => sum + crypto.gain, 0)
  const totalGainPercent = (totalGain / (totalValue - totalGain)) * 100

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>Crypto Holdings</CardTitle>
          <CardDescription>Your cryptocurrency portfolio</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="default" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Add Crypto
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search cryptocurrencies..."
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
                  <TableHead className="w-[80px] cursor-pointer" onClick={() => handleSort("symbol")}>
                    Symbol
                    {sortField === "symbol" &&
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
                  <TableHead className="text-right cursor-pointer" onClick={() => handleSort("amount")}>
                    Amount
                    {sortField === "amount" &&
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
                {filteredCrypto.map((crypto) => (
                  <TableRow key={crypto.symbol} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">{crypto.symbol}</TableCell>
                    <TableCell>{crypto.name}</TableCell>
                    <TableCell className="text-right">{formatCrypto(crypto.amount)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(crypto.currentPrice)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(crypto.value)}</TableCell>
                    <TableCell className={`text-right ${crypto.gain >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {crypto.gain >= 0 ? "+" : ""}
                      {crypto.gainPercent.toFixed(2)}%
                    </TableCell>
                    <TableCell className="text-right hidden md:table-cell">
                      <Badge variant="outline">{crypto.category}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 text-sm text-muted-foreground">
          <span>
            Showing {filteredCrypto.length} of {cryptoData.length} cryptocurrencies
          </span>
          <span>Last updated: 1 minute ago</span>
        </div>
      </CardContent>
    </Card>
  )
}
