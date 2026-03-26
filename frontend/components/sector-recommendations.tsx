"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

// Mock sector recommendations data
const sectorRecommendations = [
  {
    sector: "Technology",
    recommendation: "Overweight",
    reason: "Strong growth potential in AI and cloud computing",
    stocks: ["NVDA", "MSFT", "AAPL"],
  },
  {
    sector: "Healthcare",
    recommendation: "Neutral",
    reason: "Regulatory challenges balanced by aging population demographics",
    stocks: ["JNJ", "PFE", "UNH"],
  },
  {
    sector: "Financial",
    recommendation: "Overweight",
    reason: "Benefiting from higher interest rates and strong consumer spending",
    stocks: ["JPM", "BAC", "V"],
  },
  {
    sector: "Energy",
    recommendation: "Underweight",
    reason: "Transition to renewable energy creating headwinds for traditional energy companies",
    stocks: ["XOM", "CVX"],
  },
]

export function SectorRecommendations() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sector Recommendations</CardTitle>
        <CardDescription>Analyst recommendations for sector allocation</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sectorRecommendations.map((rec, index) => (
            <div key={index} className="p-3 rounded-md border hover:bg-muted">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">{rec.sector}</div>
                <Badge
                  variant={
                    rec.recommendation === "Overweight"
                      ? "default"
                      : rec.recommendation === "Underweight"
                        ? "destructive"
                        : "outline"
                  }
                >
                  {rec.recommendation}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{rec.reason}</p>
              <div className="flex flex-wrap gap-1 mb-2">
                {rec.stocks.map((stock, idx) => (
                  <Badge key={idx} variant="secondary">
                    {stock}
                  </Badge>
                ))}
              </div>
              <Button variant="link" size="sm" className="px-0 h-auto">
                View Analysis <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
