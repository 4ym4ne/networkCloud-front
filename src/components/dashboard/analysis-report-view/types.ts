export type AnalysisStatus = "COMPLETED" | "FAILED";

export type AnalysisFlow = {
  id: string;
  srcIp: string;
  dstIp: string;
  srcPort: number | null;
  dstPort: number | null;
  protocol: string;
  classification: string;
  packets: number;
  bytes: number;
  throughputMbps: number;
  loss: number;
  rtt: number;
  jitter: number;
  mos: number;
  quality: string;
};

export type AnalysisReport = {
  reportId: string;
  fileId: string;
  status: AnalysisStatus;
  totalFlows: number;
  avgRtt: number;
  avgLoss: number;
  avgJitter: number;
  avgMos: number;
  overallQuality: string;
  analyzedAt: string;
  flows: AnalysisFlow[];
};

export type LoadState = "idle" | "loading" | "success" | "error";
