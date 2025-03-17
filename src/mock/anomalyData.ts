import { Request, Response } from 'express';
import dayjs from 'dayjs';
import type { Anomaly } from '@/services/anomalyDetection';
import type { AnomalyDetectionConfig } from '@/services/anomalyDetection';

// 生成模拟的异常数据
const generateMockAnomalies = (timeRange: [dayjs.Dayjs, dayjs.Dayjs], count: number = 50): Anomaly[] => {
  const metrics = [
    { name: 'responseTime', baseline: 500, variance: 200, unit: 'ms', warning: 800, critical: 1000 },
    { name: 'errorRate', baseline: 0.02, variance: 0.01, unit: '%', warning: 0.05, critical: 0.1 },
    { name: 'cpuUsage', baseline: 60, variance: 20, unit: '%', warning: 85, critical: 95 },
    { name: 'memoryUsage', baseline: 70, variance: 15, unit: '%', warning: 90, critical: 95 },
    { name: 'qps', baseline: 1000, variance: 300, unit: 'qps', warning: 1500, critical: 2000 }
  ];

  const anomalies: Anomaly[] = [];
  const startTime = timeRange[0];
  const duration = timeRange[1].diff(startTime, 'second');
  
  // 生成随机时间戳数组，减少数据量
  const timestamps = Array.from({ length: Math.min(count, 50) }, () => {
    const randomOffset = Math.floor(Math.random() * duration);
    return startTime.add(randomOffset, 'second');
  }).sort((a, b) => a.unix() - b.unix());

  // 为每个时间戳生成异常数据
  timestamps.forEach(timestamp => {
    const metric = metrics[Math.floor(Math.random() * metrics.length)];
    const value = metric.baseline + (Math.random() - 0.5) * metric.variance * 2;
    const severity = value > metric.critical ? 'high' : value > metric.warning ? 'medium' : 'low';
    
    if (severity !== 'low') {
      anomalies.push({
        id: `anomaly_${timestamp.unix()}`,
        timestamp: timestamp.toISOString(),
        metric: metric.name,
        value,
        severity,
        type: '性能异常',
        status: Math.random() > 0.3 ? 'resolved' : 'active',
      });
    }
  });

  return anomalies;
};

// 生成预测数据
const generatePredictions = (metric: string, startTime: string) => {
  const start = dayjs(startTime);
  const predictions = [];
  
  // 添加历史数据（过去12小时）
  for (let i = -12; i <= 0; i++) {
    const time = start.add(i, 'hour');
    const baseValue = metric === 'responseTime' ? 500 :
                     metric === 'errorRate' ? 0.02 :
                     metric === 'cpuUsage' ? 70 :
                     metric === 'memoryUsage' ? 75 : 1000;
    
    predictions.push({
      timestamp: time.format('YYYY-MM-DD HH:mm:ss'),
      value: baseValue + Math.sin(i * Math.PI / 12) * (baseValue * 0.2) + (Math.random() - 0.5) * (baseValue * 0.1),
      type: '实际值'
    });
  }

  // 添加预测数据（未来12小时）
  for (let i = 1; i <= 12; i++) {
    const time = start.add(i, 'hour');
    const baseValue = metric === 'responseTime' ? 500 :
                     metric === 'errorRate' ? 0.02 :
                     metric === 'cpuUsage' ? 70 :
                     metric === 'memoryUsage' ? 75 : 1000;
    
    predictions.push({
      timestamp: time.format('YYYY-MM-DD HH:mm:ss'),
      value: baseValue + Math.sin(i * Math.PI / 12) * (baseValue * 0.2) + (Math.random() - 0.5) * (baseValue * 0.1),
      type: '预测值'
    });
  }
  
  return predictions;
};

// 生成统计数据
const generateStats = (anomalies: Anomaly[]) => {
  const total = anomalies.length;
  const medium = anomalies.filter(a => a.severity === 'medium').length;
  const high = anomalies.filter(a => a.severity === 'high').length;
  
  const metricCounts = anomalies.reduce((acc, curr) => {
    acc[curr.metric] = (acc[curr.metric] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const hourlyDistribution = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: anomalies.filter(a => dayjs(a.timestamp).hour() === hour).length
  }));

  return {
    total,
    medium,
    high,
    metricCounts,
    hourlyDistribution,
    mttr: Math.floor(Math.random() * 30 + 15), // 平均修复时间（分钟）
    accuracy: 0.85 + Math.random() * 0.1 // 检测准确率
  };
};

// 生成模拟的异常统计数据
const generateMockAnomalyStats = () => {
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
};

export default {
  // 获取异常列表
  'GET /api/dashboard/anomalies': (req: Request, res: Response) => {
    const stats = generateMockAnomalyStats();
    
    res.send({
      code: 200,
      data: stats,
      message: 'success'
    });
  },

  // 获取异常预测
  'GET /api/dashboard/anomaly/prediction': (req: Request, res: Response) => {
    const { metric = 'responseTime', startTime = dayjs().toISOString() } = req.query;
    const predictions = generatePredictions(metric as string, startTime as string);
    
    res.send({
      code: 200,
      data: predictions,
      message: 'success'
    });
  },

  // 获取异常统计
  'GET /api/dashboard/anomaly/stats': (req: Request, res: Response) => {
    const stats = generateMockAnomalyStats();
    
    res.send({
      code: 200,
      data: stats,
      message: 'success'
    });
  }
}; 