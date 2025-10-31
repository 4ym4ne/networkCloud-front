import Link from "next/link";
import { ArrowLeft, History, UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AnalysisHistory } from "@/components/dashboard/analysis-history";

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-border/70 bg-gradient-to-br from-primary/5 via-background to-background p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <History className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold text-foreground">Analysis history</h1>
            <p className="text-sm text-muted-foreground">
              Quickly browse recent analyzer runs and jump back into their reports.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" className="gap-2">
            <Link href="/dashboard/pcap-upload">
              <UploadCloud className="h-4 w-4" />
              Upload capture
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Link>
          </Button>
        </div>
      </div>
      <AnalysisHistory detailBasePath="/dashboard/history" />
    </div>
  );
}
