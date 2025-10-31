import Link from "next/link";

import { PcapUploadCard } from "@/components/dashboard/pcap-upload-card";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BellRing,
  History,
  ShieldCheck,
  Timer,
  Workflow,
} from "lucide-react";

type OperationStatus = {
  title: string;
  status: string;
  description: string;
  icon: LucideIcon;
};

const statusCards: OperationStatus[] = [
  {
    title: "Ingest pipeline",
    status: "Healthy",
    description: "Processing 3 captures; throughput holding at 64 MB/s aggregate.",
    icon: ShieldCheck,
  },
  {
    title: "Analyzer queue",
    status: "11 files",
    description: "Average time to verdict is 3m 12s across active jobs.",
    icon: Workflow,
  },
  {
    title: "Notification stream",
    status: "Live",
    description: "Alerts delivering to 4 destinations with no backlog.",
    icon: BellRing,
  },
  {
    title: "SLA timer",
    status: "00:12",
    description: "Next operations check-in due in 12 minutes; no action required.",
    icon: Timer,
  },
];

const activityLog = [
  {
    title: "edge-gateway-042.pcap ingested",
    description: "Integrity verified and queued for deep inspection.",
    time: "09:41",
  },
  {
    title: "Policy sweep completed",
    description: "Automation reviewed 145 flows; no escalations triggered.",
    time: "09:13",
  },
  {
    title: "Notification digest sent",
    description: "Summary delivered to SecOps team channel.",
    time: "08:50",
  },
];

export default function DashboardPage() {
  return (
    <section className="space-y-8">
      <Card className="border border-border/50">
        <CardHeader className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <Badge
                variant="secondary"
                className="border-transparent bg-primary/15 text-primary"
              >
                Network operations
              </Badge>
              <CardTitle className="text-3xl font-semibold md:text-4xl">
                Operations console
              </CardTitle>
              <CardDescription className="max-w-2xl">
                Keep packet ingestion healthy and surface actions without leaving this view.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button asChild size="sm" variant="outline" className="gap-2">
                <Link href="/dashboard/history">
                  <History className="h-4 w-4" />
                  View history
                </Link>
              </Button>
              <Button asChild size="sm" variant="ghost" className="gap-2">
                <Link href="/dashboard/notifications">
                  <BellRing className="h-4 w-4" />
                  Notifications
                </Link>
              </Button>
            </div>
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/30 p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Pipeline health
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  All ingestion services are online. Average throughput is holding steady.
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                <Activity className="h-4 w-4" aria-hidden="true" />
                Stable
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-8 xl:grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)]">
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {statusCards.map(({ title, status, description, icon: Icon }) => (
                  <div
                    key={title}
                    className="rounded-xl border border-border/60 bg-background/70 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                        {title}
                      </div>
                      <span className="rounded-full border border-border/60 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        {status}
                      </span>
                    </div>
                    <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                      {description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-border/60 bg-background/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Recent activity
                </p>
                <ul className="mt-4 space-y-4">
                  {activityLog.map((item, index) => (
                    <li key={item.title} className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-foreground">{item.title}</p>
                        <span className="text-xs text-muted-foreground">{item.time}</span>
                      </div>
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                      {index < activityLog.length - 1 ? (
                        <Separator className="pt-1 opacity-60" />
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <PcapUploadCard />
              <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 p-5 text-sm leading-relaxed text-muted-foreground">
                <p className="font-medium text-foreground">Automate uploads</p>
                <p className="mt-2">
                  Schedule transfers with the Network Cloud CLI or send captures to{" "}
                  <code className="rounded bg-background px-1.5 py-0.5 text-[11px]">
                    POST /api/pcap/upload
                  </code>{" "}
                  using your service principal.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
