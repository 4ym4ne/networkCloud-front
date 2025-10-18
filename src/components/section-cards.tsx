import { IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DollarSign, TrendingUp, Wallet, Target } from "lucide-react"

export function SectionCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-br *:data-[slot=card]:shadow-lg lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-500/10 to-transparent rounded-bl-full" />
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-500/10">
              <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <CardDescription>Total Balance</CardDescription>
          </div>
          <CardTitle className="text-3xl font-bold tabular-nums @[250px]/card:text-4xl">
            $2,458.50
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
              <IconTrendingUp className="text-green-600 dark:text-green-400" />
              +15.2%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Up from last month <IconTrendingUp className="size-4 text-green-600" />
          </div>
          <div className="text-muted-foreground">
            Your available betting funds
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full" />
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/10">
              <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <CardDescription>Active Bets</CardDescription>
          </div>
          <CardTitle className="text-3xl font-bold tabular-nums @[250px]/card:text-4xl">
            23
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <IconTrendingUp className="text-blue-600 dark:text-blue-400" />
              +8 today
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Strong betting activity <IconTrendingUp className="size-4 text-blue-600" />
          </div>
          <div className="text-muted-foreground">
            Total potential return: $3,245
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-transparent rounded-bl-full" />
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-500/10">
              <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <CardDescription>Win Rate</CardDescription>
          </div>
          <CardTitle className="text-3xl font-bold tabular-nums @[250px]/card:text-4xl">
            68.5%
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
              <IconTrendingUp className="text-purple-600 dark:text-purple-400" />
              +3.2%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Above average performance <IconTrendingUp className="size-4 text-purple-600" />
          </div>
          <div className="text-muted-foreground">147 wins out of 215 bets</div>
        </CardFooter>
      </Card>

      <Card className="@container/card relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-500/10 to-transparent rounded-bl-full" />
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-500/10">
              <Wallet className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <CardDescription>Total Profit</CardDescription>
          </div>
          <CardTitle className="text-3xl font-bold tabular-nums @[250px]/card:text-4xl">
            $1,847
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800">
              <IconTrendingUp className="text-orange-600 dark:text-orange-400" />
              +24.8%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Excellent ROI this period <IconTrendingUp className="size-4 text-orange-600" />
          </div>
          <div className="text-muted-foreground">75% return on investment</div>
        </CardFooter>
      </Card>
    </div>
  )
}
