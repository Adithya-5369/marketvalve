"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowRight, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function PortfolioHealth({ fullWidth = false }: { fullWidth?: boolean }) {
  // Mock portfolio health data
  const diversificationScore = 78
  const riskScore = 65
  const rebalanceScore = 82

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500"
    if (score >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getRiskLevel = (score: number) => {
    if (score >= 80) return "Low"
    if (score >= 60) return "Moderate"
    return "High"
  }

  const getRebalanceStatus = (score: number) => {
    if (score >= 80) return "Balanced"
    if (score >= 60) return "Minor Adjustments Needed"
    return "Rebalancing Recommended"
  }

  return (
    <Card className={fullWidth ? "col-span-full" : ""}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>Portfolio Health</CardTitle>
          <CardDescription>Diversification and risk metrics</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                <span className="font-medium">Diversification Index</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5 ml-1">
                        <Info className="h-3 w-3" />
                        <span className="sr-only">Info</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Measures how well your investments are spread across different assets</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span className="font-bold">{diversificationScore}/100</span>
            </div>
            <Progress
              value={diversificationScore}
              className="h-2"
              indicatorClassName={getScoreColor(diversificationScore)}
            />
            <div className="mt-1 text-sm text-muted-foreground">
              Your portfolio has good diversification across sectors.
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                <span className="font-medium">Risk Profile</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5 ml-1">
                        <Info className="h-3 w-3" />
                        <span className="sr-only">Info</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Evaluates the overall risk level of your portfolio</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span className="font-bold">{getRiskLevel(riskScore)}</span>
            </div>
            <Progress value={riskScore} className="h-2" indicatorClassName={getScoreColor(riskScore)} />
            <div className="mt-1 text-sm text-muted-foreground">Your portfolio has a moderate risk level.</div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                <span className="font-medium">Rebalancing Status</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5 ml-1">
                        <Info className="h-3 w-3" />
                        <span className="sr-only">Info</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Indicates if your portfolio needs rebalancing to maintain target allocations</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span className="font-bold">{getRebalanceStatus(rebalanceScore)}</span>
            </div>
            <Progress value={rebalanceScore} className="h-2" indicatorClassName={getScoreColor(rebalanceScore)} />
          </div>

          <div className="rounded-md border p-3 mt-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Rebalancing Suggestion</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Consider reducing your technology exposure by 5% and increasing healthcare allocation to improve
                  diversification.
                </p>
                <Button variant="link" size="sm" className="px-0 h-auto mt-1">
                  View Detailed Recommendations <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
