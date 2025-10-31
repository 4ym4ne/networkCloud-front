export type NotificationRiskLevel =
  | "critical"
  | "high"
  | "medium"
  | "low"
  | "info"
  | "warning"
  | string;

export interface Notification {
  id: string;
  title: string;
  message?: string | null;
  summary?: string | null;
  riskLevel?: NotificationRiskLevel;
  riskScore?: number | null;
  fileId?: string | null;
  createdAt: string;
  generatedAt?: string | null;
  read: boolean;
  readAt?: string | null;
  link?: string | null;
  recommendations?: string[];
  source?: string | null;
  tags?: string[];
  meta?: Record<string, unknown>;
}

export interface NotificationsStateSnapshot {
  entities: Record<string, Notification>;
  order: string[];
  unreadCount: number;
  lastSyncedAt?: string;
}
