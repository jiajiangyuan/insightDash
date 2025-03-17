import { request } from '@umijs/max';
import type { TimeGranularity } from '@/types/common';
import type { Dayjs } from 'dayjs';
import type { AlertRule } from '@/pages/dashboard/components/AlertConfig';
import type { AlertHistoryItem } from '@/pages/dashboard/components/AlertHistory';
import type { PerformanceData } from '@/types/performance';
import type { CostData, CostBreakdown } from '@/types/cost';
import type { ModelAnalysisData } from '@/types/model';
import type { SessionAnalysisData } from '@/types/session';
import type { AnomalyStats, AnomalyDetectionConfig } from '@/services/anomalyDetection';
import dayjs from 'dayjs';

// 接口返回类型定义
export interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

// 性能概览数据类型
interface OverviewData {
  summary: {
    totalRequests: number;
    avgResponseTime: number;
    errorRate: number;
    successRate: number;
    cpuUsage: number;
    memoryUsage: number;
    gpuUsage: number;
  };
  trends: Array<{
    timestamp: string;
    requestCount: number;
    responseTime: number;
    errorRate: number;
    cpuUsage: number;
    memoryUsage: number;
    gpuUsage: number;
  }>;
}

// 模型性能数据类型
interface ModelData {
  name: string;
  responseTime: number;
  successRate: number;
  quality: number;
  cost: number;
  requestCount: number;
}

// 成本分析数据类型
export interface CostAnalysisData {
  costTrend: CostData[];
  costBreakdown: CostBreakdown[];
  totalCost: number;
  averageDailyCost: number;
  costGrowthRate: number;
}

// 会话数据类型
export interface SessionData {
  timestamp: string;
  sessionId: string;
  userId: string;
  duration: number;
  messageCount: number;
  avgResponseTime: number;
  satisfactionScore: number;
  completionRate: number;
  platform: string;
  errorCount: number;
  features: string[];
}

export interface ModelComparisonData {
  modelName: string;
  avgResponseTime: number;
  successRate: number;
  callCount: number;
  avgTokens: number;
}

export interface ModelPerformanceData {
  modelName: string;
  timestamp: string;
  responseTime: number;
  successRate: number;
  qualityScore: number;
  tokenCount: number;
  costPerToken: number;
}

// 获取性能概览数据
export async function getOverviewData(params: {
  startTime: Dayjs;
  endTime: Dayjs;
  granularity: TimeGranularity;
}): Promise<ApiResponse<OverviewData>> {
  // 模拟API调用
  return {
    code: 0,
    message: 'success',
    data: {
      summary: {
        totalRequests: 15000,
        avgResponseTime: 250,
        errorRate: 1.5,
        successRate: 98.5,
        cpuUsage: 65,
        memoryUsage: 70,
        gpuUsage: 55,
      },
      trends: [
        {
          timestamp: '2024-03-20 10:00:00',
          requestCount: 4800,
          responseTime: 240,
          errorRate: 1.2,
          cpuUsage: 62,
          memoryUsage: 68,
          gpuUsage: 52,
        },
        {
          timestamp: '2024-03-20 11:00:00',
          requestCount: 5200,
          responseTime: 255,
          errorRate: 1.8,
          cpuUsage: 67,
          memoryUsage: 72,
          gpuUsage: 57,
        },
        {
          timestamp: '2024-03-20 12:00:00',
          requestCount: 5000,
          responseTime: 245,
          errorRate: 1.5,
          cpuUsage: 65,
          memoryUsage: 70,
          gpuUsage: 55,
        },
      ],
    },
  };
}

// 获取模型性能数据
export async function getModelData(): Promise<ModelAnalysisData> {
  // 模拟API调用
  return {
    metrics: [
      { timestamp: '2024-03-20 10:00:00', value: 95, model: 'GPT-4', metric: '准确率' },
      { timestamp: '2024-03-20 11:00:00', value: 96, model: 'GPT-4', metric: '准确率' },
      { timestamp: '2024-03-20 12:00:00', value: 94, model: 'GPT-4', metric: '准确率' },
      { timestamp: '2024-03-20 10:00:00', value: 92, model: 'Claude-3', metric: '准确率' },
      { timestamp: '2024-03-20 11:00:00', value: 93, model: 'Claude-3', metric: '准确率' },
      { timestamp: '2024-03-20 12:00:00', value: 94, model: 'Claude-3', metric: '准确率' },
    ],
    comparisons: [
      {
        model: 'GPT-4',
        accuracy: 95,
        latency: 800,
        costPerToken: 0.0008,
        reliability: 99.9,
        satisfaction: 95,
      },
      {
        model: 'Claude-3',
        accuracy: 93,
        latency: 600,
        costPerToken: 0.0006,
        reliability: 99.8,
        satisfaction: 94,
      },
      {
        model: 'GPT-3.5',
        accuracy: 89,
        latency: 400,
        costPerToken: 0.0002,
        reliability: 99.7,
        satisfaction: 92,
      },
    ],
    bestPerformer: 'GPT-4',
    averageLatency: 600,
    averageAccuracy: 92.3,
  };
}

// 获取性能数据
export async function getPerformanceData(): Promise<PerformanceData> {
  // 模拟API调用
  return {
    responseTime: [
      { timestamp: '2024-03-20 10:00:00', value: 120, type: 'API响应时间' },
      { timestamp: '2024-03-20 11:00:00', value: 150, type: 'API响应时间' },
      { timestamp: '2024-03-20 12:00:00', value: 130, type: 'API响应时间' },
    ],
    requests: [
      { timestamp: '2024-03-20 10:00:00', count: 1000, type: 'API请求量' },
      { timestamp: '2024-03-20 11:00:00', count: 1200, type: 'API请求量' },
      { timestamp: '2024-03-20 12:00:00', count: 1100, type: 'API请求量' },
    ],
    errors: [
      { type: '网络错误', count: 50 },
      { type: '服务器错误', count: 30 },
      { type: '客户端错误', count: 20 },
    ],
  };
}

// 获取成本数据
export async function getCostData(): Promise<CostAnalysisData> {
  // 模拟API调用
  return {
    costTrend: [
      { timestamp: '2024-03-20 10:00:00', cost: 100, type: 'API调用' },
      { timestamp: '2024-03-20 11:00:00', cost: 120, type: 'API调用' },
      { timestamp: '2024-03-20 12:00:00', cost: 110, type: 'API调用' },
      { timestamp: '2024-03-20 10:00:00', cost: 50, type: '存储' },
      { timestamp: '2024-03-20 11:00:00', cost: 55, type: '存储' },
      { timestamp: '2024-03-20 12:00:00', cost: 52, type: '存储' },
    ],
    costBreakdown: [
      { type: 'API调用', cost: 330 },
      { type: '存储', cost: 157 },
      { type: '数据处理', cost: 200 },
      { type: '其他', cost: 50 },
    ],
    totalCost: 737,
    averageDailyCost: 245.67,
    costGrowthRate: 15.8,
  };
}

// 获取异常检测配置
export async function getAnomalyConfig(): Promise<AnomalyDetectionConfig> {
  const response = await request<ApiResponse<AnomalyDetectionConfig>>('/api/dashboard/anomaly/config', {
    method: 'GET',
  });
  return response.data;
}

// 获取异常数据
export async function getAnomalies(
  timeRange: [Dayjs, Dayjs],
  config: AnomalyDetectionConfig,
): Promise<AnomalyStats> {
  const [startTime, endTime] = timeRange;
  const response = await request<ApiResponse<AnomalyStats>>('/api/dashboard/anomalies', {
    method: 'GET',
    params: {
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      ...config,
    },
  });
  console.log('API 返回的异常数据:', response);
  if (response.code === 200 && response.data) {
    return response.data;
  } else {
    // 如果 API 调用失败，返回模拟数据
    return {
      total: 156,
      active: 142,
      inactive: 14,
      byType: [
        { type: '性能异常', count: 45 },
        { type: '业务异常', count: 38 },
        { type: '系统异常', count: 32 },
        { type: '安全异常', count: 25 },
        { type: '其他', count: 16 },
      ],
      byStatus: [
        { status: 'active', count: 142 },
        { status: 'inactive', count: 14 },
      ],
      bySeverity: [
        { severity: 'high', count: 28 },
        { severity: 'medium', count: 45 },
        { severity: 'low', count: 69 },
        { severity: 'info', count: 14 },
      ],
      byCategory: [
        { category: '系统监控', count: 52 },
        { category: '业务监控', count: 48 },
        { category: '安全监控', count: 36 },
        { category: '性能监控', count: 20 },
      ],
      byOwner: [
        { owner: '系统团队', count: 45 },
        { owner: '业务团队', count: 38 },
        { owner: '安全团队', count: 32 },
        { owner: '运维团队', count: 25 },
        { owner: '其他', count: 16 },
      ],
      byPriority: [
        { priority: 'P0', count: 12 },
        { priority: 'P1', count: 28 },
        { priority: 'P2', count: 45 },
        { priority: 'P3', count: 71 },
      ],
      byFrequency: [
        { frequency: '1m', count: 25 },
        { frequency: '5m', count: 38 },
        { frequency: '15m', count: 45 },
        { frequency: '30m', count: 28 },
        { frequency: '1h', count: 20 },
      ],
      byThreshold: [
        { threshold: '>90%', count: 15 },
        { threshold: '>80%', count: 28 },
        { threshold: '>70%', count: 42 },
        { threshold: '>60%', count: 35 },
        { threshold: '>50%', count: 36 },
      ],
      byTimeRange: [
        { range: '24h', count: 45 },
        { range: '7d', count: 38 },
        { range: '30d', count: 32 },
        { range: '90d', count: 25 },
        { range: 'custom', count: 16 },
      ],
      byNotification: [
        { type: 'email', count: 85 },
        { type: 'sms', count: 45 },
        { type: 'webhook', count: 38 },
        { type: 'dingtalk', count: 32 },
        { type: 'wechat', count: 25 },
      ],
      byResolution: [
        { resolution: 'auto', count: 45 },
        { resolution: 'manual', count: 85 },
        { resolution: 'scheduled', count: 26 },
      ],
      byEnvironment: [
        { env: 'prod', count: 52 },
        { env: 'staging', count: 38 },
        { env: 'test', count: 32 },
        { env: 'dev', count: 34 },
      ],
      byRegion: [
        { region: '华东', count: 45 },
        { region: '华北', count: 38 },
        { region: '华南', count: 32 },
        { region: '西南', count: 25 },
        { region: '其他', count: 16 },
      ],
      byService: [
        { service: '核心服务', count: 52 },
        { service: '业务服务', count: 48 },
        { service: '基础设施', count: 36 },
        { service: '安全服务', count: 20 },
      ],
      byTeam: [
        { team: '研发团队', count: 45 },
        { team: '运维团队', count: 38 },
        { team: '安全团队', count: 32 },
        { team: '业务团队', count: 25 },
        { team: '其他', count: 16 },
      ],
    };
  }
}

// 更新异常检测配置
export async function updateAnomalyConfig(config: AnomalyDetectionConfig): Promise<void> {
  await request<ApiResponse<void>>('/api/dashboard/anomaly/config', {
    method: 'PUT',
    data: config,
  });
}

// 获取会话数据
export async function getSessionData(): Promise<SessionAnalysisData> {
  // 模拟API调用
  return {
    sessionTrend: [
      { timestamp: '2024-03-20 10:00:00', count: 100, type: '新用户' },
      { timestamp: '2024-03-20 11:00:00', count: 120, type: '新用户' },
      { timestamp: '2024-03-20 12:00:00', count: 110, type: '新用户' },
      { timestamp: '2024-03-20 10:00:00', count: 200, type: '老用户' },
      { timestamp: '2024-03-20 11:00:00', count: 220, type: '老用户' },
      { timestamp: '2024-03-20 12:00:00', count: 210, type: '老用户' },
    ],
    userTypes: [
      { type: '新用户', count: 330 },
      { type: '老用户', count: 630 },
      { type: '访客', count: 120 },
    ],
    totalSessions: 1080,
    averageDuration: 15.5,
    completionRate: 92.5,
    activeUsers: 850,
  };
}

export async function getModelComparisonData(): Promise<{ data: ModelComparisonData[] }> {
  return request('/api/dashboard/model-comparison');
}

// 获取告警规则列表
export async function getAlertRules(): Promise<AlertRule[]> {
  const response = await request<ApiResponse<AlertRule[]>>('/api/dashboard/alerts/rules', {
    method: 'GET',
  });
  return response.data;
}

// 更新告警规则
export async function updateAlertRule(rule: AlertRule): Promise<void> {
  await request<ApiResponse<void>>('/api/dashboard/alerts/rules', {
    method: rule.id ? 'PUT' : 'POST',
    data: rule,
  });
}

// 删除告警规则
export async function deleteAlertRule(id: string): Promise<void> {
  await request<ApiResponse<void>>(`/api/dashboard/alerts/rules/${id}`, {
    method: 'DELETE',
  });
}

// 获取告警历史记录
export async function getAlertHistory(timeRange: [Dayjs, Dayjs]): Promise<AlertHistoryItem[]> {
  const [startTime, endTime] = timeRange;
  const response = await request<ApiResponse<AlertHistoryItem[]>>('/api/dashboard/alerts/history', {
    method: 'GET',
    params: {
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    },
  });
  return response.data;
}

// 解决告警
export async function resolveAlertById(id: string): Promise<void> {
  await request<ApiResponse<void>>(`/api/dashboard/alerts/history/${id}/resolve`, {
    method: 'PUT',
  });
}

// 获取模型性能对比数据
export async function getModelPerformanceData(
  timeRange: [Dayjs, Dayjs],
  granularity: TimeGranularity,
): Promise<ModelPerformanceData[]> {
  const [startTime, endTime] = timeRange;
  const response = await request<ApiResponse<ModelPerformanceData[]>>('/api/dashboard/models/performance', {
    method: 'GET',
    params: {
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      granularity,
    },
  });
  return response.data;
}

// 获取异常预测数据
export async function getAnomalyPrediction(metric: string): Promise<{
  timestamp: string;
  value: number;
  type: string;
}[]> {
  const response = await request<ApiResponse<{
    timestamp: string;
    value: number;
    type: string;
  }[]>>('/api/dashboard/anomaly/prediction', {
    method: 'GET',
    params: {
      metric,
      startTime: dayjs().toISOString(),
    },
  });
  return response.data;
} 