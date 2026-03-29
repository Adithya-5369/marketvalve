"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Briefcase,
  CreditCard,
  DollarSign,
  Home,
  LineChart,
  PieChart,
  Settings,
  BellRing,
  Eye,
  Menu,
  X,
  CandlestickChart,
  Radar,
  Newspaper,
  ScanLine,
  MessageSquare,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MarketValveLogo } from "@/components/logo"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Initial check
    checkIfMobile()

    // Add event listener
    window.addEventListener("resize", checkIfMobile)

    // Cleanup
    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  // Close mobile menu when path changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === path
    }
    return pathname?.startsWith(path)
  }

  const isSubActive = (path: string) => {
    return pathname === path
  }

  const mainNavItems = [
    {
      title: "Dashboard",
      href: "/",
      icon: Home,
    },
    {
      title: "MarketValve AI",
      href: "/ai",
      icon: MessageSquare,
    },
    {
      title: "Chart Analysis",
      href: "/chart-analysis",
      icon: CandlestickChart,
    },
    {
      title: "Universe Scanner",
      href: "/scanner",
      icon: ScanLine,
    },
    {
      title: "Opportunity Radar",
      href: "/radar",
      icon: Radar,
    },
    {
      title: "Market Signals",
      href: "/market-signals",
      icon: Newspaper,
    },
    {
      title: "Watchlist",
      href: "/watchlist",
      icon: Eye,
    },
    {
      title: "Price Alerts",
      href: "/price-alerts",
      icon: BellRing,
    },
    {
      title: "Portfolio",
      href: "/portfolio",
      icon: Briefcase,
      subItems: [
        {
          title: "Overview",
          href: "/portfolio",
        },
        {
          title: "Stocks",
          href: "/portfolio/stocks",
        },
        {
          title: "Mutual Funds",
          href: "/portfolio/mutual-funds",
        },
      ],
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ]

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-background transition-transform duration-300 md:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          className,
        )}
      >
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <MarketValveLogo className="h-6 w-6" />
            <span className="text-lg tracking-tight">
              <span className="font-bold">MARKET</span>
              <span className="font-normal">VALVE</span>
            </span>
          </Link>
        </div>
        <ScrollArea className="flex-1 py-2">
          <nav className="grid gap-1 px-2">
            {mainNavItems.map((item, index) => (
              <div key={index}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                    isActive(item.href) && "bg-accent text-accent-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
                {item.subItems && isActive(item.href) && (
                  <div className="ml-6 mt-1 grid gap-1">
                    {item.subItems.map((subItem, subIndex) => (
                      <Link
                        key={subIndex}
                        href={subItem.href}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                          isSubActive(subItem.href) && "bg-accent/50 text-accent-foreground",
                        )}
                      >
                        <span>{subItem.title}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </ScrollArea>
        {/* User Profile Footer */}
        <UserProfileFooter />
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}

function UserProfileFooter() {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { user, logout } = require("@/components/auth-provider").useAuth()
    if (!user) return null
    return (
      <div className="border-t px-3 py-3">
        <div className="flex items-center gap-2">
          {user.photoURL ? (
            <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
              {user.displayName?.[0] || "U"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium truncate">{user.displayName || "User"}</div>
            <div className="text-[10px] text-muted-foreground truncate">{user.email}</div>
          </div>
          <button onClick={logout} className="text-muted-foreground hover:text-destructive p-1.5 rounded-md hover:bg-muted/80 transition-colors" title="Sign out">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  } catch {
    return null
  }
}
