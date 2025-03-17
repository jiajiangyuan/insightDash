import { Request, Response } from 'express';
import dayjs from 'dayjs';
import { TimeGranularity } from '@/models/dashboard';

// 生成时间序列数据
const generateTimeSeriesData = (startTime: dayjs.Dayjs, endTime: dayjs.Dayjs, granularity: TimeGranularity) => {
  const data = [];
  let current = startTime;
  
  const intervalMap = {
    hour: 'hour',
    day: 'day',
    week: 'week',
    month: 'month',
  };

  while (current.isBefore(endTime) || current.isSame(endTime)) {
    data.push({
      timestamp: current.format('YYYY-MM-DD HH:mm:ss'),
      requestCount: Math.floor(Math.random() * 1000) + 100,
      responseTime: Math.floor(Math.random() * 500) + 100,
      errorRate: Math.random() * 5,
      cpuUsage: Math.floor(Math.random() * 40) + 30,
      memoryUsage: Math.floor(Math.random() * 30) + 40,
      gpuUsage: Math.floor(Math.random() * 50) + 30,
      cost: Math.random() * 100 + 50,
    });
    current = current.add(1, intervalMap[granularity]);
  }

  return data;
};

// 性能概览数据
export default {
  'GET /api/dashboard/overview': (req: Request, res: Response) => {
    const { startTime, endTime, granularity = 'hour' } = req.query;
    
    const data = generateTimeSeriesData(
      dayjs(startTime as string),
      dayjs(endTime as string),
      granularity as TimeGranularity
    );

    const lastRecord = data[data.length - 1];
    
    res.json({
      success: true,
      data: {
        summary: {
          totalRequests: data.reduce((sum, item) => sum + item.requestCount, 0),
          avgResponseTime: Math.floor(data.reduce((sum, item) => sum + item.responseTime, 0) / data.length),
          errorRate: lastRecord.errorRate,
          successRate: 100 - lastRecord.errorRate,
          cpuUsage: lastRecord.cpuUsage,
          memoryUsage: lastRecord.memoryUsage,
          gpuUsage: lastRecord.gpuUsage,
        },
        trends: data,
      },
    });
  },

  // 模型性能数据
  'GET /api/dashboard/models': (req: Request, res: Response) => {
    res.json({
      success: true,
      data: [
        {
          name: 'GPT-4',
          responseTime: 800,
          successRate: 99.5,
          quality: 9.8,
          cost: 0.08,
          requestCount: 5000,
        },
        {
          name: 'GPT-3.5',
          responseTime: 400,
          successRate: 98.5,
          quality: 8.5,
          cost: 0.02,
          requestCount: 15000,
        },
        {
          name: 'Claude',
          responseTime: 600,
          successRate: 99.0,
          quality: 9.2,
          cost: 0.05,
          requestCount: 8000,
        },
      ],
    });
  },

  // 成本分析数据
  'GET /api/dashboard/costs': (req: Request, res: Response) => {
    const { startTime, endTime, granularity = 'day' } = req.query;
    
    const data = generateTimeSeriesData(
      dayjs(startTime as string),
      dayjs(endTime as string),
      granularity as TimeGranularity
    );

    res.json({
      success: true,
      data: {
        totalCost: data.reduce((sum, item) => sum + item.cost, 0),
        trends: data.map(item => ({
          date: item.timestamp,
          cost: item.cost,
        })),
        modelDistribution: [
          { model: 'GPT-4', cost: 450 },
          { model: 'GPT-3.5', cost: 300 },
          { model: 'Claude', cost: 250 },
        ],
      },
    });
  },

  // 用户会话数据
  'GET /api/dashboard/sessions': (req: Request, res: Response) => {
    const sessions = Array.from({ length: 10 }, (_, index) => ({
      key: (index + 1).toString(),
      userId: `user_${(index + 1).toString().padStart(3, '0')}`,
      duration: Math.floor(Math.random() * 600) + 60,
      interactions: Math.floor(Math.random() * 20) + 1,
      satisfaction: Math.floor(Math.random() * 5 * 2) / 2 + 2.5,
      completionRate: Math.floor(Math.random() * 30) + 70,
      timestamp: dayjs().subtract(index, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    }));

    const activityData = Array.from({ length: 24 }, (_, index) => ({
      time: index.toString().padStart(2, '0') + ':00',
      users: Math.floor(Math.random() * 100) + 20,
    }));

    res.json({
      success: true,
      data: {
        sessions,
        activityData,
      },
    });
  },
}; 