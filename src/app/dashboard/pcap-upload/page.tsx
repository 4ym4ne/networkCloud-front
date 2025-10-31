import Link from "next/link";

import { PcapUploadCard } from "@/components/dashboard/pcap-upload-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  ArrowRight,
  History,
  LifeBuoy,
  ListChecks,
  ShieldHalf,
  Workflow,
} from "lucide-react";

const checklist = [
  {
    title: "Choose the capture",
    description: "Standard .pcap files up to 50 MB are accepted. Larger captures can be split per segment.",
  },
  {
    title: "Name it clearly",
    description: "Use meaningful filenames (e.g., edge-gateway-2025-02-14.pcap) for faster triage in history.",
  },
  {
    title: "Optional redaction",
    description: "Payload stripping and header sanitisation run automatically; pre-sanitise only if policy requires.",
  },
];

const pipeline = [
  {
    title: "Ingest & verify",
    description: "SHA256 verification, schema checks, and metadata enrichment start the moment the file lands.",
    eta: "~45s",
  },
  {
    title: "Protocol decoding",
    description: "Streaming parsers extract flows, JA3, DNS, TLS and HTTP artefacts for downstream analytics.",
    eta: "~2m",
  },
  {
    title: "Detection & scoring",
    description: "Behavioral, signature, and policy engines rank risky flows and queue notifications for your workspace.",
    eta: "~90s",
  },
];

const support = [
  {
    title: "Need a larger upload?",
    description: "Open a tunnel with the Network Cloud CLI (`network-cloud capture push --chunk-size=1g`) for large traces.",
  },
  {
    title: "Something stuck in processing?",
    description: "Check the analysis queue in history or contact support@networkcloud.example with the reference ID.",
  },
  {
    title: "Looking for automation?",
    description: "Use the REST endpoint `POST /api/pcap/upload` with your service principal to integrate pipelines.",
  },
];

const journey = [
  {
    title: "Upload & verify",
    description: "Client-side resumable uploads hand off to secure S3 buckets. We verify integrity before analysis begins.",
  },
  {
    title: "Analyzer pipeline",
    description: "Flows, detections, and insights stream back in near-real time. Notifications fire for high severity.",
  },
  {
    title: "Review & act",
    description: "Open analysis history for full reports, kick off SOAR playbooks, or share the packet narrative with your team.",
  },
];

export default function PcapUploadPage() {
  return (
    <div className="space-y-8">
      <Card className="border border-border/70 bg-gradient-to-r from-primary/10 via-background to-background">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <Badge className="border-transparent bg-primary text-primary-foreground">
              PCAP intake
            </Badge>
            <CardTitle className="mt-2 text-3xl font-semibold text-foreground">
              Upload packet captures with confidence
            </CardTitle>
            <CardDescription className="max-w-2xl text-sm text-muted-foreground">
              Securely deliver captures to the Network Cloud analyzer. Every upload is verified, encrypted, and tracked end-to-end.
            </CardDescription>
          </div>
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href="/dashboard/history">
              <History className="h-4 w-4" />
              View history
            </Link>
          </Button>
        </CardHeader>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <PcapUploadCard />

        <Card className="border border-border/60">
          <CardHeader className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-base font-medium text-foreground">
              <ShieldHalf className="h-4 w-4 text-primary" />
              Upload assistant
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Quick guidance on preparing captures, understanding the pipeline, and getting help.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="checklist" className="space-y-4">
              <TabsList>
                <TabsTrigger value="checklist">
                  <ListChecks className="h-4 w-4" />
                  Checklist
                </TabsTrigger>
                <TabsTrigger value="pipeline">
                  <Workflow className="h-4 w-4" />
                  Pipeline
                </TabsTrigger>
                <TabsTrigger value="support">
                  <LifeBuoy className="h-4 w-4" />
                  Support
                </TabsTrigger>
              </TabsList>

              <TabsContent value="checklist">
                <div className="space-y-3 rounded-lg border border-border/60 bg-muted/30 p-4">
                  {checklist.map((item) => (
                    <div key={item.title} className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="pipeline">
                <div className="space-y-4 rounded-lg border border-border/60 bg-muted/30 p-4">
                  {pipeline.map((item, index) => (
                    <div key={item.title} className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-0.5 border-primary/40 bg-primary/10 text-[11px] uppercase tracking-wide text-primary">
                        Step {index + 1}
                      </Badge>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">
                          {item.title}
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {item.description}
                        </p>
                        <span className="text-xs font-medium text-muted-foreground/80">Typical duration: {item.eta}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="support">
                <div className="space-y-3 rounded-lg border border-border/60 bg-muted/30 p-4">
                  {support.map((item) => (
                    <div key={item.title} className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                    </div>
                  ))}
                  <Button asChild size="sm" variant="secondary" className="gap-2">
                    <Link href="mailto:support@networkcloud.example">
                      Email support
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-border/60">
        <CardHeader className="space-y-2 sm:flex sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-foreground">Upload journey</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              A typical capture is fully analysed in under five minutes. Track each stage below.
            </CardDescription>
          </div>
          <div className="space-y-1 text-right">
            <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Average completion</span>
            <div className="flex items-center gap-2">
              <div className="text-sm font-semibold text-foreground">4m 15s</div>
            </div>
            <Progress value={82} className="w-full sm:w-48" />
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          {journey.map((step, index) => (
            <div
              key={step.title}
              className="rounded-xl border border-border/50 bg-muted/20 p-4"
            >
              <Badge variant="outline" className="border-transparent bg-primary/10 text-xs uppercase tracking-wide text-primary">
                Phase {index + 1}
              </Badge>
              <p className="mt-3 text-sm font-semibold text-foreground">{step.title}</p>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
