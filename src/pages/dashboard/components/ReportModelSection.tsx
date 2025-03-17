import React from 'react';
import { Card, Row, Col, Statistic, Table } from 'antd';
import { Line, Radar } from '@ant-design/charts';

interface ModelMetric {
  timestamp: string;
  value: number;
  model: string;
  metric: string;
}

interface ModelComparison {
  model: string;
  accuracy: number;
  latency: number;
  costPerToken: number;
  reliability: number;
  satisfaction: number;
}

interface ReportModelSectionProps {
  data: {
    metrics: ModelMetric[];
    comparisons: ModelComparison[];
    bestPerformer: string;
    averageLatency: number;
    averageAccuracy: number;
  };
}

const ReportModelSection: React.FC<ReportModelSectionProps> = ({ data }) => {
  // 性能指标趋势配置
  const metricTrendConfig = {
    data: data.metrics,
    xField: 'timestamp',
    yField: 'value',
    seriesField: 'model',
    groupField: 'metric',
    point: {
      size: 5,
      shape: 'diamond',
    },
    label: {
      style: {
        fill: '#aaa',
      },
    },
  };

  // 模型对比雷达图配置
  const radarConfig = {
    data: data.comparisons.map(item => ([
      { metric: '准确率', value: item.accuracy, model: item.model },
      { metric: '延迟', value: item.latency, model: item.model },
      { metric: '成本效率', value: item.costPerToken, model: item.model },
      { metric: '可靠性', value: item.reliability, model: item.model },
      { metric: '满意度', value: item.satisfaction, model: item.model },
    ])).flat(),
    xField: 'metric',
    yField: 'value',
    seriesField: 'model',
    meta: {
      value: {
        min: 0,
        max: 100,
      },
    },
    area: {},
    point: {},
    legend: {
      position: 'top',
    },
  };

  // 表格列定义
  const columns = [
    {
      title: '模型',
      dataIndex: 'model',
      key: 'model',
    },
    {
      title: '准确率',
      dataIndex: 'accuracy',
      key: 'accuracy',
      render: (value: number) => `${value.toFixed(2)}%`,
      sorter: (a: ModelComparison, b: ModelComparison) => a.accuracy - b.accuracy,
    },
    {
      title: '平均延迟',
      dataIndex: 'latency',
      key: 'latency',
      render: (value: number) => `${value.toFixed(2)}ms`,
      sorter: (a: ModelComparison, b: ModelComparison) => a.latency - b.latency,
    },
    {
      title: '每Token成本',
      dataIndex: 'costPerToken',
      key: 'costPerToken',
      render: (value: number) => `¥${value.toFixed(4)}`,
      sorter: (a: ModelComparison, b: ModelComparison) => a.costPerToken - b.costPerToken,
    },
    {
      title: '可靠性',
      dataIndex: 'reliability',
      key: 'reliability',
      render: (value: number) => `${value.toFixed(2)}%`,
      sorter: (a: ModelComparison, b: ModelComparison) => a.reliability - b.reliability,
    },
    {
      title: '用户满意度',
      dataIndex: 'satisfaction',
      key: 'satisfaction',
      render: (value: number) => `${value.toFixed(2)}%`,
      sorter: (a: ModelComparison, b: ModelComparison) => a.satisfaction - b.satisfaction,
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Statistic
            title="最佳表现模型"
            value={data.bestPerformer}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="平均响应延迟"
            value={data.averageLatency}
            precision={2}
            suffix="ms"
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="平均准确率"
            value={data.averageAccuracy}
            precision={2}
            suffix="%"
          />
        </Col>
      </Row>

      <Card title="性能指标趋势" style={{ marginTop: 16 }}>
        <Line {...metricTrendConfig} />
      </Card>

      <Card title="模型综合评分" style={{ marginTop: 16 }}>
        <Radar {...radarConfig} />
      </Card>

      <Card title="模型详细对比" style={{ marginTop: 16 }}>
        <Table
          dataSource={data.comparisons}
          columns={columns}
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
};

export default ReportModelSection; 