import React, { useState, useEffect } from 'react';
import { Card, Alert, Select, Empty, Spin } from 'antd';
import { Line } from '@ant-design/charts';
import { useModel } from '@umijs/max';
import { getAnomalyPrediction } from '@/services/dashboard';

const { Option } = Select;

const AnomalyPrediction: React.FC = () => {
  const { anomalyLoading } = useModel('dashboard');
  const [selectedMetric, setSelectedMetric] = useState<string>('responseTime');
  const [loading, setLoading] = useState(false);
  const [predictionData, setPredictionData] = useState<any[]>([]);

  // 获取预测数据
  const fetchPredictionData = async () => {
    setLoading(true);
    try {
      const data = await getAnomalyPrediction(selectedMetric);
      setPredictionData(data);
    } catch (error) {
      console.error('获取预测数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictionData();
  }, [selectedMetric]);

  const chartConfig = {
    data: predictionData,
    xField: 'timestamp',
    yField: 'value',
    seriesField: 'type',
    color: ['#1890ff', '#f5222d'],
    point: {
      size: 5,
      shape: 'diamond',
    },
    line: {
      style: {
        lineWidth: 2,
      },
    },
    meta: {
      value: {
        alias: selectedMetric === 'responseTime' ? '响应时间 (ms)' : '值',
      },
    },
  };

  const getMetricName = (metric: string): string => {
    const metricMap: Record<string, string> = {
      responseTime: '响应时间',
      errorRate: '错误率',
      requestCount: '请求数',
      cpuUsage: 'CPU使用率',
      memoryUsage: '内存使用率',
    };
    return metricMap[metric] || metric;
  };

  return (
    <Card
      title="异常预测"
      loading={anomalyLoading}
      extra={
        <Select
          value={selectedMetric}
          onChange={setSelectedMetric}
          style={{ width: 120 }}
        >
          <Option value="responseTime">响应时间</Option>
          <Option value="errorRate">错误率</Option>
          <Option value="requestCount">请求数</Option>
          <Option value="cpuUsage">CPU使用率</Option>
          <Option value="memoryUsage">内存使用率</Option>
        </Select>
      }
    >
      <Alert
        message="预测说明"
        description={`基于历史异常数据，预测未来24小时的${getMetricName(selectedMetric)}异常趋势。此预测仅供参考，实际情况可能会有所不同。`}
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
      <Spin spinning={loading}>
        {predictionData.length > 0 ? (
          <Line {...chartConfig} />
        ) : (
          <Empty description="暂无预测数据" />
        )}
      </Spin>
    </Card>
  );
};

export default AnomalyPrediction; 