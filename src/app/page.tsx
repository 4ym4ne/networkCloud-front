import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import {
  Quote,
  Star,
  ArrowRight,
  TrendingUp,
  Shield,
  Zap,
  Activity,
  Trophy,
  Sparkles,
  Clock,
  Play,
  Users
} from "lucide-react";

export default function Home() {
  const partners = ["Premier League", "NBA", "LaLiga", "NFL"];
  const metrics = [
    {
      label: "Settled wagers",
      value: "2.3M",
      detail: "Tracked over the last 12 months"
    },
    {
      label: "Avg. payout speed",
      value: "43s",
      detail: "Withdrawals cleared instantly"
    },
    {
      label: "Markets covered",
      value: "120+",
      detail: "Across global leagues"
    }
  ];

  const liveMarkets = [
    {
      label: "Home",
      price: "2.18",
      change: "+0.04",
      direction: "up"
    },
    {
      label: "Draw",
      price: "3.60",
      change: "—",
      direction: "flat"
    },
    {
      label: "Away",
      price: "3.05",
      change: "-0.12",
      direction: "down"
    }
  ] as const;

  const upcomingEdges = [
    {
      match: "Warriors vs Lakers",
      value: "+8.2%",
      time: "Tip-off in 35 mins"
    },
    {
      match: "Real Madrid vs Barca",
      value: "+6.4%",
      time: "Line available now"
    },
    {
      match: "Giants vs Eagles",
      value: "+5.1%",
      time: "Early week movement"
    }
  ];

  const featureCards = [
    {
      icon: TrendingUp,
      badge: "Edge Engine",
      title: "Real-time market intelligence",
      description: "Monitor price swings across every major sportsbook and act on edges before the public reacts.",
      points: ["Smart alerts when steam hits your markets", "Visualize line movement with instant context"]
    },
    {
      icon: Shield,
      badge: "Risk Controls",
      title: "Bankroll guardrails that adapt",
      description: "Automated staking models protect your roll and enforce discipline without slowing you down.",
      points: ["Dynamic Kelly sizing with manual overrides", "Loss limits and cooldowns tuned per league"]
    },
    {
      icon: Zap,
      badge: "Automation",
      title: "Hands-free bet execution",
      description: "Queue, stage, and fire tickets with latency-optimized execution across your connected books.",
      points: ["Live sync with desktop and mobile", "Batch actions for parlays and alternate lines"]
    },
    {
      icon: Activity,
      badge: "Insights",
      title: "Models built around your edge",
      description: "Blend historical performance with live tempo data to surface actionable plays seconds after they emerge.",
      points: ["Opponent pace & matchup volatility tracking", "Simulate outcomes with one click scenarios"]
    },
    {
      icon: Sparkles,
      badge: "AI Co-pilot",
      title: "Strategy suggestions that learn",
      description: "Personalized recommendations sharpened by your own betting history and success rate.",
      points: ["Explains why a play is surfacing in plain language", "Keeps refining based on acceptance feedback"]
    },
    {
      icon: Trophy,
      badge: "Pro Payouts",
      title: "Fast withdrawals, zero friction",
      description: "Cash out instantly with bank-grade encryption and white-glove support backing every transfer.",
      points: ["Track requests in real time from any device", "Escalate with live specialists 24/7"]
    }
  ];

  const workflowSteps = [
    {
      icon: Activity,
      title: "Dial in your strategy",
      description: "Sync bankroll targets, favourite leagues, and exposure limits once. We keep every session aligned.",
      cta: "Set preferences in under 2 minutes"
    },
    {
      icon: Zap,
      title: "Track live opportunities",
      description: "Follow steam moves, injury reports, and price drift on a unified command centre built for rapid action.",
      cta: "See value heatmaps instantly"
    },
    {
      icon: Trophy,
      title: "Lock profits with confidence",
      description: "Trigger automations, hedge positions, and settle payouts in seconds—no spreadsheets required.",
      cta: "Automate cash-outs your way"
    }
  ];

  const testimonials = [
    {
      name: "Michael Chen",
      role: "Sharp Syndicate Lead",
      content: "The live feed is the closest thing to trading sports markets I have ever seen. We caught three steam moves last weekend purely because Terma fired alerts early.",
      rating: 5,
      avatar: "MC"
    },
    {
      name: "Sarah Williams",
      role: "Sports Analyst",
      content: "Having bankroll rules that flex with my models keeps me disciplined. The insights layer makes it obvious when variance, not bad reads, is at play.",
      rating: 5,
      avatar: "SW"
    },
    {
      name: "James Rodriguez",
      role: "Casual Bettor",
      content: "I can stage bets on desktop, confirm on mobile, and cash out without waiting. The workflow feels premium without being complicated.",
      rating: 5,
      avatar: "JR"
    },
    {
      name: "Alex Morgan",
      role: "eSports Trader",
      content: "Odds for emerging markets update as fast as the match. The AI co-pilot explains why lines shift, which keeps the team aligned mid-event.",
      rating: 5,
      avatar: "AM"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl space-y-24 px-6 py-16 lg:py-24">
        <section className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
          <div className="pointer-events-none absolute inset-0 bg-grid-white/10 opacity-40" />
          <div className="relative grid items-start gap-12 p-8 sm:p-12 lg:grid-cols-[1.1fr_minmax(0,1fr)] lg:p-16">
            <div>
              <Badge className="mb-6 border-transparent bg-primary/90 text-primary-foreground shadow-sm">
                Betting Intelligence Platform
              </Badge>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Command your edge in every market
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                Operate with real-time odds, automated staking, and AI-powered insights built to keep serious bettors a beat ahead of the books.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button size="lg" className="group">
                  Start for free
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 bg-white/10 text-primary-foreground backdrop-blur hover:bg-white/20"
                  asChild
                >
                  <Link href="/markets">
                    Watch live markets
                  </Link>
                </Button>
              </div>

              <div className="mt-10 space-y-3 text-muted-foreground">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] opacity-70">
                  Trusted by pros from
                </p>
                <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm font-semibold uppercase tracking-[0.25em]">
                  {partners.map((partner) => (
                    <span key={partner}>{partner}</span>
                  ))}
                </div>
              </div>

              <div className="mt-12 grid gap-6 sm:grid-cols-3">
                {metrics.map((metric) => (
                  <div key={metric.label} className="rounded-2xl border border-white/20 bg-white/5 p-5 backdrop-blur">
                    <div className="text-4xl font-bold text-foreground">{metric.value}</div>
                    <div className="mt-2 text-sm font-semibold text-muted-foreground">{metric.label}</div>
                    <div className="mt-1 text-xs text-muted-foreground opacity-80">
                      {metric.detail}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-10 -z-10 rounded-3xl bg-gradient-to-br from-primary/30 via-primary/10 to-transparent blur-3xl" />
              <Card className="relative w-full max-w-md border border-border/60 bg-background/80 shadow-2xl backdrop-blur">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Badge variant="secondary" className="mb-2 border-transparent bg-emerald-500/15 text-emerald-600">
                        Live
                      </Badge>
                      <CardTitle className="text-xl">
                        Manchester United vs Chelsea
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Premier League • 68′
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-foreground">
                        2 - 1
                      </div>
                      <div className="text-xs text-muted-foreground">
                        HT 1 - 1
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-3 gap-3">
                    {liveMarkets.map((market) => {
                      const badgeClass =
                        market.direction === "up"
                          ? "border-emerald-200 bg-emerald-500/10 text-emerald-600"
                          : market.direction === "down"
                            ? "border-red-200 bg-red-500/10 text-red-600"
                            : "border-border text-muted-foreground";

                      return (
                        <div
                          key={market.label}
                          className="flex flex-col rounded-2xl border border-border/60 bg-muted/30 p-4 transition hover:border-primary/40"
                        >
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{market.label}</span>
                            <Badge variant="outline" className={`text-xs ${badgeClass}`}>
                              {market.direction === "up" && (
                                <TrendingUp className="mr-1 h-3 w-3" />
                              )}
                              {market.direction === "down" && (
                                <TrendingUp className="mr-1 h-3 w-3 rotate-180" />
                              )}
                              {market.change}
                            </Badge>
                          </div>
                          <div className="mt-3 text-2xl font-bold text-foreground">
                            {market.price}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="rounded-2xl border border-dashed border-border/70 p-4">
                    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground opacity-80">
                      <span>Upcoming edges</span>
                      <span>Value</span>
                    </div>
                    <div className="mt-3 space-y-3">
                      {upcomingEdges.map((edge) => (
                        <div key={edge.match} className="flex items-center justify-between gap-2 rounded-xl bg-background/70 px-3 py-2">
                          <div>
                            <div className="text-sm font-medium text-foreground">
                              {edge.match}
                            </div>
                            <div className="text-xs text-muted-foreground opacity-80">
                              {edge.time}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-sm font-semibold text-emerald-500">
                            <TrendingUp className="h-4 w-4" />
                            {edge.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full group" size="lg">
                    Place live bet
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Odds refresh every second</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Play className="h-4 w-4" />
                      <span>Streaming available</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="space-y-10">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4 inline-flex items-center gap-2">
              <Sparkles className="h-3 w-3" />
              Performance Suite
            </Badge>
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">
              Everything you need to stay ahead of the books
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              From automated staking to live market monitoring, Terma centralizes the tools that used to live across spreadsheets, chats, and browser tabs.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featureCards.map((feature) => {
              const Icon = feature.icon;

              return (
                <Card
                  key={feature.title}
                  className="group relative overflow-hidden border border-border/60 bg-background/60 transition hover:border-primary/40 hover:shadow-2xl"
                >
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
                  </div>
                  <CardHeader className="relative">
                    <div className="flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-105">
                        <Icon className="h-6 w-6" />
                      </div>
                      <Badge variant="secondary" className="border-transparent bg-primary/10 text-primary">
                        {feature.badge}
                      </Badge>
                    </div>
                    <CardTitle className="mt-6 text-xl text-foreground group-hover:text-primary">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                      {feature.points.map((point) => (
                        <li key={point} className="flex items-start gap-3">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-background via-primary/10 to-background">
          <div className="pointer-events-none absolute inset-0 bg-grid-white/10 opacity-30" />
          <div className="relative grid gap-12 p-8 sm:p-12 lg:grid-cols-[0.9fr_minmax(0,1fr)]">
            <div className="space-y-6">
              <Badge className="border-transparent bg-primary/15 text-primary">
                Proven Workflow
              </Badge>
              <h2 className="text-3xl font-bold text-foreground md:text-4xl">
                Operate like a trading desk, without the friction
              </h2>
              <p className="text-lg text-muted-foreground">
                Terma streamlines research, execution, and risk management into a single control centre so every bet follows the plan you designed.
              </p>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Users className="h-5 w-5 text-primary" />
                <span>Teams collaborate in real time with role-based access and audit-ready logs.</span>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {workflowSteps.map((step, index) => {
                const Icon = step.icon;

                return (
                  <Card
                    key={step.title}
                    className="flex h-full flex-col border border-border/60 bg-background/70 backdrop-blur transition hover:border-primary/40"
                  >
                    <CardContent className="flex flex-1 flex-col pt-6">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground opacity-70">
                          Step {index + 1}
                        </span>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>
                      <h3 className="mt-6 text-lg font-semibold text-foreground">
                        {step.title}
                      </h3>
                      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                        {step.description}
                      </p>
                      <div className="mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                        <ArrowRight className="h-3 w-3" />
                        {step.cta}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-primary/5 via-background to-background">
          <div className="pointer-events-none absolute inset-0 bg-grid-white/10 opacity-25" />
          <div className="relative grid gap-12 p-8 sm:p-12 lg:grid-cols-[0.85fr_minmax(0,1fr)]">
            <div className="space-y-6">
              <Badge variant="secondary" className="border-transparent bg-primary/10 text-primary">
                Testimonials
              </Badge>
              <h2 className="text-3xl font-bold text-foreground md:text-4xl">
                Loved by bettors at every tier
              </h2>
              <p className="text-lg text-muted-foreground">
                From sharp syndicates to disciplined solo bettors, Terma delivers the edge, structure, and speed that keeps them in the green.
              </p>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                </div>
                <span>4.9 average rating across 18,000+ payouts</span>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {testimonials.map((testimonial) => (
                <Card
                  key={testimonial.name}
                  className="relative h-full border border-border/60 bg-background/70 backdrop-blur transition hover:border-primary/40"
                >
                  <CardContent className="pt-6">
                    <Quote className="h-8 w-8 text-primary/30" />
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                      “{testimonial.content}”
                    </p>
                    <div className="mt-6 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                          {testimonial.avatar}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-foreground">
                            {testimonial.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {testimonial.role}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-500">
                        {Array.from({ length: testimonial.rating }).map((_, index) => (
                          <Star key={index} className="h-4 w-4 fill-current" />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section>
          <Card className="relative overflow-hidden border border-primary/40 bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground">
            <div className="pointer-events-none absolute inset-0 bg-grid-white/20 opacity-20" />
            <CardContent className="relative mx-auto max-w-3xl space-y-6 p-8 text-center sm:p-12">
              <Badge variant="secondary" className="mx-auto w-fit border-white/20 bg-white/10 text-primary-foreground">
                <Sparkles className="mr-2 h-3 w-3" />
                Get started in minutes
              </Badge>
              <h2 className="text-3xl font-bold sm:text-4xl">
                Ready to trade smarter on every line?
              </h2>
              <p className="text-lg text-primary-foreground/80">
                Join Terma today, sync your books, and unlock the workflows the sharpest bettors rely on daily.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button size="lg" variant="secondary" className="group">
                  Create free account
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/40 bg-white/10 text-primary-foreground hover:bg-white/20"
                  asChild
                >
                  <Link href="/login">
                    Log in and sync books
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
}
