"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowDown, ArrowUp, Bell, Plus, Search } from "lucide-react"

// Mock watchlist data with realistic stock information
const watchlistData = [
  {
    ticker: "TSLA",
    name: "Tesla, Inc.",
    price: 248.42,
    change: 5.63,
    changePercent: 2.32,
    volume: 28456789,
    marketCap: 788.5,
    pe: 70.2,
    hasAlert: true,
  },
  {
    ticker: "META",
    name: "Meta Platforms, Inc.",
    price: 325.76,
    change: 7.89,
    changePercent: 2.48,
    volume: 15678234,
    marketCap: 835.2,
    pe: 28.4,
    hasAlert: true,
  },
  {
    ticker: "AMD",
    name: "Advanced Micro Devices, Inc.",
    price: 108.24,
    change: -2.35,
    changePercent: -2.13,
    volume: 42567123,
    marketCap: 174.8,
    pe: 98.3,
    hasAlert: false,
  },
  {
    ticker: "DIS",
    name: "The Walt Disney Company",
    price: 89.67,
    change: 0.23,
    changePercent: 0.26,
    volume: 8765432,
    marketCap: 164.2,
    pe: 19.8,
    hasAlert: false,
  },
  {
    ticker: "PYPL",
    name: "PayPal Holdings, Inc.",
    price: 62.38,
    change: -1.42,
    changePercent: -2.23,
    volume: 12345678,
    marketCap: 69.5,
    pe: 17.6,
    hasAlert: true,
  },
  {
    ticker: "INTC",
    name: "Intel Corporation",
    price: 35.24,
    change: -0.87,
    changePercent: -2.41,
    volume: 32456789,
    marketCap: 148.3,
    pe: 10.2,
    hasAlert: false,
  },
]

export function WatchlistStocks() {
  const [searchQuery, setSearchQuery] = useState("")

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatMarketCap = (amount: number) => {
    return `${amount.toFixed(1)}B`
  }

  const formatVolume = (volume: number) => {
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(volume)
  }

  const filteredStocks = watchlistData.filter((stock) => {
    return (
      stock.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>Watchlist</CardTitle>
          <CardDescription>Stocks you're monitoring</CardDescription>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Stock
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search watchlist..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="rounded-md border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Ticker</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Change</TableHead>
                  <TableHead className="text-right">Volume</TableHead>
                  <TableHead className="text-right">Market Cap</TableHead>
                  <TableHead className="text-right">P/E</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStocks.map((stock) => (
                  <TableRow key={stock.ticker}>
                    <TableCell className="font-medium">{stock.ticker}</TableCell>
                    <TableCell>{stock.name}</TableCell>
                    <TableCell className="text-right">{formatCurrency(stock.price)}</TableCell>
                    <TableCell className={`text-right ${stock.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                      <div className="flex items-center justify-end">
                        {stock.change >= 0 ? (
                          <ArrowUp className="h-4 w-4 mr-1" />
                        ) : (
                          <ArrowDown className="h-4 w-4 mr-1" />
                        )}
                        {stock.change >= 0 ? "+" : ""}
                        {stock.changePercent.toFixed(2)}%
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{formatVolume(stock.volume)}</TableCell>
                    <TableCell className="text-right">{formatMarketCap(stock.marketCap)}</TableCell>
                    <TableCell className="text-right">{stock.pe.toFixed(1)}</TableCell>
                    <TableCell>
                      <Button variant={stock.hasAlert ? "default" : "ghost"} size="icon" className="h-8 w-8">
                        <Bell className="h-4 w-4" />
                        <span className="sr-only">Toggle alert</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
