import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import {
  AlarmClock,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BellRing,
  CheckCircle2,
  Clock,
  LineChart,
  Plus,
  RefreshCcw,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react"

import data from "./data.json"

export default function Page() {
  const alerts = [
    {
      title: "Exposure spike on EPL live market",
      description: "Your stake on Newcastle vs Spurs reached 72% of the configured limit.",
      time: "2m ago",
      icon: AlertTriangle,
      tone: "warning" as const,
    },
    {
      title: "Instant payout cleared",
      description: "$1,250 from FanDuel is verified and ready to move.",
      time: "9m ago",
      icon: ShieldCheck,
      tone: "success" as const,
    },
    {
      title: "Line movement detected",
      description: "Warriors vs Lakers total shifted -2.5 in the last 10 minutes.",
      time: "18m ago",
      icon: LineChart,
      tone: "info" as const,
    },
  ]

  const marketMovers = [
    {
      matchup: "Warriors vs Lakers",
      league: "NBA",
      change: "+4.1%",
      volume: "$460k traded",
      direction: "up" as const,
    },
    {
      matchup: "Real Madrid vs Barca",
      league: "LaLiga",
      change: "-2.7%",
      volume: "$310k traded",
      direction: "down" as const,
    },
    {
      matchup: "Giants vs Eagles",
      league: "NFL",
      change: "+1.9%",
      volume: "$540k traded",
      direction: "up" as const,
    },
    {
      matchup: "Celtics vs Bulls",
      league: "NBA",
      change: "-1.4%",
      volume: "$205k traded",
      direction: "down" as const,
    },
  ]

  const workflowItems = [
    {
      title: "Rebalance bankroll before late slate",
      description: "Shift 12% from EPL to NBA bankroll to stay within guardrails.",
      due: "Today • 4:30 PM",
    },
    {
      title: "Confirm hedge on Celtics futures",
      description: "Auto-hedge suggests $550 buyback on Eastern Conference.",
      due: "Today • 8:00 PM",
    },
    {
      title: "Review injury report triggers",
      description: "3 alerts waiting for approval in NFL watchlist.",
      due: "Tomorrow • 10:00 AM",
    },
  ]

  const payoutSchedule = [
    {
      label: "Pending payouts",
      amount: "$2,450",
      status: "Clearing in 2h",
    },
    {
      label: "Reserved bankroll",
      amount: "$5,800",
      status: "Locked for futures",
    },
    {
      label: "Tax holdback",
      amount: "$540",
      status: "Auto-adjust monthly",
    },
  ]

  const toneClasses = {
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    info: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
              <section className="grid gap-6 xl:grid-cols-[1.65fr_minmax(0,1fr)]">
                <Card className="relative overflow-hidden border border-border/40 bg-gradient-to-br from-primary/5 via-primary/10 to-background">
                  <div className="pointer-events-none absolute inset-0 bg-grid-white/10 opacity-20" />
                  <CardHeader className="relative pb-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-2">
                        <Badge variant="secondary" className="border-transparent bg-primary/15 text-primary">
                          Account performance
                        </Badge>
                        <CardTitle className="text-3xl font-semibold md:text-4xl">
                          Welcome back, Ayman
                        </CardTitle>
                        <CardDescription>
                          Monitor bankroll health, live exposure, and automation status across every book.
                        </CardDescription>
                      </div>
                      <div className="hidden shrink-0 rounded-3xl border border-primary/20 bg-primary/10 px-5 py-4 text-right backdrop-blur lg:block">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/70 dark:text-primary/60">
                          Net ROI (30d)
                        </p>
                        <p className="mt-1 text-3xl font-bold text-primary">
                          +18.4%
                        </p>
                        <span className="text-xs text-primary/70 dark:text-primary/60">
                          +$4,820 vs last month
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="relative space-y-8">
                    <div className="flex flex-wrap items-center gap-3">
                      <Button size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        New bet ticket
                      </Button>
                      <Button size="sm" variant="outline" className="gap-2">
                        <ArrowUpRight className="h-4 w-4" />
                        Move funds
                      </Button>
                      <Button size="sm" variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
                        <BellRing className="h-4 w-4" />
                        Manage alerts
                      </Button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700 dark:text-emerald-300">
                          Bankroll balance
                        </p>
                        <p className="mt-3 text-2xl font-bold text-foreground">
                          $24,580
                        </p>
                        <div className="mt-2 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
                          <TrendingUp className="h-3.5 w-3.5" />
                          +$1,240 today
                        </div>
                      </div>
                      <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-700 dark:text-blue-300">
                          Max exposure
                        </p>
                        <p className="mt-3 text-2xl font-bold text-foreground">
                          58%
                        </p>
                        <div className="mt-2 flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Within guardrails
                        </div>
                      </div>
                      <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-purple-700 dark:text-purple-300">
                          Automation status
                        </p>
                        <p className="mt-3 text-2xl font-bold text-foreground">
                          12 rules
                        </p>
                        <div className="mt-2 flex items-center gap-2 text-xs text-purple-700 dark:text-purple-300">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          3 pending approvals
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden border border-border/40">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Badge variant="outline" className="border-transparent bg-muted/50 text-muted-foreground">
                          Today&apos;s signals
                        </Badge>
                        <CardTitle className="mt-3 text-xl">
                          Actionable alerts
                        </CardTitle>
                        <CardDescription>
                          High-priority notifications from your risk engine.
                        </CardDescription>
                      </div>
                      <Button size="sm" variant="ghost" className="gap-2">
                        <ArrowRight className="h-4 w-4" />
                        View log
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {alerts.map((alert) => {
                      const Icon = alert.icon
                      return (
                        <div
                          key={alert.title}
                          className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/80 p-4"
                        >
                          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${toneClasses[alert.tone]}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 space-y-1.5 text-sm">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-semibold text-foreground">
                                {alert.title}
                              </p>
                              <Badge variant="outline" className="border-transparent bg-muted/40 text-xs text-muted-foreground">
                                {alert.time}
                              </Badge>
                            </div>
                            <p className="text-xs leading-relaxed text-muted-foreground">
                              {alert.description}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                  <CardFooter className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <AlarmClock className="h-3.5 w-3.5" />
                      Auto-refresh every 30s
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                      <ArrowUpRight className="h-4 w-4" />
                      Prioritize alerts
                    </Button>
                  </CardFooter>
                </Card>
              </section>

              <SectionCards />

              <section className="grid gap-6 xl:grid-cols-[1.6fr_minmax(0,1fr)]">
                <ChartAreaInteractive />

                <Card className="border border-border/50">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Badge variant="secondary" className="border-transparent bg-primary/10 text-primary">
                          Market movers
                        </Badge>
                        <CardTitle className="mt-3 text-xl">
                          Live price pressure
                        </CardTitle>
                        <CardDescription>
                          Identify lines drifting outside your models.
                        </CardDescription>
                      </div>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <RefreshCcw className="h-4 w-4" />
                        Sync
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {marketMovers.map((market) => (
                      <div
                        key={market.matchup}
                        className="flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-muted/30 px-4 py-3"
                      >
                        <div className="space-y-1">
                          <Badge variant="outline" className="border-transparent bg-background/80 text-xs">
                            {market.league}
                          </Badge>
                          <p className="text-sm font-semibold text-foreground">
                            {market.matchup}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {market.volume}
                          </p>
                        </div>
                        <div className={`flex items-center gap-2 text-sm font-semibold ${market.direction === "up" ? "text-emerald-500" : "text-red-500"}`}>
                          {market.direction === "up" ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          {market.change}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                  <CardFooter className="text-xs text-muted-foreground">
                    Watching 12 books • Alerts suppressed during quiet hours
                  </CardFooter>
                </Card>
              </section>

              <section className="grid gap-6 xl:grid-cols-[1.4fr_minmax(0,1fr)]">
                <Card className="border border-border/50">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Badge variant="outline" className="border-transparent bg-muted/40 text-muted-foreground">
                          Workflow
                        </Badge>
                        <CardTitle className="mt-3 text-xl">
                          Strategy board
                        </CardTitle>
                        <CardDescription>
                          Maintain focus on the plays and adjustments that matter today.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {workflowItems.map((item) => (
                      <div
                        key={item.title}
                        className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/80 p-4"
                      >
                        <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div className="flex-1 space-y-1.5">
                          <p className="text-sm font-semibold text-foreground">
                            {item.title}
                          </p>
                          <p className="text-xs leading-relaxed text-muted-foreground">
                            {item.description}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            {item.due}
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" className="gap-2 text-muted-foreground hover:text-primary">
                          <ArrowRight className="h-4 w-4" />
                          Open
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                  <CardFooter className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Avatar className="size-7 bg-primary/10 text-primary">
                        <AvatarFallback>A</AvatarFallback>
                      </Avatar>
                      Shared with trading desk
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add task
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="border border-border/50">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Badge variant="secondary" className="border-transparent bg-primary/10 text-primary">
                          Cashflow
                        </Badge>
                        <CardTitle className="mt-3 text-xl">
                          Payout timeline
                        </CardTitle>
                        <CardDescription>
                          Track clearing times and keep reserves aligned with strategy.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {payoutSchedule.map((item) => (
                      <div
                        key={item.label}
                        className="rounded-2xl border border-border/60 bg-muted/30 p-4"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {item.label}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.status}
                            </p>
                          </div>
                          <div className="text-sm font-semibold text-foreground">
                            {item.amount}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                  <CardFooter className="flex items-center justify-between">
                    <Button size="sm" variant="outline" className="gap-2">
                      <Wallet className="h-4 w-4" />
                      Withdraw funds
                    </Button>
                    <Button size="sm" className="gap-2">
                      <ArrowUpRight className="h-4 w-4" />
                      Open ledger
                    </Button>
                  </CardFooter>
                </Card>
              </section>

              <section>
                <Card className="overflow-hidden border border-border/50">
                  <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <Badge variant="outline" className="border-transparent bg-muted/50 text-muted-foreground">
                        Portfolio
                      </Badge>
                      <CardTitle className="mt-3 text-xl">
                        Betting blueprint
                      </CardTitle>
                      <CardDescription>
                        Reorder, track, and assign ownership across your active strategy documents.
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                      <RefreshCcw className="h-4 w-4" />
                      Sync docs
                    </Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    <DataTable data={data} />
                  </CardContent>
                </Card>
              </section>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
