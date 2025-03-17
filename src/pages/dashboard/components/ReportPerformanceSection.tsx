import React from 'react';
import { Card, Row, Col, Statistic, Table } from 'antd';
import { Line } from '@ant-design/charts';
import type { PerformanceData, ResponseTimeData, RequestData, ErrorData } from '@/types/performance';

interface ReportPerformanceSectionProps {
  data: PerformanceData;
}

const ReportPerformanceSection: React.FC<ReportPerformanceSectionProps> = ({ data }) => {
  // 计算平均响应时间
  const avgResponseTime = data.responseTime.reduce((acc: number, curr: ResponseTimeData) => acc + curr.value, 0) / data.responseTime.length;
  
  // 计算错误率
  const totalErrors = data.errors.reduce((acc: number, curr: ErrorData) => acc + curr.count, 0);
  const totalRequests = data.requests.reduce((acc: number, curr: RequestData) => acc + curr.count, 0);
  const errorRate = (totalErrors / totalRequests) * 100;

  // 响应时间趋势配置
  const responseTimeConfig = {
    data: data.responseTime,
    xField: 'timestamp',
    yField: 'value',
    seriesField: 'type',
    point: {
      size: 5,
      shape: 'diamond',
    },

  };

  // 请求量趋势配置
  const requestConfig = {
    data: data.requests,
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

  // 错误分布表格列定义
  const errorColumns = [
    {
      title: '错误类型',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: '发生次数',
      dataIndex: 'count',
      key: 'count',
    },
    {
      title: '占比',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (_: unknown, record: ErrorData) => `${((record.count / totalErrors) * 100).toFixed(2)}%`,
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Statistic
            title="平均响应时间"
            value={avgResponseTime}
            precision={2}
            suffix="ms"
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="总请求量"
            value={totalRequests}
            precision={0}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="错误率"
            value={errorRate}
            precision={2}
            suffix="%"
          />
        </Col>
      </Row>

      <Card title="响应时间趋势" style={{ marginTop: 16 }}>
        <Line {...responseTimeConfig} />
      </Card>

      <Card title="请求量趋势" style={{ marginTop: 16 }}>
        <Line {...requestConfig} />
      </Card>

      <Card title="错误分布" style={{ marginTop: 16 }}>
        <Table
          dataSource={data.errors}
          columns={errorColumns}
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
};

export default ReportPerformanceSection; 