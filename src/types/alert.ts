export interface AlertData {
  id: string;
  timestamp: string;
  type: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  status: 'active' | 'resolved';
  resolvedAt?: string;
  metric: string;
  value: number;
  threshold: number;
  ruleName: string;
  condition: 'gt' | 'lt' | 'eq';
  notificationsSent: string[];
}

export interface AlertSummary {
  type: string;
  count: number;
}

export interface AlertAnalysisData {
  alerts: AlertData[];
  alertTrend: { timestamp: string; count: number; type: string }[];
  alertSummary: AlertSummary[];
  totalAlerts: number;
  activeAlerts: number;
  avgResolutionTime: number;
  criticalAlerts: number;
} 