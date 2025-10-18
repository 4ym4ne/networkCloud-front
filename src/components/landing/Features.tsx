"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Activity,
    Zap,
    Shield,
    BarChart3,
    Trophy,
    Clock,
    Sparkles,
    ArrowRight
} from "lucide-react";
import Link from "next/link";

export default function Features() {
  const features = [
    {
      icon: Activity,
      title: "Live Odds Tracking",
      description: "Real-time odds updates across all major sports and leagues.",
      details: "Get instant notifications when odds shift in your favor. Never miss a betting opportunity.",
      badge: "Real-time",
      color: "text-blue-500"
    },
    {
      icon: Zap,
      title: "Lightning Payouts",
      description: "Withdraw your winnings instantly to your preferred method.",
      details: "No waiting periods. Your money, available immediately after settlement.",
      badge: "Instant",
      color: "text-yellow-500"
    },
    {
      icon: Shield,
      title: "Bank-Grade Security",
      description: "Military-grade encryption protects your funds and data.",
      details: "Two-factor authentication, cold storage, and insurance protection.",
      badge: "Secure",
      color: "text-green-500"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Data-driven insights to make smarter betting decisions.",
      details: "Historical trends, team statistics, and predictive modeling at your fingertips.",
      badge: "Pro",
      color: "text-purple-500"
    },
    {
      icon: Trophy,
      title: "Best Odds Guaranteed",
      description: "We match or beat competitors' odds on major events.",
      details: "Price boost on selected markets and enhanced accumulator bonuses.",
      badge: "Popular",
      color: "text-orange-500"
    },
    {
      icon: Sparkles,
      title: "Smart Bet Builder",
      description: "AI-powered suggestions for optimized bet combinations.",
      details: "Create custom parlays with intelligent risk-reward analysis.",
      badge: "New",
      color: "text-pink-500"
    }
  ];

  return (
    <section id="features" className="mt-24">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <Badge variant="secondary" className="mb-4">
          <Sparkles className="h-3 w-3 mr-1" />
          Platform Features
        </Badge>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          Everything You Need to Win
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Professional-grade tools and features designed for serious bettors.
          Stay ahead of the game with our cutting-edge platform.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card
              key={index}
              className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl"
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <CardHeader className="relative">
                <div className="flex items-start justify-between mb-3">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>

                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="relative">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.details}
                </p>

                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-4 group/btn"
                  asChild
                >
                  <Link href="/markets">
                    Learn more
                    <ArrowRight className="ml-2 h-3 w-3 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional CTA Section */}
      <div className="mt-16 relative">
        <Card className="relative overflow-hidden border-2 bg-gradient-to-br from-primary/5 via-transparent to-primary/5">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <CardContent className="relative p-8 md:p-12">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                Ready to Start Winning?
              </h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join over 50,000+ active bettors who trust our platform for secure,
                fast, and profitable sports betting experience.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <Button size="lg" className="group">
                  Create Free Account
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/markets">
                    Browse Markets
                  </Link>
                </Button>
              </div>
              <div className="flex items-center justify-center gap-8 pt-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  No credit card required
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  Instant account setup
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
