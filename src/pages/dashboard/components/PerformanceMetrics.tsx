import React, { useEffect } from 'react';
import { Card, Row, Col, Statistic, Select, Spin } from 'antd';
import { Line } from '@ant-design/charts';
import { useModel } from '@umijs/max';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { PerformanceData } from '@/services/dashboard';

const { Option } = Select;

const PerformanceMetrics: React.FC = () => {
  const { 
    performanceData, 
    performanceLoading: loading, 
    timeRange, 
    setTimeRange, 
    granularity,
    setGranularity,
    fetchPerformanceData 
  } = useModel('dashboard');

  useEffect(() => {
    fetchPerformanceData();
  }, [timeRange, granularity]);

  // 计算同比变化
  const calculateChange = (data: PerformanceData[], metric: keyof PerformanceData) => {
    if (!data || data.length < 2) return 0;
    const current = data[data.length - 1][metric];
    const previous = data[data.length - 2][metric];
    return previous ? ((Number(current) - Number(previous)) / Number(previous)) * 100 : 0;
  };

  // 获取最新数据
  const getLatestMetric = (data: PerformanceData[], metric: keyof PerformanceData) => {
    return data && data.length > 0 ? data[data.length - 1][metric] : 0;
  };

  const responseTimeConfig = {
    data: performanceData,
    xField: 'timestamp',
    yField: 'responseTime',
    seriesField: 'type',
    color: '#1890ff',
    point: {
      size: 3,
      shape: 'circle',
    },
    tooltip: {
      formatter: (datum: PerformanceData) => {
        return {
          name: '响应时间',
          value: `${datum.responseTime}ms`,
        };
      },
    },
    xAxis: {
      label: {
        formatter: (text: string) => dayjs(text).format('MM-DD HH:mm'),
      },
    },
  };

  const errorRateConfig = {
    data: performanceData,
    xField: 'timestamp',
    yField: 'errorRate',
    seriesField: 'type',
    color: '#ff4d4f',
    point: {
      size: 3,
      shape: 'circle',
    },
    tooltip: {
      formatter: (datum: PerformanceData) => {
        return {
          name: '错误率',
          value: `${(Number(datum.errorRate) * 100).toFixed(2)}%`,
        };
      },
    },
    xAxis: {
      label: {
        formatter: (text: string) => {
          const date = dayjs(text);
          const now = dayjs();
          // 如果是今天的数据，只显示时间
          if (date.isSame(now, 'day')) {
            return date.format('HH:mm');
          }
          // 如果是最近7天的数据，显示"周几 HH:mm"
          if (date.isAfter(now.subtract(7, 'day'))) {
            return date.format('ddd HH:mm');
          }
          // 其他情况显示"MM-DD HH:mm"
          return date.format('MM-DD HH:mm');
        },
        autoRotate: true,
        autoHide: true,
      },
    },
  };

  const requestCountConfig = {
    data: performanceData,
    xField: 'timestamp',
    yField: 'requestCount',
    seriesField: 'type',
    color: '#52c41a',
    point: {
      size: 3,
      shape: 'circle',
    },
    tooltip: {
      formatter: (datum: PerformanceData) => {
        return {
          name: '请求数',
          value: datum.requestCount,
        };
      },
    },
    xAxis: {
      label: {
        formatter: (text: string) => {
          const date = dayjs(text);
          const now = dayjs();
          // 如果是今天的数据，只显示时间
          if (date.isSame(now, 'day')) {
            return date.format('HH:mm');
          }
          // 如果是最近7天的数据，显示"周几 HH:mm"
          if (date.isAfter(now.subtract(7, 'day'))) {
            return date.format('ddd HH:mm');
          }
          // 其他情况显示"MM-DD HH:mm"
          return date.format('MM-DD HH:mm');
        },
        autoRotate: true,
        autoHide: true,
      },
    },
  };

  return (
    <Spin spinning={loading}>
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card>
            <Statistic
              title="平均响应时间"
              value={getLatestMetric(performanceData, 'responseTime')}
              suffix="ms"
              precision={2}
              prefix={
                calculateChange(performanceData, 'responseTime') > 0 ? (
                  <ArrowUpOutlined style={{ color: '#ff4d4f' }} />
                ) : (
                  <ArrowDownOutlined style={{ color: '#52c41a' }} />
                )
              }
            />
            <div style={{ marginTop: 16 }}>
              <Line {...responseTimeConfig} height={200} />
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="错误率"
              value={Number(getLatestMetric(performanceData, 'errorRate')) * 100}
              suffix="%"
              precision={2}
              prefix={
                calculateChange(performanceData, 'errorRate') > 0 ? (
                  <ArrowUpOutlined style={{ color: '#ff4d4f' }} />
                ) : (
                  <ArrowDownOutlined style={{ color: '#52c41a' }} />
                )
              }
            />
            <div style={{ marginTop: 16 }}>
              <Line {...errorRateConfig} height={200} />
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="请求数"
              value={getLatestMetric(performanceData, 'requestCount')}
              precision={0}
              prefix={
                calculateChange(performanceData, 'requestCount') > 0 ? (
                  <ArrowUpOutlined style={{ color: '#52c41a' }} />
                ) : (
                  <ArrowDownOutlined style={{ color: '#ff4d4f' }} />
                )
              }
            />
            <div style={{ marginTop: 16 }}>
              <Line {...requestCountConfig} height={200} />
            </div>
          </Card>
        </Col>
      </Row>
      <Row style={{ marginTop: 16 }}>
        <Col span={24}>
          <Select
            value={granularity}
            onChange={setGranularity}
            style={{ width: 120 }}
          >
            <Option value="hour">小时</Option>
            <Option value="day">天</Option>
            <Option value="week">周</Option>
            <Option value="month">月</Option>
          </Select>
        </Col>
      </Row>
    </Spin>
  );
};

export default PerformanceMetrics; 