"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Settings, User, Moon, Sun, Monitor, Shield, LogOut } from "lucide-react"
import { useTheme } from "next-themes"

let useAuth: any = () => ({ user: null, logout: () => {} })
try { useAuth = require("@/components/auth-provider").useAuth } catch {}

export function SettingsPage() {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your MarketValve account and preferences.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Profile</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="" className="w-14 h-14 rounded-full border-2 border-primary/20" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-xl font-bold text-primary">
                  {user?.displayName?.[0] || "U"}
                </div>
              )}
              <div>
                <div className="font-semibold text-lg">{user?.displayName || "User"}</div>
                <div className="text-sm text-muted-foreground">{user?.email || "Not signed in"}</div>
                <Badge variant="outline" className="mt-1 text-[10px]">
                  <Shield className="h-2.5 w-2.5 mr-1" /> Authenticated
                </Badge>
              </div>
            </div>
            <div className="pt-2 border-t border-border">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground text-xs block">User ID</span>
                  <span className="font-mono text-xs">{user?.uid?.slice(0, 12) || "—"}...</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs block">Provider</span>
                  <span className="text-xs">{user?.providerData?.[0]?.providerId === "google.com" ? "Google OAuth" : "Email / Password"}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" /> Appearance</CardTitle>
            <CardDescription>Customize the look of MarketValve</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Theme</label>
              <div className="grid grid-cols-3 gap-2">
                <Button variant={theme === "light" ? "default" : "outline"} size="sm" className="w-full" onClick={() => setTheme("light")}>
                  <Sun className="h-3.5 w-3.5 mr-1.5" /> Light
                </Button>
                <Button variant={theme === "dark" ? "default" : "outline"} size="sm" className="w-full" onClick={() => setTheme("dark")}>
                  <Moon className="h-3.5 w-3.5 mr-1.5" /> Dark
                </Button>
                <Button variant={theme === "system" ? "default" : "outline"} size="sm" className="w-full" onClick={() => setTheme("system")}>
                  <Monitor className="h-3.5 w-3.5 mr-1.5" /> System
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data & Storage */}
      <Card>
        <CardHeader>
          <CardTitle>Data & Storage</CardTitle>
          <CardDescription>Your portfolio data is instantly saved to local cache and seamlessly synced with cloud Firestore.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg border border-border text-center">
              <div className="text-xs text-muted-foreground">Storage</div>
              <div className="text-sm font-semibold mt-1 flex flex-col items-center">
                <span>Firestore Sync</span>
                <span className="text-[9px] text-muted-foreground font-normal">+ Local Cache</span>
              </div>
            </div>
            <div className="p-3 rounded-lg border border-border text-center">
              <div className="text-xs text-muted-foreground">Auth</div>
              <div className="text-sm font-semibold mt-1">Firebase</div>
            </div>
            <div className="p-3 rounded-lg border border-border text-center">
              <div className="text-xs text-muted-foreground">Market Data</div>
              <div className="text-sm font-semibold mt-1">NSE Live</div>
            </div>
            <div className="p-3 rounded-lg border border-border text-center">
              <div className="text-xs text-muted-foreground">MF Data</div>
              <div className="text-sm font-semibold mt-1">MFAPI.in</div>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => {
              if (confirm("Clear all local cached data? This will force a fresh sync from Firestore on your next login.")) {
                const keys = Object.keys(localStorage).filter(k => k.startsWith("mv_"))
                keys.forEach(k => localStorage.removeItem(k))
                window.location.reload()
              }
            }}>
              Clear Local Cache
            </Button>
            <Button variant="destructive" size="sm" onClick={logout}>
              <LogOut className="h-3.5 w-3.5 mr-1.5" /> Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
