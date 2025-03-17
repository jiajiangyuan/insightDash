import { useState, useCallback, useEffect } from 'react';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { message } from 'antd';
import { CacheService, cacheInstance } from '@/services/cache';
import {
  getPerformanceData,
  getCostData,
  getAnomalyConfig,
  getAnomalies,
  updateAnomalyConfig,
  getSessionData,
  getAlertRules,
  updateAlertRule as updateRule,
  deleteAlertRule as deleteRule,
  getAlertHistory,
  resolveAlertById,
  getModelPerformanceData,
  getModelData,
  type ModelPerformanceData,
} from '@/services/dashboard';
import type { AlertRule } from '@/pages/dashboard/components/AlertConfig';
import type { AlertHistoryItem } from '@/pages/dashboard/components/AlertHistory';
import type { ModelAnalysisData } from '@/types/model';
import type { AlertAnalysisData, AlertData, AlertSummary } from '@/types/alert';
import type { AnomalyDetectionConfig } from '@/services/anomalyDetection';
import type { AnomalyStats } from '@/services/anomalyDetection';
import type { TimeGranularity } from '@/types/common';
import type { PerformanceData } from '@/types/performance';
import type { SessionData } from '@/types/session';
import type { CostAnalysisData, CostData, CostBreakdown } from '@/types/cost';

// 生成模型性能模拟数据
const generateMockModelData = (timeRange: [Dayjs, Dayjs], granularity: TimeGranularity): ModelPerformanceData[] => {
  const models = [
    { name: 'GPT-4', baseResponseTime: 800, baseSuccessRate: 0.98, baseQualityScore: 9.5, baseTokenCount: 800, baseCost: 0.00012 },
    { name: 'Claude 2', baseResponseTime: 600, baseSuccessRate: 0.97, baseQualityScore: 9.2, baseTokenCount: 700, baseCost: 0.00008 },
    { name: 'Gemini Pro', baseResponseTime: 400, baseSuccessRate: 0.95, baseQualityScore: 8.8, baseTokenCount: 600, baseCost: 0.00006 },
    { name: 'LLaMA 2', baseResponseTime: 1000, baseSuccessRate: 0.93, baseQualityScore: 8.5, baseTokenCount: 500, baseCost: 0.00003 }
  ];

  const data: ModelPerformanceData[] = [];
  let currentTime = timeRange[0];
  const interval = granularity === 'hour' ? 1 : granularity === 'day' ? 24 : granularity === 'week' ? 168 : 720;

  while (currentTime.isBefore(timeRange[1])) {
    models.forEach(model => {
      // 添加随机波动
      const timeVariance = Math.sin(currentTime.hour() * Math.PI / 12) * 0.2; // 模拟日内波动
      const randomVariance = (Math.random() - 0.5) * 0.1; // 随机波动

      data.push({
        modelName: model.name,
        timestamp: currentTime.toISOString(),
        responseTime: model.baseResponseTime * (1 + timeVariance + randomVariance),
        successRate: Math.min(1, Math.max(0.8, model.baseSuccessRate * (1 + randomVariance))),
        qualityScore: Math.min(10, Math.max(7, model.baseQualityScore * (1 + randomVariance))),
        tokenCount: Math.floor(model.baseTokenCount * (1 + timeVariance + randomVariance)),
        costPerToken: model.baseCost * (1 + randomVariance),
      });
    });

    currentTime = currentTime.add(interval, 'hour');
  }

  return data;
};

// 生成模拟的异常检测配置
const generateMockAnomalyConfig = (): AnomalyDetectionConfig => {
  return {
    rules: [
      {
        metric: 'responseTime',
        method: 'zscore',
        params: {
          zscore: 2.5
        },
        thresholds: {
          metric: 'responseTime',
          warning: 800,
          critical: 1000
        }
      },
      {
        metric: 'errorRate',
        method: 'percentile',
        params: {
          percentile: 95
        },
        thresholds: {
          metric: 'errorRate',
          warning: 0.05,
          critical: 0.1
        }
      },
      {
        metric: 'cpuUsage',
        method: 'iqr',
        params: {
          iqr: 1.5
        },
        thresholds: {
          metric: 'cpuUsage',
          warning: 85,
          critical: 95
        }
      },
      {
        metric: 'memoryUsage',
        method: 'zscore',
        params: {
          zscore: 2
        },
        thresholds: {
          metric: 'memoryUsage',
          warning: 90,
          critical: 95
        }
      }
    ],
    enabled: true
  };
};

// 生成告警历史模拟数据
const generateMockAlertHistory = (timeRange: [Dayjs, Dayjs]): AlertHistoryItem[] => {
  const metrics = [
    { name: 'CPU使用率', unit: '%', baseline: 70, warning: 85, critical: 95 },
    { name: '内存使用率', unit: '%', baseline: 75, warning: 90, critical: 95 },
    { name: '响应时间', unit: 'ms', baseline: 500, warning: 800, critical: 1000 },
    { name: '错误率', unit: '%', baseline: 1, warning: 5, critical: 10 },
  ];

  const rules = [
    { name: 'CPU告警', metric: 'CPU使用率', condition: 'gt' },
    { name: '内存告警', metric: '内存使用率', condition: 'gt' },
    { name: '响应时间告警', metric: '响应时间', condition: 'gt' },
    { name: '错误率告警', metric: '错误率', condition: 'gt' },
  ];

  const alerts: AlertHistoryItem[] = [];
  const duration = timeRange[1].diff(timeRange[0], 'hour');
  const alertCount = Math.min(Math.floor(Math.random() * 10) + 10, 20); // 生成10-20条告警

  for (let i = 0; i < alertCount; i++) {
    const rule = rules[Math.floor(Math.random() * rules.length)];
    const metric = metrics.find(m => m.name === rule.metric)!;
    const randomHour = Math.floor(Math.random() * duration);
    const timestamp = timeRange[0].add(randomHour, 'hour');
    const isResolved = Math.random() > 0.3; // 70%的告警已解决
    const resolvedDelay = Math.floor(Math.random() * 60) + 10; // 10-70分钟的解决时间
    const value = metric.baseline + (Math.random() * (metric.critical - metric.baseline));
    const isCritical = value >= metric.critical;
    
    alerts.push({
      id: `alert_${i + 1}`,
      timestamp: timestamp.toISOString(),
      ruleName: rule.name,
      metric: rule.metric,
      value: value,
      threshold: isCritical ? metric.critical : metric.warning,
      condition: rule.condition as 'gt' | 'lt' | 'eq',
      severity: isCritical ? 'critical' : 'warning',
      status: isResolved ? 'resolved' : 'active',
      resolvedAt: isResolved ? timestamp.add(resolvedDelay, 'minute').toISOString() : undefined,
      notificationsSent: Math.floor(Math.random() * 3) + 1,
    });
  }

  // 按时间排序
  return alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// 生成成本分析模拟数据
const generateMockCostData = (timeRange: [Dayjs, Dayjs]): CostAnalysisData => {
  const models = [
    { name: 'GPT-4', baseCost: 0.03, weight: 0.4 },
    { name: 'Claude 2', baseCost: 0.02, weight: 0.3 },
    { name: 'Gemini Pro', baseCost: 0.015, weight: 0.2 },
    { name: 'LLaMA 2', baseCost: 0.01, weight: 0.1 },
  ];

  const costTrend: CostData[] = [];
  let currentTime = timeRange[0];

  // 生成成本趋势数据
  while (currentTime.isBefore(timeRange[1])) {
    const hourOfDay = currentTime.hour();
    const dayOfWeek = currentTime.day();
    
    // 模拟每天不同时段的使用量变化
    const timeMultiplier = 1 + Math.sin(hourOfDay * Math.PI / 12) * 0.5;
    // 工作日使用量更大
    const weekdayMultiplier = dayOfWeek >= 1 && dayOfWeek <= 5 ? 1.5 : 1;
    
    models.forEach(model => {
      const baseRequests = Math.floor(100 * timeMultiplier * weekdayMultiplier * model.weight);
      const randomVariance = 0.9 + Math.random() * 0.2; // 随机波动±10%
      const requestCount = Math.floor(baseRequests * randomVariance);
      const cost = model.baseCost * requestCount * randomVariance;

      costTrend.push({
        timestamp: currentTime.toISOString(),
        cost,
        type: model.name,
      });
    });

    currentTime = currentTime.add(1, 'hour');
  }

  // 计算成本分布
  const costBreakdown = models.map(model => {
    const modelCosts = costTrend.filter(item => item.type === model.name);
    const totalCost = modelCosts.reduce((sum, item) => sum + item.cost, 0);
    return {
      type: model.name,
      cost: totalCost,
    };
  });

  // 计算总成本和日均成本
  const totalCost = costBreakdown.reduce((sum, item) => sum + item.cost, 0);
  const days = timeRange[1].diff(timeRange[0], 'day') || 1;
  const averageDailyCost = totalCost / days;

  // 计算成本增长率
  const midPoint = timeRange[0].add(days / 2, 'day');
  const firstHalfCosts = costTrend.filter(item => dayjs(item.timestamp).isBefore(midPoint));
  const secondHalfCosts = costTrend.filter(item => dayjs(item.timestamp).isAfter(midPoint));
  const firstHalfTotal = firstHalfCosts.reduce((sum, item) => sum + item.cost, 0);
  const secondHalfTotal = secondHalfCosts.reduce((sum, item) => sum + item.cost, 0);
  const costGrowthRate = ((secondHalfTotal - firstHalfTotal) / firstHalfTotal) * 100;

  return {
    costTrend,
    costBreakdown,
    totalCost,
    averageDailyCost,
    costGrowthRate,
  };
};

export default () => {
  const [timeRange, setTimeRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(24, 'hour'),
    dayjs(),
  ]);
  const [granularity, setGranularity] = useState<TimeGranularity>('hour');
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    responseTime: [],
    requests: [],
    errors: [],
  });
  const [costData, setCostData] = useState<CostAnalysisData>({
    costTrend: [],
    costBreakdown: [],
    totalCost: 0,
    averageDailyCost: 0,
    costGrowthRate: 0,
  });
  const [modelData, setModelData] = useState<ModelAnalysisData>({
    metrics: [],
    comparisons: [],
    bestPerformer: '',
    averageLatency: 0,
    averageAccuracy: 0,
  });
  const [sessionData, setSessionData] = useState<SessionData[]>([]);
  const [performanceLoading, setPerformanceLoading] = useState(false);
  const [costLoading, setCostLoading] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [anomalyConfig, setAnomalyConfig] = useState<AnomalyDetectionConfig | null>(null);
  const [anomalies, setAnomalies] = useState<AnomalyStats | null>(null);
  const [anomalyLoading, setAnomalyLoading] = useState(false);
  const [alertLoading, setAlertLoading] = useState(false);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [alertHistory, setAlertHistory] = useState<AlertHistoryItem[]>([]);
  const [modelPerformanceData, setModelPerformanceData] = useState<ModelPerformanceData[]>([]);
  const [alertData, setAlertData] = useState<AlertAnalysisData>({
    alerts: [],
    alertTrend: [],
    alertSummary: [],
    totalAlerts: 0,
    activeAlerts: 0,
    avgResolutionTime: 0,
    criticalAlerts: 0,
  });

  const clearDataCache = useCallback(() => {
    cacheInstance.clear(CacheService.generateTimeRangeKey('performance', timeRange));
    cacheInstance.clear(CacheService.generateTimeRangeKey('cost', timeRange));
    cacheInstance.clear(CacheService.generateTimeRangeKey('model', timeRange));
    cacheInstance.clear(CacheService.generateTimeRangeKey('session', timeRange));
  }, [timeRange]);

  const handleTimeRangeChange = useCallback((range: [Dayjs, Dayjs]) => {
    clearDataCache();
    setTimeRange(range);
  }, [clearDataCache]);

  const handleGranularityChange = useCallback((value: TimeGranularity) => {
    clearDataCache();
    setGranularity(value);
  }, [clearDataCache]);

  const fetchPerformanceData = useCallback(async () => {
    setPerformanceLoading(true);
    try {
      const cacheKey = CacheService.generateTimeRangeKey('performance', timeRange);
      const cachedData = cacheInstance.get<PerformanceData>(cacheKey);
      
      if (cachedData) {
        setPerformanceData(cachedData);
        return true;
      }

      const data = await getPerformanceData();
      if (data && typeof data === 'object') {
        setPerformanceData(data);
        cacheInstance.set(cacheKey, data);
        return true;
      }
    } catch (error) {
      console.error('获取性能数据失败:', error);
      return false;
    } finally {
      setPerformanceLoading(false);
    }
  }, []);

  const fetchCostData = useCallback(async () => {
    setCostLoading(true);
    try {
      const cacheKey = CacheService.generateTimeRangeKey('cost', timeRange);
      const cachedData = cacheInstance.get<CostAnalysisData>(cacheKey);
      
      if (cachedData) {
        setCostData(cachedData);
        return;
      }

      const data = await getCostData();
      if (data) {
        setCostData(data);
        cacheInstance.set(cacheKey, data);
      } else {
        // 如果没有数据，使用模拟数据
        const mockData = generateMockCostData(timeRange);
        setCostData(mockData);
        cacheInstance.set(cacheKey, mockData);
      }
    } catch (error) {
      console.error('获取成本数据失败:', error);
      // 发生错误时使用模拟数据
      const mockData = generateMockCostData(timeRange);
      setCostData(mockData);
    } finally {
      setCostLoading(false);
    }
  }, [timeRange]);

  const fetchModelData = async () => {
    setModelLoading(true);
    try {
      const cacheKey = CacheService.generateTimeRangeKey('model', timeRange);
      const cachedData = cacheInstance.get<ModelAnalysisData>(cacheKey);
      
      if (cachedData) {
        setModelData(cachedData);
        return true;
      }

      const data = await getModelData();
      setModelData(data);
      cacheInstance.set(cacheKey, data);
      return true;
    } catch (error) {
      message.error('获取模型数据失败');
      return false;
    } finally {
      setModelLoading(false);
    }
  };

  const fetchSessionData = useCallback(async () => {
    setSessionLoading(true);
    try {
      const cacheKey = CacheService.generateTimeRangeKey('session', timeRange);
      const cachedData = cacheInstance.get<SessionData[]>(cacheKey);
      
      if (cachedData) {
        setSessionData(cachedData);
        return true;
      }

      const data = await getSessionData();
      if (Array.isArray(data)) {
        setSessionData(data);
        cacheInstance.set(cacheKey, data);
        return true;
      }
    } catch (error) {
      console.error('获取会话数据失败:', error);
      return false;
    } finally {
      setSessionLoading(false);
    }
  }, [timeRange]);

  // 获取异常数据
  const fetchAnomalies = useCallback(async () => {
    setAnomalyLoading(true);
    try {
      const defaultConfig: AnomalyDetectionConfig = {
        rules: [],
        enabled: true
      };
      const response = await getAnomalies(timeRange, anomalyConfig || defaultConfig);
      console.log('获取到的异常数据:', response);
      if (response && typeof response === 'object') {
        console.log(response);
        setAnomalies(response);
      } else {
        console.error('异常数据格式不正确:', response);
        message.error('获取异常数据失败：数据格式不正确');
      }
    } catch (error) {
      console.error('获取异常数据失败:', error);
      message.error('获取异常数据失败');
    } finally {
      setAnomalyLoading(false);
    }
  }, [timeRange, anomalyConfig]);

  // 获取异常检测配置
  const fetchAnomalyConfig = useCallback(async () => {
    try {
      const config = await getAnomalyConfig();
      setAnomalyConfig(config);
    } catch (error) {
      console.error('获取异常检测配置失败:', error);
      message.error('获取异常检测配置失败');
    }
  }, []);

  // 更新异常检测配置
  const updateConfig = async (config: AnomalyDetectionConfig) => {
    setAnomalyLoading(true);
    try {
      await updateAnomalyConfig(config);
      setAnomalyConfig(config);
      message.success('更新配置成功');
      await fetchAnomalies();
    } catch (error) {
      message.error('更新配置失败');
    }
    setAnomalyLoading(false);
  };

  // 获取告警规则
  const fetchAlertRules = async () => {
    setAlertLoading(true);
    try {
      const rules = await getAlertRules();
      setAlertRules(rules);
    } catch (error) {
      message.error('获取告警规则失败');
    }
    setAlertLoading(false);
  };

  // 更新告警规则
  const updateAlertRule = async (rule: AlertRule) => {
    setAlertLoading(true);
    try {
      await updateRule(rule);
      await fetchAlertRules();
      message.success('更新规则成功');
    } catch (error) {
      message.error('更新规则失败');
      throw error;
    }
    setAlertLoading(false);
  };

  // 删除告警规则
  const deleteAlertRule = async (id: string) => {
    setAlertLoading(true);
    try {
      await deleteRule(id);
      await fetchAlertRules();
      message.success('删除规则成功');
    } catch (error) {
      message.error('删除规则失败');
      throw error;
    }
    setAlertLoading(false);
  };

  // 获取告警历史
  const fetchAlertHistory = useCallback(async () => {
    if (!timeRange[0] || !timeRange[1]) return;
    
    try {
      setAlertLoading(true);
      const response = await getAlertHistory(timeRange);
      if (Array.isArray(response) && response.length > 0) {
        setAlertHistory(response);
      } else {
        // 如果没有数据或获取失败，使用模拟数据
        const mockHistory = generateMockAlertHistory(timeRange);
        setAlertHistory(mockHistory);
      }
    } catch (error) {
      console.error('获取告警历史失败:', error);
      // 发生错误时使用模拟数据
      const mockHistory = generateMockAlertHistory(timeRange);
      setAlertHistory(mockHistory);
    } finally {
      setAlertLoading(false);
    }
  }, [timeRange]);

  // 解决告警
  const resolveAlert = useCallback(async (id: string) => {
    try {
      setAlertLoading(true);
      await resolveAlertById(id);
      await fetchAlertHistory();
      message.success('告警已解决');
    } catch (error) {
      console.error('解决告警失败:', error);
      message.error('解决告警失败');
    } finally {
      setAlertLoading(false);
    }
  }, [fetchAlertHistory]);

  // 获取模型性能数据
  const fetchModelPerformanceData = useCallback(async () => {
    setModelLoading(true);
    try {
      const response = await getModelPerformanceData(timeRange, granularity);
      if (Array.isArray(response) && response.length > 0) {
        setModelPerformanceData(response);
      } else {
        // 如果没有数据或获取失败，使用模拟数据
        const mockData = generateMockModelData(timeRange, granularity);
        setModelPerformanceData(mockData);
      }
    } catch (error) {
      console.error('获取模型性能数据失败:', error);
      // 发生错误时使用模拟数据
      const mockData = generateMockModelData(timeRange, granularity);
      setModelPerformanceData(mockData);
    } finally {
      setModelLoading(false);
    }
  }, [timeRange, granularity]);

  // 获取告警分析数据
  const fetchAlertData = useCallback(async () => {
    if (!timeRange[0] || !timeRange[1]) return;
    
    setAlertLoading(true);
    try {
      const history = await getAlertHistory(timeRange);
      let alertHistoryData = Array.isArray(history) && history.length > 0 
        ? history 
        : generateMockAlertHistory(timeRange);

      // 限制数据量
      alertHistoryData = alertHistoryData.slice(0, 50);

      const alerts: AlertData[] = alertHistoryData.map(item => ({
        id: item.id,
        timestamp: item.timestamp,
        type: item.ruleName,
        severity: item.severity,
        message: `${item.metric} ${item.condition} ${item.threshold}`,
        status: item.status,
        resolvedAt: item.resolvedAt,
        metric: item.metric,
        value: item.value,
        threshold: item.threshold,
        ruleName: item.ruleName,
        condition: item.condition as 'gt' | 'lt' | 'eq',
        notificationsSent: [`已发送 ${item.notificationsSent} 次通知`],
      }));

      // 按小时聚合趋势数据
      const trendMap = new Map<string, { [key: string]: number }>();
      alertHistoryData.forEach(item => {
        const hour = dayjs(item.timestamp).startOf('hour').format('YYYY-MM-DD HH:00:00');
        if (!trendMap.has(hour)) {
          trendMap.set(hour, {});
        }
        const hourData = trendMap.get(hour)!;
        hourData[item.ruleName] = (hourData[item.ruleName] || 0) + 1;
      });

      const alertTrend = Array.from(trendMap.entries()).flatMap(([timestamp, counts]) => 
        Object.entries(counts).map(([type, count]) => ({ timestamp, type, count }))
      ).sort((a, b) => dayjs(a.timestamp).valueOf() - dayjs(b.timestamp).valueOf());

      const alertSummary = alertHistoryData.reduce<AlertSummary[]>((acc, item) => {
        const existingType = acc.find(t => t.type === item.ruleName);
        if (existingType) {
          existingType.count++;
        } else {
          acc.push({ type: item.ruleName, count: 1 });
        }
        return acc;
      }, []);

      setAlertData({
        alerts,
        alertTrend,
        alertSummary,
        totalAlerts: alertHistoryData.length,
        activeAlerts: alertHistoryData.filter(item => item.status === 'active').length,
        avgResolutionTime: alertHistoryData.reduce((acc, item) => {
          if (item.status === 'resolved' && item.resolvedAt) {
            const duration = dayjs(item.resolvedAt).diff(dayjs(item.timestamp), 'minute');
            return acc + duration;
          }
          return acc;
        }, 0) / alertHistoryData.filter(item => item.status === 'resolved').length || 0,
        criticalAlerts: alertHistoryData.filter(item => item.severity === 'critical').length,
      });
    } catch (error) {
      console.error('获取告警历史失败:', error);
    }
    setAlertLoading(false);
  }, [timeRange]);

  // 清除缓存
  const clearCache = useCallback(() => {
    cacheInstance.clearAll();
  }, []);

  // 初始化数据
  useEffect(() => {
    fetchPerformanceData();
    fetchCostData();
    fetchModelData();
    fetchSessionData();
    fetchAnomalies();
    fetchAnomalyConfig();
    fetchAlertRules();
    fetchAlertHistory();
    fetchModelPerformanceData();
  }, [timeRange, granularity]);

  return {
    timeRange,
    setTimeRange,
    granularity,
    setGranularity,
    performanceData,
    costData,
    modelData,
    sessionData,
    performanceLoading,
    costLoading,
    modelLoading,
    sessionLoading,
    anomalyConfig,
    setAnomalyConfig,
    anomalies,
    anomalyLoading,
    alertLoading,
    alertRules,
    alertHistory,
    modelPerformanceData,
    alertData,
    fetchPerformanceData,
    fetchCostData,
    fetchModelData,
    fetchSessionData,
    fetchAnomalies,
    fetchAnomalyConfig,
    fetchAlertRules,
    fetchAlertHistory,
    fetchModelPerformanceData,
    updateConfig,
    updateAlertRule,
    deleteAlertRule,
    resolveAlert,
  };
}; 