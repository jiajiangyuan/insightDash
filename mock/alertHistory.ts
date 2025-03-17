import { Request, Response } from 'express';
import dayjs from 'dayjs';

interface AlertHistoryItem {
  id: string;
  timestamp: string;
  ruleName: string;
  metric: string;
  value: number;
  threshold: number;
  condition: string;
  severity: 'warning' | 'critical';
  status: 'active' | 'resolved';
  resolvedAt?: string;
  notificationsSent: number;
}

interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: {
    operator: '>' | '<' | '>=' | '<=';
    threshold: number;
    duration: number;
  };
  severity: 'warning' | 'critical';
  enabled: boolean;
  notificationChannels: string[];
  createdAt: string;
  updatedAt: string;
}

// 生成模拟的告警规则
const generateMockAlertRules = (): AlertRule[] => {
  return [
    {
      id: 'rule-1',
      name: '响应时间告警',
      metric: 'responseTime',
      condition: {
        operator: '>',
        threshold: 1000,
        duration: 300 // 5分钟
      },
      severity: 'warning',
      enabled: true,
      notificationChannels: ['email', 'slack'],
      createdAt: dayjs().subtract(7, 'day').format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss')
    },
    {
      id: 'rule-2',
      name: '错误率告警',
      metric: 'errorRate',
      condition: {
        operator: '>=',
        threshold: 5,
        duration: 300
      },
      severity: 'critical',
      enabled: true,
      notificationChannels: ['email', 'sms'],
      createdAt: dayjs().subtract(7, 'day').format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss')
    },
    {
      id: 'rule-3',
      name: 'CPU使用率告警',
      metric: 'cpuUsage',
      condition: {
        operator: '>',
        threshold: 90,
        duration: 600 // 10分钟
      },
      severity: 'critical',
      enabled: true,
      notificationChannels: ['email'],
      createdAt: dayjs().subtract(7, 'day').format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss')
    },
    {
      id: 'rule-4',
      name: '内存使用率告警',
      metric: 'memoryUsage',
      condition: {
        operator: '>=',
        threshold: 85,
        duration: 600
      },
      severity: 'warning',
      enabled: true,
      notificationChannels: ['email', 'slack'],
      createdAt: dayjs().subtract(7, 'day').format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss')
    }
  ];
};

// 生成模拟的告警历史数据
const generateMockAlertHistory = (startTime: string, endTime: string): AlertHistoryItem[] => {
  const rules = generateMockAlertRules();
  const history: AlertHistoryItem[] = [];
  
  const start = dayjs(startTime);
  const end = dayjs(endTime);
  let current = start;

  while (current.isBefore(end)) {
    // 每小时生成1-3条告警记录
    const alertCount = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < alertCount; i++) {
      const rule = rules[Math.floor(Math.random() * rules.length)];
      const severity = rule.severity;
      const status: 'active' | 'resolved' = Math.random() > 0.5 ? 'active' : 'resolved';
      const timestamp = current.format('YYYY-MM-DD HH:mm:ss');
      
      const alert: AlertHistoryItem = {
        id: `${timestamp}-${i}`,
        timestamp,
        ruleName: rule.name,
        metric: rule.metric,
        value: rule.condition.threshold + (Math.random() * 20 - 10), // 在阈值附近波动
        threshold: rule.condition.threshold,
        condition: rule.condition.operator,
        severity,
        status,
        notificationsSent: Math.floor(Math.random() * 3) + 1,
        resolvedAt: status === 'resolved' ? dayjs(timestamp).add(Math.floor(Math.random() * 60), 'minute').format('YYYY-MM-DD HH:mm:ss') : undefined
      };
      
      history.push(alert);
    }
    
    current = current.add(1, 'hour');
  }

  return history.sort((a, b) => dayjs(b.timestamp).valueOf() - dayjs(a.timestamp).valueOf());
};

export default {
  // 获取告警规则列表
  'GET /api/dashboard/alerts/rules': (req: Request, res: Response) => {
    const rules = generateMockAlertRules();
    res.send({
      code: 0,
      data: rules,
      message: 'success'
    });
  },

  // 获取告警历史记录
  'GET /api/dashboard/alerts/history': (req: Request, res: Response) => {
    const { startTime = dayjs().subtract(24, 'hour').toISOString(), endTime = dayjs().toISOString() } = req.query;
    const history = generateMockAlertHistory(startTime as string, endTime as string);
    
    res.send({
      code: 0,
      data: history,
      message: 'success'
    });
  },

  // 解决告警
  'PUT /api/dashboard/alerts/history/:id/resolve': (req: Request, res: Response) => {
    res.send({
      code: 0,
      data: null,
      message: 'success'
    });
  }
}; 