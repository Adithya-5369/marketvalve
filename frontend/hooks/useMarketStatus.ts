"use client"

import { useState, useEffect, useCallback } from "react"
import { API_BASE_URL } from "@/lib/api"

interface MarketStatus {
  isOpen: boolean
  status: string
  reason: string | null
  tradeDate: string | null
  timestamp: string | null
  loading: boolean
}

/**
 * Shared hook that polls /market-status every 60s.
 * Components use `isOpen` to decide whether to run background data polling.
 */
export function useMarketStatus(): MarketStatus {
  const [state, setState] = useState<MarketStatus>({
    isOpen: false,
    status: "Loading",
    reason: null,
    tradeDate: null,
    timestamp: null,
    loading: true,
  })

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/market-status`)
      if (!res.ok) throw new Error("Failed to fetch market status")
      const data = await res.json()
      setState({
        isOpen: !!data.is_open,
        status: data.status ?? "Unknown",
        reason: data.reason ?? null,
        tradeDate: data.trade_date ?? null,
        timestamp: data.timestamp ?? null,
        loading: false,
      })
    } catch (e) {
      console.error("Market status fetch error:", e)
      // On error, fall back to local IST check so UI isn't stuck
      const now = new Date()
      const ist = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }))
      const day = ist.getDay()
      const h = ist.getHours()
      const m = ist.getMinutes()
      const mins = h * 60 + m
      const isWeekend = day === 0 || day === 6
      const isLive = !isWeekend && mins >= 555 && mins <= 930 // 9:15 - 15:30
      setState({
        isOpen: isLive,
        status: isLive ? "Open" : "Closed",
        reason: isWeekend ? "Weekend" : mins < 555 ? "Pre-market" : "After hours",
        tradeDate: null,
        timestamp: null,
        loading: false,
      })
    }
  }, [])

  useEffect(() => {
    fetchStatus()
    const id = setInterval(fetchStatus, 60_000)
    return () => clearInterval(id)
  }, [fetchStatus])

  return state
}
