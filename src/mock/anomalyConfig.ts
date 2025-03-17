import { Request, Response } from 'express';
import type { AnomalyDetectionConfig } from '@/services/anomalyDetection';

// 生成默认的异常检测配置
const defaultConfig: AnomalyDetectionConfig = {
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

export default {
  'GET /api/dashboard/anomaly/config': (req: Request, res: Response) => {
    res.send({
      code: 200,
      data: defaultConfig,
      message: 'success'
    });
  },

  'PUT /api/dashboard/anomaly/config': (req: Request, res: Response) => {
    const newConfig = req.body as AnomalyDetectionConfig;
    // 在实际应用中，这里应该保存配置
    res.send({
      code: 200,
      data: newConfig,
      message: 'success'
    });
  }
}; 