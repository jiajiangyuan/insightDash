import React, { useEffect } from 'react';
import { Card, Row, Col, Statistic, Spin, Table, Tag, Tooltip } from 'antd';
import { Line, Gauge } from '@ant-design/charts';
import { useModel } from '@umijs/max';
import { InfoCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { SessionData, SessionStats, PlatformStat, FeatureUsage, HourlyActivity, SessionAnalysisData } from '@/types/session';
import ExportToolbar from '@/components/ExportToolbar';

const SessionAnalysis: React.FC = () => {
  const {
    sessionData,
    sessionLoading: loading,
    timeRange,
    granularity,
    fetchSessionData,
  } = useModel('dashboard');

  useEffect(() => {
    fetchSessionData();
  }, [timeRange, granularity]);

  // 计算统计数据
  const stats = React.useMemo<SessionStats>(() => {
    const sessions = Array.isArray(sessionData) ? sessionData : [];
    
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        avgDuration: 0,
        avgSatisfaction: '0.0',
        avgCompletionRate: '0.0',
      };
    }

    const totalSessions = sessions.length;
    const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const totalSatisfaction = sessions.reduce((sum, s) => sum + (s.satisfactionScore || 0), 0);
    const totalCompletionRate = sessions.reduce((sum, s) => sum + (s.completionRate || 0), 0);

    return {
      totalSessions,
      avgDuration: Math.floor(totalDuration / totalSessions),
      avgSatisfaction: (totalSatisfaction / totalSessions).toFixed(1),
      avgCompletionRate: (totalCompletionRate / totalSessions).toFixed(1),
    };
  }, [sessionData]);

  // 计算每小时活跃度
  const hourlyActivity = React.useMemo<HourlyActivity[]>(() => {
    const sessions = Array.isArray(sessionData) ? sessionData : [];
    const hourlyData = Array(24).fill(0).map((_, hour) => ({
      hour,
      count: 0,
    }));

    sessions.forEach(session => {
      if (session.timestamp) {
        const hour = dayjs(session.timestamp).hour();
        hourlyData[hour].count++;
      }
    });

    return hourlyData;
  }, [sessionData]);

  // 计算平台分布
  const platformStats = React.useMemo<PlatformStat[]>(() => {
    const sessions = Array.isArray(sessionData) ? sessionData : [];
    
    if (sessions.length === 0) {
      return [];
    }

    const stats: Record<string, number> = {};
    sessions.forEach(session => {
      if (session.platform) {
        stats[session.platform] = (stats[session.platform] || 0) + 1;
      }
    });

    return Object.entries(stats).map(([platform, count]) => ({
      platform,
      count,
      percentage: Number(((count / sessions.length) * 100).toFixed(1)),
    }));
  }, [sessionData]);

  // 计算功能使用频率
  const featureUsage = React.useMemo<FeatureUsage[]>(() => {
    const sessions = Array.isArray(sessionData) ? sessionData : [];
    
    if (sessions.length === 0) {
      return [];
    }

    const usage: Record<string, number> = {};
    sessions.forEach(session => {
      if (Array.isArray(session.features)) {
        session.features.forEach(feature => {
          usage[feature] = (usage[feature] || 0) + 1;
        });
      }
    });

    return Object.entries(usage).map(([feature, count]) => ({
      feature,
      count,
      percentage: Number(((count / sessions.length) * 100).toFixed(1)),
    }));
  }, [sessionData]);

  // 计算平均消息数
  const avgMessageCount = React.useMemo(() => {
    const sessions = Array.isArray(sessionData) ? sessionData : [];
    
    if (sessions.length === 0) {
      return 0;
    }

    const totalMessages = sessions.reduce((sum, item) => sum + (item.messageCount || 0), 0);
    return (totalMessages / sessions.length).toFixed(1);
  }, [sessionData]);

  const satisfactionConfig = {
    percent: Number(stats.avgSatisfaction) / 100,
    range: {
      color: ['#ff4d4f', '#faad14', '#52c41a'],
    },
    indicator: {
      pointer: {
        style: {
          stroke: '#D0D0D0',
        },
      },
      pin: {
        style: {
          stroke: '#D0D0D0',
        },
      },
    },
    statistic: {
      content: {
        formatter: (value: number) => `${(value * 100).toFixed(1)}%`,
        style: {
          fontSize: '24px',
        },
      },
    },
  };

  const activityConfig = {
    data: hourlyActivity,
    xField: 'hour',
    yField: 'count',
    point: {
      size: 3,
      shape: 'circle',
    },
    tooltip: {
      formatter: (datum: any) => {
        return {
          name: '会话数',
          value: datum.count,
        };
      },
    },
    xAxis: {
      label: {
        formatter: (value: string) => `${value}:00`,
      },
    },
  };

  const columns = [
    {
      title: '会话ID',
      dataIndex: 'sessionId',
      key: 'sessionId',
      width: 200,
    },
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 200,
    },
    {
      title: '时长(分钟)',
      dataIndex: 'duration',
      key: 'duration',
      sorter: (a: SessionData, b: SessionData) => (a.duration || 0) - (b.duration || 0),
      render: (duration: number) => ((duration || 0) / 60).toFixed(1),
    },
    {
      title: '消息数',
      dataIndex: 'messageCount',
      key: 'messageCount',
      sorter: (a: SessionData, b: SessionData) => (a.messageCount || 0) - (b.messageCount || 0),
    },
    {
      title: '满意度',
      dataIndex: 'satisfactionScore',
      key: 'satisfactionScore',
      sorter: (a: SessionData, b: SessionData) => (a.satisfactionScore || 0) - (b.satisfactionScore || 0),
      render: (score: number) => {
        const value = score || 0;
        const color = value >= 80 ? '#52c41a' : value >= 60 ? '#faad14' : '#ff4d4f';
        return <Tag color={color}>{value}%</Tag>;
      },
    },
    {
      title: '完成率',
      dataIndex: 'completionRate',
      key: 'completionRate',
      sorter: (a: SessionData, b: SessionData) => (a.completionRate || 0) - (b.completionRate || 0),
      render: (rate: number) => `${((rate || 0) * 100).toFixed(1)}%`,
    },
    {
      title: '平台',
      dataIndex: 'platform',
      key: 'platform',
      filters: Array.isArray(sessionData) ? 
        [...new Set(sessionData.map(item => item.platform).filter(Boolean))].map(platform => ({
          text: platform,
          value: platform,
        })) : [],
      onFilter: (value: any, record: SessionData) => record.platform === value,
    },
    {
      title: '使用功能',
      dataIndex: 'features',
      key: 'features',
      render: (features: string[]) => (
        <span>
          {Array.isArray(features) ? features.map(feature => (
            <Tag key={feature}>{feature}</Tag>
          )) : null}
        </span>
      ),
    },
  ];

  const defaultFields = [
    'sessionId',
    'userId',
    'duration',
    'messageCount',
    'satisfactionScore',
    'completionRate',
    'platform',
    'errorCount',
    'features',
  ];

  const fieldLabels = {
    sessionId: '会话ID',
    userId: '用户ID',
    duration: '时长(分钟)',
    messageCount: '消息数',
    satisfactionScore: '满意度(%)',
    completionRate: '完成率(%)',
    platform: '平台',
    errorCount: '错误数',
    features: '使用功能',
  };

  return (
    <Spin spinning={loading}>
      <Card title="用户会话分析">
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <ExportToolbar
              data={sessionData}
              filename={`session-analysis-${dayjs().format('YYYY-MM-DD')}`}
              title="会话分析数据"
              columns={[
                { title: '会话ID', dataIndex: 'sessionId' },
                { title: '用户ID', dataIndex: 'userId' },
                { title: '时长(分钟)', dataIndex: 'duration' },
                { title: '消息数', dataIndex: 'messageCount' },
                { title: '满意度(%)', dataIndex: 'satisfactionScore' },
                { title: '完成率(%)', dataIndex: 'completionRate' },
                { title: '平台', dataIndex: 'platform' },
                { title: '错误数', dataIndex: 'errorCount' },
                { title: '使用功能', dataIndex: 'features' },
              ]}
            />
          </Col>
          <Col span={6}>
            <Card className="metric-card" bordered={false}>
              <Statistic
                title={
                  <span>
                    平均会话时长
                    <Tooltip title="单位：秒">
                      <InfoCircleOutlined style={{ marginLeft: 8 }} />
                    </Tooltip>
                  </span>
                }
                value={stats.avgDuration}
                suffix="秒"
                precision={0}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="metric-card" bordered={false}>
              <Statistic
                title="平均消息数"
                value={Number(avgMessageCount)}
                suffix="条/会话"
                precision={1}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="metric-card" bordered={false}>
              <Statistic
                title="总会话数"
                value={stats.totalSessions}
                precision={0}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="metric-card" bordered={false}>
              <Statistic
                title="平均完成率"
                value={stats.avgCompletionRate}
                suffix="%"
                precision={1}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="用户满意度" size="small">
              <Gauge {...satisfactionConfig} height={200} />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="每小时活跃度" size="small">
              <Line {...activityConfig} height={200} />
            </Card>
          </Col>
          <Col span={24}>
            <Card title="平台分布" size="small">
              <Row gutter={[16, 16]}>
                {platformStats.map(({ platform, count, percentage }) => (
                  <Col span={6} key={platform}>
                    <Statistic
                      title={platform}
                      value={percentage}
                      suffix="%"
                      precision={1}
                      prefix={`${count}个会话 - `}
                    />
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
          <Col span={24}>
            <Card title="功能使用频率" size="small">
              <Row gutter={[16, 16]}>
                {featureUsage.map(({ feature, count, percentage }) => (
                  <Col span={6} key={feature}>
                    <Statistic
                      title={feature}
                      value={percentage}
                      suffix="%"
                      precision={1}
                      prefix={`${count}次使用 - `}
                    />
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
          <Col span={24}>
            <Card title="会话详情" size="small">
              <Table
                columns={columns}
                dataSource={sessionData}
                rowKey="sessionId"
                scroll={{ x: true }}
                pagination={{
                  pageSize: 10,
                  showQuickJumper: true,
                  showSizeChanger: true,
                  showTotal: total => `共 ${total} 条记录`,
                }}
              />
            </Card>
          </Col>
        </Row>
      </Card>
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
        `}
      </style>
    </Spin>
  );
};

export default SessionAnalysis; 