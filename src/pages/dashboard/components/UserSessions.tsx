import React, { useEffect } from 'react';
import { Table, Rate, Progress, Card, Row, Col, Spin, Statistic, Space, DatePicker, Button, Tooltip } from 'antd';
import { Area, Column } from '@ant-design/charts';
import type { ColumnsType } from 'antd/es/table';
import { useModel } from '@umijs/max';
import ExportToolbar from '@/components/ExportToolbar';
import type { SessionData } from '@/types/session';
import dayjs, { ManipulateType } from 'dayjs';
import VirtualTable from '@/components/VirtualTable';
import type { RangePickerProps } from 'antd/es/date-picker';
import { ClockCircleOutlined, DownloadOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;

// 生成模拟数据
const generateMockData = (count: number): SessionData[] => {
  const platforms = ['Web', 'Mobile', 'Desktop', 'API'];
  const features = ['聊天', '文档生成', '代码分析', '数据可视化', '模型训练', '性能优化'];
  const statuses: SessionData['status'][] = ['active', 'completed', 'abandoned'];

  // 限制数据量
  const actualCount = Math.min(count, 100);

  return Array.from({ length: actualCount }, (_, index) => {
    const now = dayjs();
    const randomTime = now.subtract(Math.floor(Math.random() * 12), 'hour')
      .subtract(Math.floor(Math.random() * 30), 'minute');
    
    return {
      id: `user_${Math.floor(Math.random() * 1000)}`,
      timestamp: randomTime.toISOString(),
      duration: Math.floor(Math.random() * 1800), // 0-1800秒
      messageCount: Math.floor(Math.random() * 50),
      satisfactionScore: Math.floor(Math.random() * 100),
      completionRate: Math.random(),
      platform: platforms[Math.floor(Math.random() * platforms.length)],
      features: Array.from(
        { length: Math.floor(Math.random() * 2) + 1 }, // 减少特性数量
        () => features[Math.floor(Math.random() * features.length)]
      ).filter((value, index, self) => self.indexOf(value) === index),
      status: statuses[Math.floor(Math.random() * statuses.length)],
    };
  });
};

// 添加图表通用配置
const commonChartConfig = {
  animation: false,
  smooth: false,
  point: {
    size: 3,
    shape: 'circle',
  },
  xAxis: {
    tickCount: 6,
    label: {
      autoRotate: true,
      autoHide: true,
    }
  }
};

const UserSessions: React.FC = () => {
  const {
    sessionData,
    sessionLoading: loading,
    timeRange,
    granularity,
    fetchSessionData,
    setTimeRange,
  } = useModel('dashboard');

  // 预设时间范围
  const timeRanges: RangePickerProps['presets'] = [
    { label: '最近1小时', value: [dayjs().subtract(1, 'hour'), dayjs()] },
    { label: '最近6小时', value: [dayjs().subtract(6, 'hours'), dayjs()] },
    { label: '最近12小时', value: [dayjs().subtract(12, 'hours'), dayjs()] },
    { label: '最近24小时', value: [dayjs().subtract(24, 'hours'), dayjs()] },
    { label: '最近7天', value: [dayjs().subtract(7, 'days'), dayjs()] },
    { label: '最近30天', value: [dayjs().subtract(30, 'days'), dayjs()] },
  ];

  // 快捷时间范围按钮
  const quickRanges = [
    { label: '1小时', value: 1, unit: 'hour' as ManipulateType },
    { label: '6小时', value: 6, unit: 'hour' as ManipulateType },
    { label: '12小时', value: 12, unit: 'hour' as ManipulateType },
    { label: '24小时', value: 24, unit: 'hour' as ManipulateType },
  ];

  // 处理时间范围变化
  const handleTimeRangeChange = (dates: any) => {
    if (dates) {
      setTimeRange(dates);
    }
  };

  // 处理快捷时间范围选择
  const handleQuickRange = (value: number, unit: ManipulateType) => {
    const range: [dayjs.Dayjs, dayjs.Dayjs] = [dayjs().subtract(value, unit), dayjs()];
    setTimeRange(range);
    fetchSessionData();
  };

  useEffect(() => {
    // 默认选择最近1小时
    setTimeRange([dayjs().subtract(1, 'hour'), dayjs()]);
    fetchSessionData();
  }, []);

  // 确保数据是数组类型，如果没有数据则使用模拟数据
  const sessions = React.useMemo(() => {
    if (Array.isArray(sessionData) && sessionData.length > 0) {
      return sessionData;
    }
    // 生成50条模拟数据
    return generateMockData(50);
  }, [sessionData]);

  // 计算统计数据
  const stats = React.useMemo(() => {
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
  }, [sessions]);

  // 计算平台分布数据
  const platformData = React.useMemo(() => {
    if (!Array.isArray(sessions) || sessions.length === 0) {
      return [];
    }

    const platformCounts = sessions.reduce((acc, session) => {
      const platform = session.platform || '未知';
      acc[platform] = (acc[platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(platformCounts).map(([platform, count]) => ({
      platform,
      count,
    }));
  }, [sessions]);

  // 计算会话趋势数据
  const sessionTrendData = React.useMemo(() => {
    if (!Array.isArray(sessions) || sessions.length === 0) {
      return [];
    }

    // 按小时统计会话数量
    const hourlyData = sessions.reduce((acc, session) => {
      const hour = dayjs(session.timestamp).format('YYYY-MM-DD HH:00:00');
      const status = session.status || 'unknown';
      
      if (!acc[hour]) {
        acc[hour] = {
          active: 0,
          completed: 0,
          abandoned: 0,
        };
      }
      acc[hour][status]++;
      return acc;
    }, {} as Record<string, Record<string, number>>);

    // 转换为图表数据格式
    return Object.entries(hourlyData).flatMap(([timestamp, counts]) => 
      Object.entries(counts).map(([type, value]) => ({
        timestamp,
        type,
        value,
      }))
    ).sort((a, b) => dayjs(a.timestamp).unix() - dayjs(b.timestamp).unix());
  }, [sessions]);

  // 准备导出数据
  const exportData = React.useMemo(() => {
    if (!Array.isArray(sessions)) {
      return [];
    }

    try {
      return sessions.map(session => ({
        id: session.id || '',
        duration: String(session.duration || 0),
        messageCount: String(session.messageCount || 0),
        satisfactionScore: String(session.satisfactionScore || 0),
        completionRate: String(session.completionRate || 0),
        timestamp: session.timestamp ? dayjs(session.timestamp).format('YYYY-MM-DD HH:mm:ss') : '',
        platform: session.platform || '',
        features: Array.isArray(session.features) ? session.features.join(', ') : '',
        status: session.status || '',
      }));
    } catch (error) {
      console.error('导出数据处理错误:', error);
      return [];
    }
  }, [sessions]);

  const columns: ColumnsType<SessionData> = [
    {
      title: '用户ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      fixed: 'left',
    },
    {
      title: '会话时长',
      dataIndex: 'duration',
      key: 'duration',
      width: 120,
      render: (seconds: number) => `${Math.floor(seconds / 60)}分${seconds % 60}秒`,
      sorter: (a, b) => (a.duration || 0) - (b.duration || 0),
    },
    {
      title: '消息数',
      dataIndex: 'messageCount',
      key: 'messageCount',
      width: 100,
      sorter: (a, b) => (a.messageCount || 0) - (b.messageCount || 0),
    },
    {
      title: '满意度',
      dataIndex: 'satisfactionScore',
      key: 'satisfactionScore',
      width: 120,
      render: (score: number) => <Rate disabled defaultValue={score / 20} allowHalf />,
      sorter: (a, b) => (a.satisfactionScore || 0) - (b.satisfactionScore || 0),
    },
    {
      title: '完成率',
      dataIndex: 'completionRate',
      key: 'completionRate',
      width: 120,
      render: (rate: number) => (
        <Progress percent={rate * 100} size="small" status={rate < 0.9 ? 'exception' : 'success'} />
      ),
      sorter: (a, b) => (a.completionRate || 0) - (b.completionRate || 0),
    },
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (timestamp: string) => dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss'),
      sorter: (a, b) => dayjs(a.timestamp).unix() - dayjs(b.timestamp).unix(),
    },
    {
      title: '平台',
      dataIndex: 'platform',
      key: 'platform',
      width: 100,
    },
    {
      title: '使用功能',
      dataIndex: 'features',
      key: 'features',
      width: 200,
      render: (features: string[]) => (
        Array.isArray(features) ? features.join(', ') : ''
      ),
    },
  ];

  const exportColumns = [
    { title: '用户ID', dataIndex: 'id' },
    { title: '会话时长(秒)', dataIndex: 'duration' },
    { title: '消息数', dataIndex: 'messageCount' },
    { title: '满意度', dataIndex: 'satisfactionScore' },
    { title: '完成率', dataIndex: 'completionRate' },
    { title: '时间', dataIndex: 'timestamp' },
    { title: '平台', dataIndex: 'platform' },
    { title: '使用功能', dataIndex: 'features' },
    { title: '状态', dataIndex: 'status' },
  ];

  const areaConfig = {
    ...commonChartConfig,
    data: sessionTrendData,
    xField: 'timestamp',
    yField: 'value',
    seriesField: 'type',
    color: ['#1890ff', '#f5222d', '#52c41a'],
    areaStyle: {
      fillOpacity: 0.6,
    },
    meta: {
      value: {
        alias: '会话数',
      },
      timestamp: {
        alias: '时间',
        formatter: (v: string) => dayjs(v).format('HH:mm'),
      },
    },
  };

  const columnConfig = {
    ...commonChartConfig,
    data: platformData,
    xField: 'platform',
    yField: 'count',
    label: {
      position: 'top',
    },
    meta: {
      count: {
        alias: '会话数',
      },
      platform: {
        alias: '平台',
      },
    },
  };

  return (
    <Spin spinning={loading}>
      <Card title="用户会话列表" variant="outlined">
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Space 
              size="middle" 
              style={{ 
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 8
              }} 
            >
              <Space.Compact>
                {quickRanges.map(({ label, value, unit }) => (
                  <Tooltip key={label} title={`查看最近${label}的数据`}>
                    <Button
                      icon={<ClockCircleOutlined />}
                      onClick={() => handleQuickRange(value, unit)}
                      type={timeRange?.[0]?.isSame(dayjs().subtract(value, unit)) ? 'primary' : 'default'}
                    >
                      {label}
                    </Button>
                  </Tooltip>
                ))}
              </Space.Compact>
              <RangePicker
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                value={timeRange}
                onChange={handleTimeRangeChange}
                presets={timeRanges}
                allowClear={false}
                style={{ width: 400 }}
              />
              <ExportToolbar
                data={exportData}
                filename={`user-sessions-${dayjs().format('YYYY-MM-DD')}`}
                title="用户会话数据"
                columns={exportColumns}
              />
            </Space>
          </Col>
          <Col span={6}>
            <Card variant="outlined">
              <Statistic title="总会话数" value={stats.totalSessions} />
            </Card>
          </Col>
          <Col span={6}>
            <Card variant="outlined">
              <Statistic 
                title="平均会话时长" 
                value={Math.floor(stats.avgDuration / 60)} 
                suffix="分钟"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card variant="outlined">
              <Statistic 
                title="平均满意度" 
                value={stats.avgSatisfaction}
                suffix="%"
                precision={1}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card variant="outlined">
              <Statistic 
                title="平均完成率" 
                value={stats.avgCompletionRate}
                suffix="%"
                precision={1}
              />
            </Card>
          </Col>
          <Col span={24}>
            <VirtualTable
              columns={columns}
              dataSource={sessions}
              rowKey="id"
              scroll={{ x: 1200 }}
              height={500}
              size="middle"
              bordered
            />
          </Col>
        </Row>
      </Card>
    </Spin>
  );
};

export default UserSessions; 