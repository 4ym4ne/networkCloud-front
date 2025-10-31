import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AnalysisReportView } from "@/components/dashboard/analysis-report-view";
import { Button } from "@/components/ui/button";

interface HistoryDetailPageProps {
  params: Promise<{ fileId: string }>;
}

export default async function HistoryDetailPage({ params }: HistoryDetailPageProps) {
  const { fileId } = await params;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href="/dashboard/history">
              <ArrowLeft className="h-4 w-4" />
              History
            </Link>
          </Button>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-foreground">Analysis report</h1>
            <p className="font-mono text-xs text-muted-foreground truncate">{fileId}</p>
          </div>
        </div>
      </div>

      <AnalysisReportView fileId={fileId} />
    </div>
  );
}
