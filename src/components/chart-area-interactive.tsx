"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

const chartData = [
  { date: "2024-04-01", winnings: 222, losses: 150 },
  { date: "2024-04-02", winnings: 97, losses: 180 },
  { date: "2024-04-03", winnings: 167, losses: 120 },
  { date: "2024-04-04", winnings: 242, losses: 160 },
  { date: "2024-04-05", winnings: 373, losses: 190 },
  { date: "2024-04-06", winnings: 301, losses: 240 },
  { date: "2024-04-07", winnings: 245, losses: 180 },
  { date: "2024-04-08", winnings: 409, losses: 220 },
  { date: "2024-04-09", winnings: 159, losses: 110 },
  { date: "2024-04-10", winnings: 261, losses: 190 },
  { date: "2024-04-11", winnings: 327, losses: 250 },
  { date: "2024-04-12", winnings: 292, losses: 210 },
  { date: "2024-04-13", winnings: 342, losses: 180 },
  { date: "2024-04-14", winnings: 237, losses: 220 },
  { date: "2024-04-15", winnings: 320, losses: 170 },
  { date: "2024-04-16", winnings: 338, losses: 190 },
  { date: "2024-04-17", winnings: 446, losses: 260 },
  { date: "2024-04-18", winnings: 364, losses: 210 },
  { date: "2024-04-19", winnings: 343, losses: 180 },
  { date: "2024-04-20", winnings: 289, losses: 150 },
  { date: "2024-04-21", winnings: 337, losses: 200 },
  { date: "2024-04-22", winnings: 324, losses: 170 },
  { date: "2024-04-23", winnings: 338, losses: 130 },
  { date: "2024-04-24", winnings: 387, losses: 190 },
  { date: "2024-04-25", winnings: 315, losses: 250 },
  { date: "2024-04-26", winnings: 275, losses: 130 },
  { date: "2024-04-27", winnings: 383, losses: 220 },
  { date: "2024-04-28", winnings: 322, losses: 180 },
  { date: "2024-04-29", winnings: 415, losses: 140 },
  { date: "2024-04-30", winnings: 454, losses: 280 },
  { date: "2024-05-01", winnings: 365, losses: 220 },
  { date: "2024-05-02", winnings: 393, losses: 210 },
  { date: "2024-05-03", winnings: 347, losses: 190 },
  { date: "2024-05-04", winnings: 485, losses: 220 },
  { date: "2024-05-05", winnings: 481, losses: 190 },
  { date: "2024-05-06", winnings: 498, losses: 220 },
  { date: "2024-05-07", winnings: 488, losses: 200 },
  { date: "2024-05-08", winnings: 349, losses: 210 },
  { date: "2024-05-09", winnings: 427, losses: 180 },
  { date: "2024-05-10", winnings: 493, losses: 230 },
  { date: "2024-05-11", winnings: 435, losses: 170 },
  { date: "2024-05-12", winnings: 397, losses: 240 },
  { date: "2024-05-13", winnings: 397, losses: 160 },
  { date: "2024-05-14", winnings: 448, losses: 290 },
  { date: "2024-05-15", winnings: 473, losses: 180 },
  { date: "2024-05-16", winnings: 438, losses: 200 },
  { date: "2024-05-17", winnings: 499, losses: 220 },
  { date: "2024-05-18", winnings: 415, losses: 250 },
  { date: "2024-05-19", winnings: 435, losses: 180 },
  { date: "2024-05-20", winnings: 377, losses: 230 },
  // ...existing data...
]

const chartConfig = {
  performance: {
    label: "Performance",
  },
  winnings: {
    label: "Winnings",
    color: "hsl(var(--chart-1))",
  },
  losses: {
    label: "Losses",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function ChartAreaInteractive() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date("2024-05-20")
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  const totalWinnings = filteredData.reduce((acc, curr) => acc + curr.winnings, 0)
  const totalLosses = filteredData.reduce((acc, curr) => acc + curr.losses, 0)
  const netProfit = totalWinnings - totalLosses
  const roi = totalLosses === 0 ? 0 : (netProfit / totalLosses) * 100

  const bestDay = filteredData.reduce(
    (acc, item) => {
      const net = item.winnings - item.losses
      if (net > acc.net) {
        return { date: item.date, net }
      }
      return acc
    },
    { date: filteredData[0]?.date ?? "", net: filteredData[0] ? filteredData[0].winnings - filteredData[0].losses : 0 }
  )

  const formatCurrency = (value: number, options?: Intl.NumberFormatOptions) =>
    value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
      ...options,
    })

  const formatPercent = (value: number) =>
    `${value > 0 ? "+" : ""}${value.toFixed(1)}%`

  const netClass =
    netProfit >= 0
      ? "text-emerald-500 dark:text-emerald-400"
      : "text-red-500 dark:text-red-400"

  return (
    <Card className="@container/card">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <Badge variant="outline" className="border-transparent bg-primary/10 text-primary">
              Live analytics
            </Badge>
            <CardTitle>Betting Performance</CardTitle>
            <CardDescription>
              <span className="hidden @[540px]/card:block">
                Track your winnings vs losses over time
              </span>
              <span className="@[540px]/card:hidden">Performance tracking</span>
            </CardDescription>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${netClass}`}>
              {formatCurrency(netProfit)}
            </div>
            <div className="text-xs text-muted-foreground">Net Profit</div>
          </div>
        </div>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillWinnings" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-winnings)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-winnings)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillLosses" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-losses)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-losses)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="losses"
              type="natural"
              fill="url(#fillLosses)"
              stroke="var(--color-losses)"
              stackId="a"
            />
            <Area
              dataKey="winnings"
              type="natural"
              fill="url(#fillWinnings)"
              stroke="var(--color-winnings)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="grid gap-4 border-t border-border/40 bg-muted/20 px-2 py-4 sm:grid-cols-2 sm:px-6 sm:py-6 lg:grid-cols-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground/80">
            Gross winnings
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {formatCurrency(totalWinnings)}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground/80">
            Gross losses
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {formatCurrency(totalLosses)}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground/80">
            ROI
          </p>
          <p className={`mt-1 text-sm font-semibold ${netClass}`}>
            {formatPercent(roi)}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground/80">
            Best day
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {bestDay.date
              ? `${bestDay.date} • ${formatCurrency(bestDay.net, { maximumFractionDigits: 0 })}`
              : "No data"}
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}
