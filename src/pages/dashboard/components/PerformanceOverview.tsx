import React, { useEffect } from 'react';
import { Card, Row, Col, Statistic, Spin, Tooltip, Progress, Radio, Space } from 'antd';
import { Line, Area } from '@ant-design/plots';
import { useModel } from '@umijs/max';
import {
  InfoCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CheckCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import ExportToolbar from '@/components/ExportToolbar';

const PerformanceOverview: React.FC = () => {
  const {
    performanceData,
    performanceLoading: loading,
    timeRange,
    setTimeRange,
    granularity,
    fetchPerformanceData,
  } = useModel('dashboard');

  useEffect(() => {
    fetchPerformanceData();
  }, [timeRange, granularity]);

  const handleTimeRangeChange = (value: string) => {
    const now = dayjs();
    switch (value) {
      case 'hour':
        setTimeRange([now.subtract(1, 'hour'), now]);
        break;
      case 'day':
        setTimeRange([now.subtract(1, 'day'), now]);
        break;
      case 'week':
        setTimeRange([now.subtract(1, 'week'), now]);
        break;
      default:
        break;
    }
  };

  // 计算性能指标
  const metrics = React.useMemo(() => {
    if (!performanceData?.requests?.length) {
      return {
        totalRequests: 0,
        avgResponseTime: 0,
        errorRate: 0,
        successRate: 0,
        peakRequests: 0,
        responseTimeChange: 0,
      };
    }

    const totalRequests = performanceData.requests.reduce((sum, item) => sum + item.count, 0);
    const avgResponseTime = performanceData.responseTime.reduce((sum, item) => sum + item.value, 0) / performanceData.responseTime.length;
    const totalErrors = performanceData.errors.reduce((sum, item) => sum + item.count, 0);
    const errorRate = (totalErrors / totalRequests) * 100;
    const successRate = 100 - errorRate;
    const peakRequests = Math.max(...performanceData.requests.map(item => item.count));
    
    // 计算响应时间变化趋势
    const firstHalf = performanceData.responseTime.slice(0, Math.floor(performanceData.responseTime.length / 2));
    const secondHalf = performanceData.responseTime.slice(Math.floor(performanceData.responseTime.length / 2));
    const firstHalfAvg = firstHalf.reduce((sum, item) => sum + item.value, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, item) => sum + item.value, 0) / secondHalf.length;
    const responseTimeChange = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;

    return {
      totalRequests,
      avgResponseTime,
      errorRate,
      successRate,
      peakRequests,
      responseTimeChange,
    };
  }, [performanceData]);

  const responseTimeConfig = {
    data: (performanceData?.responseTime || []).map(item => ({
      ...item,
      timestamp: dayjs(item.timestamp).format('MM-DD HH:mm'),
      value: Number(item.value) || 0,
    })),
    xField: 'timestamp',
    yField: 'value',
    smooth: true,
  
    line: {
      color: '#1890ff',
    },
  };

  const requestsConfig = {
    data: (performanceData?.requests || []).map(item => ({
      ...item,
      timestamp: dayjs(item.timestamp).format('MM-DD HH:mm'),
      count: Number(item.count) || 0,
      type: item.type || 'API请求',
    })),
    xField: 'timestamp',
    yField: 'count',
    seriesField: 'type',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
  };

  return (
    <Spin spinning={loading}>
      <style>
        {`
          .metric-card {
            background-color: #fafafa;
            border-radius: 8px;
            transition: all 0.3s;
          }
          .metric-card:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            transform: translateY(-2px);
          }
          .ant-card-head {
            border-bottom: 1px solid #f0f0f0;
          }
          .ant-statistic-title {
            color: #8c8c8c;
          }
          .ant-progress-bg {
            transition: all 0.3s;
          }
          .time-range-radio .ant-radio-button-wrapper {
            padding: 0 16px;
            color: rgba(0, 0, 0, 0.65);
          }
          .time-range-radio .ant-radio-button-wrapper:hover {
            color: #1890ff;
          }
          .time-range-radio .ant-radio-button-wrapper-checked {
            color: #1890ff;
            border-color: #1890ff;
          }
          .time-range-radio .ant-radio-button-wrapper-checked::before {
            background-color: #1890ff !important;
          }
        `}
      </style>
      <Card
        title="性能概览"
        extra={
          <Space>
            <Radio.Group
              className="time-range-radio"
              defaultValue="hour"
              onChange={(e) => handleTimeRangeChange(e.target.value)}
              optionType="button"
              buttonStyle="solid"
              size="small"
            >
              <Radio.Button value="hour">最近1小时</Radio.Button>
              <Radio.Button value="day">最近24小时</Radio.Button>
              <Radio.Button value="week">最近7天</Radio.Button>
            </Radio.Group>
            <ExportToolbar
              data={performanceData?.requests || []}
              filename={`performance-overview-${dayjs().format('YYYY-MM-DD')}`}
              title="性能数据"
              columns={[
                { title: '时间', dataIndex: 'timestamp' },
                { title: '请求数', dataIndex: 'count' },
                { title: '类型', dataIndex: 'type' },
              ]}
            />
          </Space>
        }
      >
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Card className="metric-card" bordered={false}>
              <Statistic
                title={
                  <span>
                    总请求量
                    <Tooltip title="当前时间范围内的API调用总次数">
                      <InfoCircleOutlined style={{ marginLeft: 8 }} />
                    </Tooltip>
                  </span>
                }
                value={metrics.totalRequests}
                precision={0}
                valueStyle={{ color: '#1890ff' }}
              />
              <div style={{ marginTop: 8 }}>
                <span style={{ fontSize: 12, color: '#8c8c8c' }}>
                  峰值: {metrics.peakRequests} 次/分钟
                </span>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card className="metric-card" bordered={false}>
              <Statistic
                title={
                  <span>
                    平均响应时间
                    <Tooltip title="API请求的平均响应时间">
                      <InfoCircleOutlined style={{ marginLeft: 8 }} />
                    </Tooltip>
                  </span>
                }
                value={metrics.avgResponseTime}
                precision={2}
                suffix="ms"
                valueStyle={{
                  color: metrics.responseTimeChange > 0 ? '#ff4d4f' : '#52c41a',
                }}
                prefix={
                  metrics.responseTimeChange > 0 ? (
                    <ArrowUpOutlined />
                  ) : (
                    <ArrowDownOutlined />
                  )
                }
              />
              <div style={{ marginTop: 8 }}>
                <span
                  style={{
                    fontSize: 12,
                    color: metrics.responseTimeChange > 0 ? '#ff4d4f' : '#52c41a',
                  }}
                >
                  {Math.abs(metrics.responseTimeChange).toFixed(1)}% 相比前期
                </span>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card className="metric-card" bordered={false}>
              <Statistic
                title={
                  <span>
                    成功率
                    <Tooltip title="请求成功率">
                      <InfoCircleOutlined style={{ marginLeft: 8 }} />
                    </Tooltip>
                  </span>
                }
                value={metrics.successRate}
                precision={2}
                suffix="%"
                valueStyle={{
                  color: metrics.successRate >= 99 ? '#52c41a' : '#faad14',
                }}
                prefix={
                  metrics.successRate >= 99 ? (
                    <CheckCircleOutlined />
                  ) : (
                    <WarningOutlined />
                  )
                }
              />
              <Progress
                percent={metrics.successRate}
                size="small"
                showInfo={false}
                strokeColor={metrics.successRate >= 99 ? '#52c41a' : '#faad14'}
                style={{ marginTop: 8 }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="metric-card" bordered={false}>
              <Statistic
                title={
                  <span>
                    错误率
                    <Tooltip title="请求错误率">
                      <InfoCircleOutlined style={{ marginLeft: 8 }} />
                    </Tooltip>
                  </span>
                }
                value={metrics.errorRate}
                precision={2}
                suffix="%"
                valueStyle={{
                  color: metrics.errorRate <= 1 ? '#52c41a' : '#ff4d4f',
                }}
              />
              <Progress
                percent={metrics.errorRate}
                size="small"
                showInfo={false}
                strokeColor={metrics.errorRate <= 1 ? '#52c41a' : '#ff4d4f'}
                style={{ marginTop: 8 }}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="响应时间趋势" bordered={false}>
              <Area {...responseTimeConfig} height={250} />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="请求量趋势" bordered={false}>
              <Line {...requestsConfig} height={250} />
            </Card>
          </Col>
        </Row>
      </Card>
    </Spin>
  );
};

export default PerformanceOverview;
