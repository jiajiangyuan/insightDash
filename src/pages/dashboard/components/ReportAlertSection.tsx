import React from 'react';
import { Card, Row, Col, Statistic, Table, Tag } from 'antd';
import { Line, Pie } from '@ant-design/charts';
import dayjs from 'dayjs';

interface AlertData {
  id: string;
  timestamp: string;
  type: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  status: 'active' | 'resolved';
  resolvedAt?: string;
  metric: string;
  value: number;
  threshold: number;
}

interface AlertSummary {
  type: string;
  count: number;
}

interface AlertAnalysisData {
  alerts: AlertData[];
  alertTrend: { timestamp: string; count: number; type: string }[];
  alertSummary: AlertSummary[];
  totalAlerts: number;
  activeAlerts: number;
  avgResolutionTime: number;
  criticalAlerts: number;
}

interface ReportAlertSectionProps {
  data: AlertAnalysisData;
}

const ReportAlertSection: React.FC<ReportAlertSectionProps> = ({ data }) => {
  // 告警趋势配置
  const alertTrendConfig = {
    data: data.alertTrend,
    xField: 'timestamp',
    yField: 'count',
    seriesField: 'type',
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

  // 告警类型分布配置
  const alertSummaryConfig = {
    data: data.alertSummary,
    angleField: 'count',
    colorField: 'type',
    radius: 0.8,
    label: {
      position: 'outside',
      content: (datum: AlertSummary) => 
        `${datum.type}: ${((datum.count / data.totalAlerts) * 100).toFixed(1)}%`,
    },
    tooltip: {
      formatter: (datum: AlertSummary) => ({
        name: datum.type,
        value: datum.count,
      }),
    },
  };

  // 告警列表列定义
  const columns = [
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (text: string) => dayjs(text).format('MM-DD HH:mm:ss'),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: '严重程度',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: string) => {
        const color = {
          critical: 'red',
          warning: 'orange',
          info: 'blue',
        }[severity];
        return <Tag color={color}>{severity.toUpperCase()}</Tag>;
      },
    },
    {
      title: '指标',
      dataIndex: 'metric',
      key: 'metric',
    },
    {
      title: '当前值/阈值',
      key: 'value',
      render: (_, record: AlertData) => `${record.value} / ${record.threshold}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'active' ? 'volcano' : 'green';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: '解决时间',
      dataIndex: 'resolvedAt',
      key: 'resolvedAt',
      render: (text?: string) => text ? dayjs(text).format('MM-DD HH:mm:ss') : '-',
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Statistic
            title="总告警数"
            value={data.totalAlerts}
            precision={0}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="活跃告警"
            value={data.activeAlerts}
            precision={0}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="平均解决时间"
            value={data.avgResolutionTime}
            precision={2}
            suffix="分钟"
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="严重告警"
            value={data.criticalAlerts}
            precision={0}
            valueStyle={{ color: '#cf1322' }}
          />
        </Col>
      </Row>

      <Card title="告警趋势" style={{ marginTop: 16 }}>
        <Line {...alertTrendConfig} />
      </Card>

      <Card title="告警类型分布" style={{ marginTop: 16 }}>
        <Pie {...alertSummaryConfig} />
      </Card>

      <Card title="告警详情" style={{ marginTop: 16 }}>
        <Table
          dataSource={data.alerts}
          columns={columns}
          pagination={{ pageSize: 5 }}
          size="small"
        />
      </Card>
    </div>
  );
};

export default ReportAlertSection; 