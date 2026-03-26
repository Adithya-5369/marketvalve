"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  Briefcase,
  CreditCard,
  DollarSign,
  Home,
  LineChart,
  PieChart,
  Settings,
  Bell,
  Target,
  Menu,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

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
          title: "ETFs",
          href: "/portfolio/etfs",
        },
        {
          title: "Crypto",
          href: "/portfolio/crypto",
        },
      ],
    },
    {
      title: "Transactions",
      href: "/transactions",
      icon: CreditCard,
    },
    {
      title: "Budget",
      href: "/budget",
      icon: DollarSign,
    },
    {
      title: "Forecast",
      href: "/forecast",
      icon: LineChart,
    },
    {
      title: "Sectors",
      href: "/sectors",
      icon: PieChart,
    },
    {
      title: "Performance",
      href: "/performance",
      icon: BarChart3,
    },
    {
      title: "Watchlist",
      href: "/watchlist",
      icon: Target,
    },
    {
      title: "Alerts",
      href: "/alerts",
      icon: Bell,
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
            <DollarSign className="h-5 w-5 text-primary" />
            <span>Adithya369 Finance</span>
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
        <div className="mt-auto border-t p-4">
          <div className="flex items-center gap-2 text-sm">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="font-medium text-primary">AF</span>
            </div>
            <div>
              <p className="font-medium">Adithya369 Finance</p>
              <p className="text-xs text-muted-foreground">v1.0.0</p>
            </div>
          </div>
        </div>
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
