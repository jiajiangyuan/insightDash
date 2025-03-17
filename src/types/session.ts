export interface SessionData {
  id: string;
  timestamp: string;
  duration: number;
  messageCount: number;
  satisfactionScore: number;
  completionRate: number;
  platform: string;
  features: string[];
  status: 'active' | 'completed' | 'abandoned';
}

export interface SessionStats {
  totalSessions: number;
  avgDuration: number;
  avgSatisfaction: string;
  avgCompletionRate: string;
}

export interface PlatformStat {
  platform: string;
  count: number;
  percentage: number;
}

export interface FeatureUsage {
  feature: string;
  count: number;
  percentage: number;
}

export interface HourlyActivity {
  hour: number;
  count: number;
}

export type SessionAnalysisData = SessionData[]; 