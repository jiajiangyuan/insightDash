import React, { useMemo, useState } from 'react';
import { Card, Row, Col, Select, Radio, Tooltip, Space } from 'antd';
import { Line, Scatter, DualAxes } from '@ant-design/charts';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useModel } from '@umijs/max';
import dayjs from 'dayjs';

const { Option } = Select;

interface MetricData {
  timestamp: string;
  value: number;
  hour: number;
  dayOfWeek: number;
}

const AdvancedAnalysis: React.FC = () => {
  const { anomalies, anomalyLoading } = useModel('dashboard');
  const [selectedMetric, setSelectedMetric] = useState('responseTime');
  const [analysisType, setAnalysisType] = useState('seasonal');

  // 获取指标名称
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

  // 处理数据
  const processedData = useMemo(() => {
    return anomalies
      .filter(a => a.metric === selectedMetric)
      .map(a => {
        const date = dayjs(a.timestamp);
        return {
          timestamp: a.timestamp,
          value: a.value,
          hour: date.hour(),
          dayOfWeek: date.day(),
        };
      })
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [anomalies, selectedMetric]);

  // 季节性分析
  const seasonalAnalysis = useMemo(() => {
    const hourlyAvg = Array(24).fill(0).map((_, hour) => {
      const values = processedData.filter(d => d.hour === hour).map(d => d.value);
      return {
        hour,
        value: values.length ? values.reduce((a, b) => a + b) / values.length : 0,
      };
    });

    const dailyAvg = Array(7).fill(0).map((_, day) => {
      const values = processedData.filter(d => d.dayOfWeek === day).map(d => d.value);
      return {
        day,
        value: values.length ? values.reduce((a, b) => a + b) / values.length : 0,
      };
    });

    return { hourlyAvg, dailyAvg };
  }, [processedData]);

  // 移动平均分析
  const movingAverageAnalysis = useMemo(() => {
    const windowSize = 24; // 24小时移动窗口
    return processedData.map((point, index) => {
      const window = processedData.slice(Math.max(0, index - windowSize), index + 1);
      const avg = window.reduce((sum, p) => sum + p.value, 0) / window.length;
      return {
        timestamp: point.timestamp,
        original: point.value,
        average: avg,
      };
    });
  }, [processedData]);

  // 波动率分析
  const volatilityAnalysis = useMemo(() => {
    const windowSize = 24;
    return processedData.map((point, index) => {
      const window = processedData.slice(Math.max(0, index - windowSize), index + 1);
      const avg = window.reduce((sum, p) => sum + p.value, 0) / window.length;
      const variance = window.reduce((sum, p) => sum + Math.pow(p.value - avg, 2), 0) / window.length;
      const volatility = Math.sqrt(variance);
      return {
        timestamp: point.timestamp,
        value: point.value,
        volatility,
      };
    });
  }, [processedData]);

  // 渲染季节性分析图表
  const renderSeasonalAnalysis = () => {
    const hourlyConfig = {
      data: seasonalAnalysis.hourlyAvg,
      xField: 'hour',
      yField: 'value',
      meta: {
        hour: { alias: '小时' },
        value: { alias: getMetricName(selectedMetric) },
      },
      tooltip: {
        formatter: (datum: any) => ({
          name: '平均值',
          value: `${datum.value.toFixed(2)}${selectedMetric === 'responseTime' ? 'ms' : '%'}`,
        }),
      },
    };

    const dailyConfig = {
      data: seasonalAnalysis.dailyAvg,
      xField: 'day',
      yField: 'value',
      meta: {
        day: {
          alias: '星期',
          formatter: (v: number) => ['日', '一', '二', '三', '四', '五', '六'][v],
        },
        value: { alias: getMetricName(selectedMetric) },
      },
      tooltip: {
        formatter: (datum: any) => ({
          name: '平均值',
          value: `${datum.value.toFixed(2)}${selectedMetric === 'responseTime' ? 'ms' : '%'}`,
        }),
      },
    };

    return (
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="每日时段分布" bordered={false}>
            <Line {...hourlyConfig} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="星期分布" bordered={false}>
            <Line {...dailyConfig} />
          </Card>
        </Col>
      </Row>
    );
  };

  // 渲染移动平均分析图表
  const renderMovingAverageAnalysis = () => {
    const config = {
      data: [movingAverageAnalysis],
      xField: 'timestamp',
      yField: ['original', 'average'],
      meta: {
        original: { alias: '原始值' },
        average: { alias: '移动平均' },
      },
      geometryOptions: [
        { geometry: 'line', color: '#1890ff' },
        { geometry: 'line', color: '#f5222d', lineStyle: { lineDash: [4, 4] } },
      ],
      tooltip: {
        formatter: (datum: any) => ({
          name: datum.type === 'original' ? '原始值' : '移动平均',
          value: `${datum.value.toFixed(2)}${selectedMetric === 'responseTime' ? 'ms' : '%'}`,
        }),
      },
    };

    return (
      <Card title="移动平均分析" bordered={false}>
        <DualAxes {...config} />
      </Card>
    );
  };

  // 渲染波动率分析图表
  const renderVolatilityAnalysis = () => {
    const config = {
      data: volatilityAnalysis,
      xField: 'timestamp',
      yField: ['value', 'volatility'],
      meta: {
        value: { alias: getMetricName(selectedMetric) },
        volatility: { alias: '波动率' },
      },
      geometryOptions: [
        { geometry: 'line', color: '#1890ff' },
        { geometry: 'line', color: '#f5222d' },
      ],
      tooltip: {
        formatter: (datum: any) => ({
          name: datum.type === 'value' ? getMetricName(selectedMetric) : '波动率',
          value: datum.value.toFixed(2),
        }),
      },
    };

    return (
      <Card title="波动率分析" bordered={false}>
        <DualAxes {...config} />
      </Card>
    );
  };

  return (
    <Card
      title="高级趋势分析"
      loading={anomalyLoading}
      extra={
        <Space>
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
          <Radio.Group value={analysisType} onChange={e => setAnalysisType(e.target.value)}>
            <Radio.Button value="seasonal">
              季节性分析
              <Tooltip title="分析指标在不同时段和星期的分布规律">
                <InfoCircleOutlined style={{ marginLeft: 4 }} />
              </Tooltip>
            </Radio.Button>
            <Radio.Button value="movingAverage">
              移动平均
              <Tooltip title="使用24小时移动窗口计算平均值，反映整体趋势">
                <InfoCircleOutlined style={{ marginLeft: 4 }} />
              </Tooltip>
            </Radio.Button>
            <Radio.Button value="volatility">
              波动率分析
              <Tooltip title="分析指标的波动情况，帮助识别不稳定时期">
                <InfoCircleOutlined style={{ marginLeft: 4 }} />
              </Tooltip>
            </Radio.Button>
          </Radio.Group>
        </Space>
      }
    >
      {analysisType === 'seasonal' && renderSeasonalAnalysis()}
      {analysisType === 'movingAverage' && renderMovingAverageAnalysis()}
      {analysisType === 'volatility' && renderVolatilityAnalysis()}
    </Card>
  );
};

export default AdvancedAnalysis; 