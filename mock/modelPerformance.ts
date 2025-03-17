import { Request, Response } from 'express';
import dayjs from 'dayjs';
import type { ModelPerformanceData } from '@/services/dashboard';

// 生成模拟数据
const generateMockData = (startTime: string, endTime: string): ModelPerformanceData[] => {
  const models = ['GPT-4', 'Claude 2', 'Gemini Pro', 'LLaMA 2'];
  const data: ModelPerformanceData[] = [];
  
  const start = dayjs(startTime);
  const end = dayjs(endTime);
  
  // 生成每小时的数据点
  let currentTime = start;
  while (currentTime.isBefore(end)) {
    models.forEach(modelName => {
      // 基础值 + 随机波动
      const baseResponseTime = {
        'GPT-4': 800,
        'Claude 2': 600,
        'Gemini Pro': 400,
        'LLaMA 2': 1000
      }[modelName] || 500;
      
      const baseSuccessRate = {
        'GPT-4': 0.98,
        'Claude 2': 0.97,
        'Gemini Pro': 0.95,
        'LLaMA 2': 0.93
      }[modelName] || 0.95;
      
      const baseQualityScore = {
        'GPT-4': 9.5,
        'Claude 2': 9.2,
        'Gemini Pro': 8.8,
        'LLaMA 2': 8.5
      }[modelName] || 8.5;
      
      const baseCostPerToken = {
        'GPT-4': 0.00012,
        'Claude 2': 0.00008,
        'Gemini Pro': 0.00006,
        'LLaMA 2': 0.00003
      }[modelName] || 0.0001;

      data.push({
        modelName,
        timestamp: currentTime.toISOString(),
        responseTime: baseResponseTime + (Math.random() - 0.5) * 100,
        successRate: Math.min(1, Math.max(0, baseSuccessRate + (Math.random() - 0.5) * 0.05)),
        qualityScore: Math.min(10, Math.max(0, baseQualityScore + (Math.random() - 0.5))),
        tokenCount: Math.floor(Math.random() * 1000) + 500,
        costPerToken: baseCostPerToken + (Math.random() - 0.5) * 0.00001
      });
    });
    
    currentTime = currentTime.add(1, 'hour');
  }
  
  return data;
};

export default {
  'GET /api/dashboard/models/performance': (req: Request, res: Response) => {
    const { startTime = dayjs().subtract(24, 'hour').toISOString(), endTime = dayjs().toISOString() } = req.query;
    
    const mockData = generateMockData(startTime as string, endTime as string);
    
    res.send({
      code: 200,
      data: mockData,
      message: 'success',
    });
  },
}; 