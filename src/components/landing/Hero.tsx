"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
	ArrowRight,
	TrendingUp,
	Shield,
	Zap,
	Star,
	Play,
} from "lucide-react";

export default function Hero() {
	return (
		<section className="relative grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
			{/* Left Column - Content */}
			<div className="relative z-10">
				<Badge className="inline-flex items-center gap-2 mb-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0">
					<span className="relative flex h-2 w-2">
						<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
						<span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
					</span>
					Live Betting Available Now
				</Badge>

				<h1 className="text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
					Smart Betting,{" "}
					<span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
						Real-Time Odds
					</span>
				</h1>

				<p className="mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed">
					Experience the future of sports betting with live odds, instant
					payouts, and advanced analytics. Join thousands of winners on the
					most trusted platform.
				</p>

				<div className="mt-8 flex flex-wrap items-center gap-4">
					<Button size="lg" className="group">
						Start Betting Now
						<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
					</Button>

					<Button variant="outline" size="lg" asChild>
						<Link href="/markets">
							<TrendingUp className="mr-2 h-4 w-4" />
							Explore Markets
						</Link>
					</Button>
				</div>

				{/* Trust Indicators */}
				<div className="mt-12 grid grid-cols-3 gap-6">
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
								<Zap className="h-5 w-5 text-primary" />
							</div>
						</div>
						<div>
							<div className="text-2xl font-bold text-foreground">
								Instant
							</div>
							<div className="text-sm text-muted-foreground">
								Payouts
							</div>
						</div>
					</div>

					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
								<Shield className="h-5 w-5 text-primary" />
							</div>
						</div>
						<div>
							<div className="text-2xl font-bold text-foreground">
								100%
							</div>
							<div className="text-sm text-muted-foreground">
								Secure
							</div>
						</div>
					</div>

					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
								<Star className="h-5 w-5 text-primary" />
							</div>
						</div>
						<div>
							<div className="text-2xl font-bold text-foreground">
								4.9/5
							</div>
							<div className="text-sm text-muted-foreground">
								Rating
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Right Column - Live Betting Card */}
			<div className="relative flex items-center justify-center">
				{/* Gradient Background Blur */}
				<div className="absolute -inset-8 rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent opacity-60 blur-3xl" aria-hidden />

				{/* Main Betting Card */}
				<Card className="relative w-full max-w-md p-6 shadow-2xl bg-card/80 backdrop-blur-xl border-2">
					{/* Card Header */}
					<div className="flex items-center justify-between mb-6">
						<div>
							<Badge variant="secondary" className="mb-2">
								<Play className="h-3 w-3 mr-1" />
								Live Match
							</Badge>
							<div className="text-lg font-bold">
								Manchester United vs Chelsea
							</div>
							<div className="text-sm text-muted-foreground">
								Premier League • 65:32
							</div>
						</div>
						<div className="text-right">
							<div className="text-3xl font-bold text-primary">
								2-1
							</div>
						</div>
					</div>

					{/* Odds Grid */}
					<div className="space-y-3">
						<div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
							Match Winner
						</div>
						<div className="grid grid-cols-3 gap-3">
							<button className="group relative overflow-hidden rounded-lg border-2 border-border hover:border-primary bg-muted/50 p-4 text-center transition-all hover:scale-105">
								<div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
								<div className="relative">
									<div className="text-xs font-medium text-muted-foreground mb-1">
										Home
									</div>
									<div className="text-xl font-bold text-foreground">
										2.15
									</div>
									<div className="mt-1">
										<Badge
											variant="outline"
											className="text-xs"
										>
											<TrendingUp className="h-2.5 w-2.5 mr-1" />
											+0.05
										</Badge>
									</div>
								</div>
							</button>

							<button className="group relative overflow-hidden rounded-lg border-2 border-border hover:border-primary bg-muted/50 p-4 text-center transition-all hover:scale-105">
								<div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
								<div className="relative">
									<div className="text-xs font-medium text-muted-foreground mb-1">
										Draw
									</div>
									<div className="text-xl font-bold text-foreground">
										3.50
									</div>
									<div className="mt-1">
										<Badge
											variant="outline"
											className="text-xs opacity-50"
										>
											—
										</Badge>
									</div>
								</div>
							</button>

							<button className="group relative overflow-hidden rounded-lg border-2 border-border hover:border-primary bg-muted/50 p-4 text-center transition-all hover:scale-105">
								<div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
								<div className="relative">
									<div className="text-xs font-medium text-muted-foreground mb-1">
										Away
									</div>
									<div className="text-xl font-bold text-foreground">
										3.10
									</div>
									<div className="mt-1">
										<Badge
											variant="outline"
											className="text-xs text-destructive"
										>
											<TrendingUp className="h-2.5 w-2.5 mr-1 rotate-180" />
											-0.10
										</Badge>
									</div>
								</div>
							</button>
						</div>
					</div>

					{/* CTA Button */}
					<div className="mt-6 pt-6 border-t">
						<Button className="w-full" size="lg">
							Place Your Bet
							<ArrowRight className="ml-2 h-4 w-4" />
						</Button>
						<p className="text-xs text-center text-muted-foreground mt-3">
							Odds update every second • Instant settlement
						</p>
					</div>
				</Card>

				{/* Floating Stats */}
				<div className="hidden lg:block absolute -bottom-6 -left-6">
					<Card className="p-4 shadow-lg bg-card/90 backdrop-blur">
						<div className="flex items-center gap-3">
							<div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500/10">
								<div className="text-xl">🎯</div>
							</div>
							<div>
								<div className="text-sm font-semibold">
									98.5% Payout
								</div>
								<div className="text-xs text-muted-foreground">
									Industry leading
								</div>
							</div>
						</div>
					</Card>
				</div>
			</div>
		</section>
	);
}
