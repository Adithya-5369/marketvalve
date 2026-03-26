"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingDown, TrendingUp } from "lucide-react"

// Mock forecast factors data
const forecastFactors = [
  { name: "Market Trends", impact: "positive", description: "Bullish market conditions expected to continue" },
  { name: "Sector Performance", impact: "positive", description: "Technology sector showing strong growth" },
  { name: "Economic Indicators", impact: "neutral", description: "Stable economic conditions with moderate growth" },
  { name: "Interest Rates", impact: "negative", description: "Expected rate increases may impact growth stocks" },
  { name: "Seasonal Patterns", impact: "positive", description: "Historically strong performance in upcoming months" },
]

export function ForecastFactors() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Forecast Factors</CardTitle>
        <CardDescription>Key factors influencing the forecast</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {forecastFactors.map((factor, index) => (
            <div key={index} className="flex items-start gap-3 p-2 rounded-md hover:bg-muted">
              <div
                className={`mt-0.5 ${
                  factor.impact === "positive"
                    ? "text-green-500"
                    : factor.impact === "negative"
                      ? "text-red-500"
                      : "text-yellow-500"
                }`}
              >
                {factor.impact === "positive" ? (
                  <TrendingUp className="h-5 w-5" />
                ) : factor.impact === "negative" ? (
                  <TrendingDown className="h-5 w-5" />
                ) : (
                  <div className="h-5 w-5 flex items-center justify-center">
                    <div className="h-1 w-3 bg-yellow-500 rounded-full"></div>
                  </div>
                )}
              </div>
              <div>
                <div className="font-medium">{factor.name}</div>
                <div className="text-sm text-muted-foreground">{factor.description}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
