import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { Quote, Star, ArrowRight } from "lucide-react";

export default function Home() {
  const testimonials = [
    {
      name: "Michael Chen",
      role: "Professional Bettor",
      content: "Best odds and fastest payouts I've experienced. The live betting interface is incredibly smooth.",
      rating: 5,
      avatar: "MC"
    },
    {
      name: "Sarah Williams",
      role: "Sports Analyst",
      content: "The analytics tools are game-changing. I've increased my winning rate by 40% since joining.",
      rating: 5,
      avatar: "SW"
    },
    {
      name: "James Rodriguez",
      role: "Casual Bettor",
      content: "Super easy to use, even for beginners. Customer support is always helpful and responsive.",
      rating: 5,
      avatar: "JR"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
        {/* HERO */}
        <Hero />

        {/* FEATURES */}
        <Features />

        {/* TESTIMONIALS */}
        <section className="mt-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-4">
              <Star className="h-3 w-3 mr-1" />
              Testimonials
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Trusted by Thousands of Bettors
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              See what our community has to say about their winning experience.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="relative overflow-hidden border-2">
                <CardContent className="pt-6">
                  <Quote className="h-8 w-8 text-primary/20 mb-4" />

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    "{testimonial.content}"
                  </p>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 font-semibold text-primary">
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
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* STATS SECTION */}
        <section className="mt-24">
          <Card className="relative overflow-hidden border-2 bg-gradient-to-br from-primary/10 via-transparent to-primary/5">
            <CardContent className="p-8 md:p-12">
              <div className="grid gap-8 md:grid-cols-4 text-center">
                <div className="space-y-2">
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    50K+
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    Active Users
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    $10M+
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    Paid Out
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    98.5%
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    Payout Rate
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    24/7
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    Support
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* FINAL CTA */}
        <section className="mt-24">
          <Card className="relative overflow-hidden border-2 bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground">
            <div className="absolute inset-0 bg-grid-white/10" />
            <CardContent className="relative p-8 md:p-12">
              <div className="max-w-3xl mx-auto text-center space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold">
                  Start Your Winning Journey Today
                </h2>
                <p className="text-lg text-primary-foreground/90">
                  Join the platform that serious bettors trust. Get access to live odds,
                  instant payouts, and expert analytics.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="group"
                  >
                    Create Free Account
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="bg-transparent border-primary-foreground/20 hover:bg-primary-foreground/10 text-primary-foreground"
                    asChild
                  >
                    <Link href="/markets">
                      View Live Markets
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
