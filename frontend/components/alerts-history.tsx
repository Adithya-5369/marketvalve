"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

// Mock alerts history data
const alertsHistoryData = [
  {
    id: 1,
    date: "2023-04-15T09:32:00",
    ticker: "META",
    type: "price",
    message: "META dropped below $300.00",
    status: "triggered",
  },
  {
    id: 2,
    date: "2023-04-12T14:15:00",
    ticker: "AAPL",
    type: "earnings",
    message: "Apple Q2 earnings report released",
    status: "delivered",
  },
  {
    id: 3,
    date: "2023-04-10T10:45:00",
    ticker: "NVDA",
    type: "news",
    message: "NVIDIA announces new AI chip",
    status: "delivered",
  },
  {
    id: 4,
    date: "2023-04-05T16:20:00",
    ticker: "TSLA",
    type: "price",
    message: "TSLA rose above $240.00",
    status: "triggered",
  },
  {
    id: 5,
    date: "2023-04-01T11:05:00",
    ticker: "MSFT",
    type: "analyst",
    message: "Microsoft receives upgrade to Buy",
    status: "delivered",
  },
]

export function AlertsHistory() {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alert History</CardTitle>
        <CardDescription>Recent alerts and notifications</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Ticker</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alertsHistoryData.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>{formatDate(alert.date)}</TableCell>
                    <TableCell className="font-medium">{alert.ticker}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          alert.type === "price"
                            ? "default"
                            : alert.type === "earnings"
                              ? "secondary"
                              : alert.type === "news"
                                ? "outline"
                                : "destructive"
                        }
                      >
                        {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{alert.message}</TableCell>
                    <TableCell>
                      <Badge variant={alert.status === "triggered" ? "destructive" : "outline"}>
                        {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                      </Badge>
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
