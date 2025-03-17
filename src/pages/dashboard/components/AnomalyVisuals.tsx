import React, { useMemo } from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { Line, Pie } from '@ant-design/charts';
import { useModel } from '@umijs/max';
import type { AnomalyStats } from '@/services/anomalyDetection';

interface MetricCount {
  type: string;
  count: number;
}

const AnomalyVisuals: React.FC = () => {
  const { anomalies, anomalyLoading } = useModel('dashboard');

  // 添加调试日志
  console.log('异常数据:', anomalies);
  console.log('异常类型分布:', anomalies?.byType);
  console.log('加载状态:', anomalyLoading);

  // 计算统计数据
  const anomalyStats = useMemo(() => {
    console.log('计算统计数据，anomalies:', anomalies);
    return {
      total: anomalies?.total || 0,
      warnings: anomalies?.bySeverity?.find(item => item.severity === 'medium')?.count || 0,
      criticals: anomalies?.bySeverity?.find(item => item.severity === 'high')?.count || 0,
    };
  }, [anomalies]);

  // 获取指标的中文名称
  const getMetricName = (metric: string): string => {
    const metricMap: Record<string, string> = {
      responseTime: '响应时间',
      errorRate: '错误率',
      cpuUsage: 'CPU使用率',
      memoryUsage: '内存使用率',
      requestCount: '请求数',
    };
    return metricMap[metric] || metric;
  };

  // 趋势图配置
  const trendConfig = {
    data: [
      { timestamp: '2024-01-01 00:00:00', value: 12 },
      { timestamp: '2024-01-01 01:00:00', value: 15 },
      { timestamp: '2024-01-01 02:00:00', value: 8 },
      { timestamp: '2024-01-01 03:00:00', value: 20 },
      { timestamp: '2024-01-01 04:00:00', value: 10 },
      { timestamp: '2024-01-01 05:00:00', value: 18 },
      { timestamp: '2024-01-01 06:00:00', value: 14 },
      { timestamp: '2024-01-01 07:00:00', value: 16 },
      { timestamp: '2024-01-01 08:00:00', value: 22 },
      { timestamp: '2024-01-01 09:00:00', value: 19 },
      { timestamp: '2024-01-01 10:00:00', value: 13 },
      { timestamp: '2024-01-01 11:00:00', value: 17 },
    ],
    xField: 'timestamp',
    yField: 'value',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
    meta: {
      timestamp: {
        alias: '时间',
      },
      value: {
        alias: '异常值',
      },
    },
  };

console.log(anomalies);

  // 分布图配置
  const distributionConfig = {
    data: anomalies?.byType || [],
    angleField: 'count',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'inner',
      offset: '-50%',
      content: '{type} {percentage}%',
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
  };

  // 添加调试日志
  console.log('分布图配置:', distributionConfig);

  return (
    <Card loading={anomalyLoading}>
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Statistic
            title="异常总数"
            value={anomalyStats.total}
            suffix="个"
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="警告数量"
            value={anomalyStats.warnings}
            suffix="个"
            valueStyle={{ color: '#faad14' }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="严重数量"
            value={anomalyStats.criticals}
            suffix="个"
            valueStyle={{ color: '#f5222d' }}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="异常趋势" variant="outlined">
            <Line {...trendConfig} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="异常分布" variant="outlined">
            <Pie {...distributionConfig} />
          </Card>
        </Col>
      </Row>
    </Card>
  );
};

export default AnomalyVisuals; 