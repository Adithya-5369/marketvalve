"use client"

import type React from "react"

import { useId } from "react"
import { cn } from "@/lib/utils"

interface ChartWrapperProps {
  content: React.ComponentType<any>
  className?: string
  title?: string
}

export function ChartWrapper({ content: Chart, className, title }: ChartWrapperProps) {
  const id = useId()

  return (
    <div className={cn("w-full", className)}>
      {title && <span className="sr-only">{title}</span>}
      <Chart id={id} />
    </div>
  )
}
