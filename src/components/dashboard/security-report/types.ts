export type SecurityReport = {
  id: string;
  fileId: string;
  analysisReportId: string;
  generatedAt: string;
  riskScore: number;
  riskLevel: string;
  analysisStatus: string;
  overallQuality?: string | null;
  summary?: string | null;
  recommendations?: string[] | null;
  totalFlows?: number | null;
  avgRtt?: number | null;
  avgLoss?: number | null;
  avgJitter?: number | null;
  avgMos?: number | null;
};

export type LoadState = "idle" | "loading" | "success" | "error" | "not_found";
