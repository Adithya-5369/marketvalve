"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bell, BellRing, Plus, Trash2, ArrowUp, ArrowDown, RefreshCw } from "lucide-react"
import { useAuth, userKey } from "@/components/auth-provider"
import { saveUserData, loadUserData } from "@/lib/firestore"
import { API_BASE_URL } from "@/lib/api"

interface PriceAlert {
  id: string
  symbol: string
  condition: "above" | "below"
  target: number
  currentPrice?: number
  triggered?: boolean
  createdAt: string
}

export function WatchlistAlerts() {
  const { user } = useAuth()
  const [alerts, setAlerts] = useState<PriceAlert[]>([])
  const [newSymbol, setNewSymbol] = useState("")
  const [newCondition, setNewCondition] = useState<"above" | "below">("above")
  const [newTarget, setNewTarget] = useState("")
  const [checking, setChecking] = useState(false)

  const storageKey = user ? userKey(user.uid, "price_alerts") : "mv_price_alerts"


  useEffect(() => {
    if (!user) return
    loadUserData(user.uid, "price_alerts").then(data => {
      if (data && Array.isArray(data)) setAlerts(data)
    })
  }, [user])

  function saveAlerts(a: PriceAlert[]) {
    setAlerts(a)
    if (user) saveUserData(user.uid, "price_alerts", a)
  }

  function addAlert() {
    const sym = newSymbol.trim().toUpperCase().replace(".NS", "")
    const target = parseFloat(newTarget)
    if (!sym || !target) return
    const alert: PriceAlert = {
      id: Date.now().toString(),
      symbol: sym,
      condition: newCondition,
      target,
      createdAt: new Date().toISOString(),
    }
    saveAlerts([...alerts, alert])
    setNewSymbol(""); setNewTarget("")
  }

  function removeAlert(id: string) {
    saveAlerts(alerts.filter(a => a.id !== id))
  }

  async function checkAlerts() {
    setChecking(true)
    const updated = await Promise.all(
      alerts.map(async (alert) => {
        try {
          const r = await fetch(`${API_BASE_URL}/quote/${alert.symbol}`)
          const d = await r.json()
          if (d.status === "success") {
            const triggered = alert.condition === "above"
              ? d.price >= alert.target
              : d.price <= alert.target
            return { ...alert, currentPrice: d.price, triggered }
          }
          return alert
        } catch { return alert }
      })
    )
    saveAlerts(updated)
    setChecking(false)
  }


  useEffect(() => {
    if (alerts.length > 0 && !alerts[0].currentPrice) checkAlerts()
  }, [alerts.length])

  const triggeredCount = alerts.filter(a => a.triggered).length

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <BellRing className="h-5 w-5 text-primary" /> Price Alerts
          </CardTitle>
          <CardDescription>
            {alerts.length} alerts set • {triggeredCount > 0 && (
              <span className="text-amber-500 font-medium">{triggeredCount} triggered!</span>
            )}
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={checkAlerts} disabled={checking || alerts.length === 0}>
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${checking ? "animate-spin" : ""}`} /> Check Now
        </Button>
      </CardHeader>
      <CardContent>

        <div className="flex items-center gap-2 mb-4 p-3 rounded-lg border border-dashed border-border">
          <Input placeholder="Symbol" className="w-28" value={newSymbol} onChange={e => setNewSymbol(e.target.value)} />
          <select
            className="h-9 rounded-md border border-border bg-background px-3 text-sm"
            value={newCondition} onChange={e => setNewCondition(e.target.value as "above" | "below")}>
            <option value="above">Goes Above</option>
            <option value="below">Goes Below</option>
          </select>
          <Input placeholder="₹ Target" className="w-28" value={newTarget} onChange={e => setNewTarget(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addAlert()} />
          <Button size="sm" onClick={addAlert} disabled={!newSymbol.trim() || !newTarget.trim()}>
            <Plus className="h-4 w-4 mr-1" /> Add Alert
          </Button>
        </div>


        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No price alerts set</p>
            <p className="text-xs mt-1">Add alerts to get notified when stocks hit your targets</p>
          </div>
        ) : (
          <div className="space-y-2">
            {alerts.map((alert) => {
              const pctAway = alert.currentPrice && alert.target
                ? ((alert.target - alert.currentPrice) / alert.currentPrice * 100)
                : null

              return (
                <div key={alert.id} className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  alert.triggered ? "border-amber-500/50 bg-amber-500/5" : "border-border hover:bg-muted/50"
                }`}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{alert.symbol}</span>
                      {alert.triggered && (
                        <Badge className="text-[9px] px-1.5 bg-amber-500 border-0">🔔 TRIGGERED</Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Alert when price goes <span className="font-medium">{alert.condition}</span>{" "}
                      <span className="font-semibold text-foreground">₹{alert.target.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      {alert.currentPrice ? (
                        <>
                          <div className="text-sm font-medium">₹{alert.currentPrice.toLocaleString()}</div>
                          {pctAway !== null && (
                            <div className={`text-[11px] ${Math.abs(pctAway) < 2 ? "text-amber-500" : "text-muted-foreground"}`}>
                              {pctAway > 0 ? `${pctAway.toFixed(1)}% below target` : `${Math.abs(pctAway).toFixed(1)}% above target`}
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">checking...</span>
                      )}
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removeAlert(alert.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
