import React from 'react';
import { Card, Row, Col, Statistic, Table } from 'antd';
import { Line, Pie } from '@ant-design/charts';

interface SessionData {
  timestamp: string;
  count: number;
  type: string;
}

interface UserType {
  type: string;
  count: number;
}

interface SessionAnalysisData {
  sessionTrend: SessionData[];
  userTypes: UserType[];
  totalSessions: number;
  averageDuration: number;
  completionRate: number;
  activeUsers: number;
}

interface ReportSessionSectionProps {
  data: SessionAnalysisData;
}

const ReportSessionSection: React.FC<ReportSessionSectionProps> = ({ data }) => {
  // 会话趋势配置
  const sessionTrendConfig = {
    data: data.sessionTrend,
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

  // 用户类型分布配置
  const userTypeConfig = {
    data: data.userTypes,
    angleField: 'count',
    colorField: 'type',
    radius: 0.8,
    label: {
      position: 'outside',
      formatter: (datum: UserType) => 
        `${datum.type}: ${((datum.count / data.totalSessions) * 100).toFixed(1)}%`,
    },
    tooltip: {
      formatter: (datum: UserType) => ({
        name: datum.type,
        value: datum.count,
      }),
    },
  };

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Statistic
            title="总会话数"
            value={data.totalSessions}
            precision={0}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="平均会话时长"
            value={data.averageDuration}
            precision={2}
            suffix="分钟"
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="会话完成率"
            value={data.completionRate}
            precision={2}
            suffix="%"
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="活跃用户数"
            value={data.activeUsers}
            precision={0}
          />
        </Col>
      </Row>

      <Card title="会话趋势" style={{ marginTop: 16 }}>
        <Line {...sessionTrendConfig} />
      </Card>

      <Card title="用户类型分布" style={{ marginTop: 16 }}>
        <Pie {...userTypeConfig} />
      </Card>
    </div>
  );
};

export default ReportSessionSection; 