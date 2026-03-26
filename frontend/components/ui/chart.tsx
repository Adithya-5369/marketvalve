"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ChartConfig {
  [key: string]: {
    label: string
    color: string
    strokeDasharray?: string
  }
}

interface ChartContextValue {
  config: ChartConfig
  id: string
}

const ChartContext = React.createContext<ChartContextValue | null>(null)

function useChartContext() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useChartContext must be used within a ChartContainer")
  }
  return context
}

interface ChartContainerProps {
  config?: ChartConfig
  className?: string
  children: React.ReactNode
}

function ChartContainer({ config = {}, className, children }: ChartContainerProps) {
  const id = React.useId()

  // Add CSS variables for each color
  const style = React.useMemo(() => {
    return Object.entries(config).reduce<Record<string, string>>((acc, [key, value]) => {
      acc[`--color-${key}`] = value.color
      return acc
    }, {})
  }, [config])

  return (
    <ChartContext.Provider value={{ config, id }}>
      <div className={cn("", className)} style={style}>
        {children}
      </div>
    </ChartContext.Provider>
  )
}

interface ChartTooltipProps {
  content?: React.ReactNode
  className?: string
  formatter?: (value: string, name: string) => [string, string]
}

function ChartTooltip({ content, className, formatter, ...props }: ChartTooltipProps) {
  return (
    <div className={cn("", className)} {...props}>
      {content}
    </div>
  )
}

interface ChartTooltipContentProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: string | number
    payload: {
      name: string
    }
    color?: string
  }>
  label?: string
  formatter?: (value: string | number, name: string) => [string, string]
}

function ChartTooltipContent({ active, payload, label, formatter }: ChartTooltipContentProps) {
  const { config } = useChartContext()

  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      <div className="grid gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm text-muted-foreground">{label}</div>
        </div>
        <div className="grid gap-1">
          {payload.map((item, index) => {
            const color = config[item.name]?.color || item.color || "hsl(var(--primary))"
            const formattedValue = formatter
              ? formatter(item.value, item.name)[0]
              : typeof item.value === "number"
                ? item.value.toLocaleString()
                : item.value
            const formattedName = formatter
              ? formatter(item.value, item.name)[1]
              : config[item.name]?.label || item.name

            return (
              <div key={index} className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                <div className="text-xs font-medium text-muted-foreground">{formattedName}</div>
                <div className="ml-auto text-xs font-medium">{formattedValue}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export { ChartContainer, ChartTooltip, ChartTooltipContent, useChartContext }
