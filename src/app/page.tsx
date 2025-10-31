'use client';

import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  CheckCircle2,
  FileText,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";

import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/features/auth/client";

const featureCards = [
  {
    title: "Upload packet captures",
    description:
      "Drag and drop .pcap files up to 50 MB directly in the browser. Larger traces can be chunked with the Network Cloud CLI.",
    icon: UploadCloud,
    footnote: "Client-side validation keeps uploads predictable.",
  },
  {
    title: "Review analysis history",
    description:
      "Every capture is processed into a searchable record with verdicts, metadata, and downloadable evidence for your team.",
    icon: FileText,
    footnote: "History preserves retention policies per workspace.",
  },
  {
    title: "Stay notified",
    description:
      "Notifications raise new findings in real time so analysts can triage without polling. Mark items read when the review is complete.",
    icon: BellRing,
    footnote: "Supports browser stream updates and manual refresh.",
  },
] as const;

const workflow = [
  {
    title: "1 · Upload",
    detail:
      "Select a PCAP or start a CLI transfer. Integrity and size checks run as soon as the file is queued.",
  },
  {
    title: "2 · Analyze",
    detail:
      "Network Cloud decodes flows, extracts artifacts, and generates a structured report in the analysis history view.",
  },
  {
    title: "3 · Monitor",
    detail:
      "Notification streams highlight new verdicts and status changes so operations teams can respond quickly.",
  },
] as const;

export default function Home() {
  const { user } = useSession();
  const isAuthenticated = Boolean(user);
  const primaryCtaLabel = isAuthenticated ? "Open dashboard" : "Log in";
  const primaryCtaHref = isAuthenticated ? "/dashboard" : "/login";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto flex max-w-5xl flex-col gap-16 px-6 py-12 lg:py-16">
        <section className="rounded-3xl border border-border/50 bg-gradient-to-br from-primary/10 via-background to-background p-8 sm:p-12">
          <div className="space-y-6">
            <Badge className="border-transparent bg-primary text-primary-foreground">
              Packet analysis workspace
            </Badge>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                Upload captures. Review verdicts. Stay coordinated.
              </h1>
              <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
                Network Cloud gives security teams a single place to deliver packet captures, inspect automated analysis, and follow notifications without juggling multiple tools.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="gap-2">
                <Link href={primaryCtaHref}>
                  {primaryCtaLabel}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/dashboard/pcap-upload">Explore uploader</Link>
              </Button>
            </div>
          </div>

          <Card className="mt-10 border border-primary/30 bg-background/80 shadow-sm backdrop-blur">
            <CardHeader className="space-y-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
                Built for hands-on packet investigations
              </CardTitle>
              <CardDescription>
                The same workflow handles ingest, analysis history, and notification follow-up for your team.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              {workflow.map((step) => (
                <div key={step.title} className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-4">
                  <p className="text-sm font-semibold text-foreground">{step.title}</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">{step.detail}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {featureCards.map(({ title, description, icon: Icon, footnote }) => (
            <Card key={title} className="border border-border/60 bg-background/80">
              <CardHeader className="space-y-3">
                <Badge variant="secondary" className="w-fit border-transparent bg-muted/50 text-xs uppercase tracking-[0.25em]">
                  Core feature
                </Badge>
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-muted/40">
                    <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                  </span>
                  <CardTitle className="text-lg">{title}</CardTitle>
                </div>
                <CardDescription className="text-sm leading-relaxed">{description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  Ready today
                </div>
                <p>{footnote}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="rounded-3xl border border-dashed border-border/60 bg-muted/20 p-8 sm:p-10">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
              Get your next capture analyzed in minutes
            </h2>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              Sign in to publish packet captures, monitor the automated verdicts, and share results with the rest of your operations team.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild>
                <Link href={isAuthenticated ? "/dashboard" : "/login"}>
                  {isAuthenticated ? "Open dashboard" : "Access Network Cloud"}
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/privacy">Review our policies</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
