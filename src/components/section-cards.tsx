import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Activity,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react"

export function SectionCards() {
  const cards = [
    {
      title: "Edge score",
      period: "7d signal",
      value: "3.4x",
      change: "+0.8",
      changeLabel: "vs baseline",
      changeTone: "positive" as const,
      description: "15 high-confidence plays queued by the AI co-pilot.",
      progress: 72,
      tag: "AI assist",
      icon: Sparkles,
    },
    {
      title: "Open positions",
      period: "Live tickets",
      value: "27",
      change: "+9",
      changeLabel: "added in the last 24h",
      changeTone: "positive" as const,
      description: "Covers 5 leagues • Peak exposure on NBA late slate.",
      progress: 54,
      tag: "Risk watch",
      icon: Target,
    },
    {
      title: "Win rate",
      period: "30d",
      value: "68.5%",
      change: "+3.2%",
      changeLabel: "month over month",
      changeTone: "positive" as const,
      description: "147 wins across 215 settled bets this period.",
      progress: 68,
      tag: "Performance",
      icon: Activity,
    },
    {
      title: "Realized profit",
      period: "Year to date",
      value: "$18,720",
      change: "+$4,380",
      changeLabel: "since last month",
      changeTone: "positive" as const,
      description: "Net ROI at 22.4% with variance within target band.",
      progress: 74,
      tag: "Growth",
      icon: Trophy,
    },
  ]

  const toneClasses: Record<"positive" | "negative" | "neutral", string> = {
    positive: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    negative: "bg-red-500/10 text-red-500",
    neutral: "bg-muted text-muted-foreground",
  }

  return (
    <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.title} className="border border-border/50">
            <CardHeader className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardDescription className="uppercase tracking-[0.35em] text-xs text-muted-foreground">
                      {card.period}
                    </CardDescription>
                    <CardTitle className="mt-1 text-xl">
                      {card.title}
                    </CardTitle>
                  </div>
                </div>
                <Badge variant="outline" className="border-transparent bg-muted/40 text-xs text-muted-foreground">
                  {card.tag}
                </Badge>
              </div>
              <div>
                <p className="text-3xl font-bold tabular-nums text-foreground">
                  {card.value}
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 font-semibold ${toneClasses[card.changeTone]}`}>
                    {card.change}
                  </span>
                  <span className="text-muted-foreground">
                    {card.changeLabel}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-1.5 w-full rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${card.progress}%` }}
                />
              </div>
            </CardContent>
            <CardFooter className="text-sm text-muted-foreground">
              {card.description}
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
