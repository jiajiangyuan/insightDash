import { request } from '@umijs/max';
import type { Dayjs } from 'dayjs';

export interface AnomalyThreshold {
  metric: string;
  warning: number;
  critical: number;
}

export interface AnomalyRule {
  metric: string;
  method: 'zscore' | 'iqr' | 'percentile';
  params: {
    zscore?: number;
    iqr?: number;
    percentile?: number;
  };
  thresholds: AnomalyThreshold;
}

export interface Anomaly {
  id: string;
  timestamp: string;
  metric: string;
  value: number;
  severity: 'high' | 'medium' | 'low' | 'info';
  type: string;
  status: 'active' | 'resolved';
}

export interface AnomalyStats {
  total: number;
  active: number;
  inactive: number;
  byType: Array<{
    type: string;
    count: number;
  }>;
  byStatus: Array<{
    status: string;
    count: number;
  }>;
  bySeverity: Array<{
    severity: string;
    count: number;
  }>;
  byCategory: Array<{
    category: string;
    count: number;
  }>;
  byOwner: Array<{
    owner: string;
    count: number;
  }>;
  byPriority: Array<{
    priority: string;
    count: number;
  }>;
  byFrequency: Array<{
    frequency: string;
    count: number;
  }>;
  byThreshold: Array<{
    threshold: string;
    count: number;
  }>;
  byTimeRange: Array<{
    range: string;
    count: number;
  }>;
  byNotification: Array<{
    type: string;
    count: number;
  }>;
  byResolution: Array<{
    resolution: string;
    count: number;
  }>;
  byEnvironment: Array<{
    env: string;
    count: number;
  }>;
  byRegion: Array<{
    region: string;
    count: number;
  }>;
  byService: Array<{
    service: string;
    count: number;
  }>;
  byTeam: Array<{
    team: string;
    count: number;
  }>;
}

export interface AnomalyDetectionConfig {
  rules: AnomalyRule[];
  enabled: boolean;
}

// 获取异常检测配置
export async function getAnomalyConfig() {
  return request<{ data: AnomalyDetectionConfig }>('/api/anomaly/config');
}

// 更新异常检测配置
export async function updateAnomalyConfig(config: AnomalyDetectionConfig) {
  return request('/api/anomaly/config', {
    method: 'PUT',
    data: config,
  });
}

// 获取指定时间范围内的异常
export async function getAnomalies(params: {
  startTime: Dayjs;
  endTime: Dayjs;
  metrics?: string[];
}): Promise<AnomalyStats> {
  return request<{ data: AnomalyStats }>('/api/anomaly/detect', {
    method: 'GET',
    params: {
      startTime: params.startTime.format('YYYY-MM-DD HH:mm:ss'),
      endTime: params.endTime.format('YYYY-MM-DD HH:mm:ss'),
      metrics: params.metrics?.join(','),
    },
  }).then(response => response.data);
}

// 本地异常检测算法
export class AnomalyDetector {
  // Z-score方法检测异常
  static detectWithZScore(data: number[], threshold: number = 3): number[] {
    const mean = data.reduce((a, b) => a + b) / data.length;
    const std = Math.sqrt(
      data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length
    );
    
    return data.filter(x => Math.abs((x - mean) / std) > threshold);
  }

  // IQR方法检测异常
  static detectWithIQR(data: number[], multiplier: number = 1.5): number[] {
    const sorted = [...data].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    const lowerBound = q1 - multiplier * iqr;
    const upperBound = q3 + multiplier * iqr;
    
    return data.filter(x => x < lowerBound || x > upperBound);
  }

  // 百分位数方法检测异常
  static detectWithPercentile(
    data: number[],
    lowerPercentile: number = 1,
    upperPercentile: number = 99
  ): number[] {
    const sorted = [...data].sort((a, b) => a - b);
    const lower = sorted[Math.floor(sorted.length * lowerPercentile / 100)];
    const upper = sorted[Math.floor(sorted.length * upperPercentile / 100)];
    
    return data.filter(x => x < lower || x > upper);
  }

  // 组合检测方法
  static detect(
    data: number[],
    rule: AnomalyRule
  ): { anomalies: number[]; expectedRange: [number, number] } {
    let anomalies: number[] = [];
    let expectedRange: [number, number] = [0, 0];

    switch (rule.method) {
      case 'zscore': {
        const mean = data.reduce((a, b) => a + b) / data.length;
        const std = Math.sqrt(
          data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length
        );
        const threshold = rule.params.zscore || 3;
        expectedRange = [
          mean - threshold * std,
          mean + threshold * std
        ];
        anomalies = this.detectWithZScore(data, threshold);
        break;
      }
      case 'iqr': {
        const sorted = [...data].sort((a, b) => a - b);
        const q1 = sorted[Math.floor(sorted.length * 0.25)];
        const q3 = sorted[Math.floor(sorted.length * 0.75)];
        const iqr = q3 - q1;
        const multiplier = rule.params.iqr || 1.5;
        expectedRange = [
          q1 - multiplier * iqr,
          q3 + multiplier * iqr
        ];
        anomalies = this.detectWithIQR(data, multiplier);
        break;
      }
      case 'percentile': {
        const sorted = [...data].sort((a, b) => a - b);
        const lowerPercentile = rule.params.percentile || 1;
        const upperPercentile = 100 - lowerPercentile;
        expectedRange = [
          sorted[Math.floor(sorted.length * lowerPercentile / 100)],
          sorted[Math.floor(sorted.length * upperPercentile / 100)]
        ];
        anomalies = this.detectWithPercentile(
          data,
          lowerPercentile,
          upperPercentile
        );
        break;
      }
    }

    return { anomalies, expectedRange };
  }
} 