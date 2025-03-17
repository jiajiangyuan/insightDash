import React, { useMemo } from 'react';
import { Table, Tag, Card, Space, Tooltip, Typography } from 'antd';
import { useModel } from '@umijs/max';
import type { Anomaly } from '@/services/anomalyDetection';
import dayjs from 'dayjs';
import ExportToolbar from '@/components/ExportToolbar';
import { WarningOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

// 生成模拟异常数据
const generateMockAnomalies = (timeRange: [dayjs.Dayjs, dayjs.Dayjs], count: number = 1000): Anomaly[] => {
  const metrics = [
    { name: 'responseTime', baseline: 500, variance: 200, unit: 'ms', warning: 800, critical: 1000 },
    { name: 'errorRate', baseline: 0.02, variance: 0.01, unit: '%', warning: 0.05, critical: 0.1 },
    { name: 'cpuUsage', baseline: 60, variance: 20, unit: '%', warning: 85, critical: 95 },
    { name: 'memoryUsage', baseline: 70, variance: 15, unit: '%', warning: 90, critical: 95 },
    { name: 'qps', baseline: 1000, variance: 300, unit: 'qps', warning: 1500, critical: 2000 },
    { name: 'latency', baseline: 100, variance: 50, unit: 'ms', warning: 200, critical: 300 },
  ];

  const anomalies: Anomaly[] = [];
  const startTime = timeRange[0];
  const duration = timeRange[1].diff(startTime, 'second');
  
  // 生成随机时间戳数组
  const timestamps = Array.from({ length: count }, () => {
    const randomOffset = Math.floor(Math.random() * duration);
    return startTime.add(randomOffset, 'second');
  }).sort((a, b) => a.unix() - b.unix());

  // 为每个时间戳生成异常数据
  timestamps.forEach(timestamp => {
    const metric = metrics[Math.floor(Math.random() * metrics.length)];
    const value = metric.baseline + (Math.random() - 0.5) * metric.variance * 3;
    const isCritical = value > metric.critical;
    const isWarning = !isCritical && value > metric.warning;
    
    if (isWarning || isCritical) {
      const expectedRange: [number, number] = [
        metric.baseline - metric.variance,
        metric.baseline + metric.variance
      ];
      
      anomalies.push({
        timestamp: timestamp.toISOString(),
        metric: metric.name,
        value,
        expectedRange,
        severity: isCritical ? 'critical' : 'warning',
        description: `${metric.name} 异常：当前值 ${value.toFixed(2)}${metric.unit}，预期范围 ${expectedRange[0].toFixed(2)}${metric.unit} - ${expectedRange[1].toFixed(2)}${metric.unit}`
      });
    }
  });

  return anomalies;
};

const AnomalyList: React.FC = () => {
  const {
    anomalies: realAnomalies,
    anomalyLoading: loading,
    timeRange,
  } = useModel('dashboard');

  // 使用真实数据或模拟数据
  const anomalies = useMemo(() => {
    if (Array.isArray(realAnomalies) && realAnomalies.length > 0) {
      return realAnomalies;
    }
    return generateMockAnomalies(timeRange);
  }, [realAnomalies, timeRange]);

  const columns = [
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
      width: 180,
    },
    {
      title: '指标',
      dataIndex: 'metric',
      key: 'metric',
      width: 120,
    },
    {
      title: '当前值',
      dataIndex: 'value',
      key: 'value',
      render: (value: number) => value.toFixed(2),
      width: 100,
    },
    {
      title: '预期范围',
      dataIndex: 'expectedRange',
      key: 'expectedRange',
      render: (range: [number, number]) => `${range[0].toFixed(2)} - ${range[1].toFixed(2)}`,
      width: 150,
    },
    {
      title: '严重程度',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: 'warning' | 'critical') => (
        <Tag color={severity === 'warning' ? 'warning' : 'error'} icon={severity === 'warning' ? <WarningOutlined /> : <CloseCircleOutlined />}>
          {severity === 'warning' ? '警告' : '严重'}
        </Tag>
      ),
      width: 100,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => (
        <Tooltip title={text}>
          <Text ellipsis style={{ maxWidth: 300 }}>{text}</Text>
        </Tooltip>
      ),
    },
  ];

  return (
    <Card 
      title="异常检测列表" 
      variant="outlined"
      extra={
        <Space>
          <ExportToolbar
            data={anomalies}
            filename={`anomalies-${dayjs().format('YYYY-MM-DD')}`}
            title="异常检测数据"
            columns={columns}
          />
        </Space>
      }
    >
      <Table
        dataSource={anomalies}
        columns={columns}
        rowKey={record => `${record.timestamp}-${record.metric}`}
        loading={loading}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条异常`,
        }}
        scroll={{ x: 1000 }}
      />
    </Card>
  );
};

export default AnomalyList; 