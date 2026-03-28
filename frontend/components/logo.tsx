import React from "react"
import { cn } from "@/lib/utils"

export function MarketValveLogo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      className={cn("w-6 h-6 text-slate-800 dark:text-slate-100", className)}
      fill="none"
    >
      {/* Dark blue/white gear background depending on theme */}
      <g stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
        {/* Outer dashed circle to resemble rotation arrows */}
        <circle cx="50" cy="50" r="42" strokeDasharray="30 20" fill="none" />
        
        {/* Gear teeth/spokes */}
        <path d="M50 8 v20 m0 44 v20 M8 50 h20 m44 0 h20" strokeWidth="8" />
        <path d="M20 20 l14 14 m32 32 l14 14 M20 80 l14 -14 m32 -32 l14 -14" strokeWidth="8" />
        
        {/* Inner solid gear center */}
        <circle cx="50" cy="50" r="18" fill="none" strokeWidth="6" />
        <circle cx="50" cy="50" r="6" fill="currentColor" stroke="none" />
      </g>

      {/* Teal ascending arrow/trend line */}
      <g stroke="#00b08b" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 65 L40 40 L55 55 L85 20" fill="none" />
        <polygon points="85,10 95,20 75,20" fill="#00b08b" stroke="none" transform="rotate(25 85 20)" />
      </g>
      
      {/* Light green inner glow/accent on arrow */}
      <path d="M15 65 L40 40 L55 55 L85 20" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}
