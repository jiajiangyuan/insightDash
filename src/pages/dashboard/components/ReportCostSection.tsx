import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { Line, Pie } from '@ant-design/charts';

interface CostData {
  timestamp: string;
  cost: number;
  type: string;
}

interface CostBreakdown {
  type: string;
  cost: number;
}

interface ReportCostSectionProps {
  data: {
    costTrend: CostData[];
    costBreakdown: CostBreakdown[];
    totalCost: number;
    averageDailyCost: number;
    costGrowthRate: number;
  };
}

const ReportCostSection: React.FC<ReportCostSectionProps> = ({ data }) => {
  // 成本趋势配置
  const costTrendConfig = {
    data: data.costTrend,
    xField: 'timestamp',
    yField: 'cost',
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

  // 成本分布配置
  const costBreakdownConfig = {
    data: data.costBreakdown,
    angleField: 'cost',
    colorField: 'type',
    radius: 0.8,
    label: {
      position: 'outside',
      content: (datum: CostBreakdown) => 
        `${datum.type}: ${((datum.cost / data.totalCost) * 100).toFixed(1)}%`,
    },
    tooltip: {
      formatter: (datum: CostBreakdown) => ({
        name: datum.type,
        value: `¥${datum.cost.toFixed(2)}`,
      }),
    },
  };

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Statistic
            title="总成本"
            value={data.totalCost}
            precision={2}
            prefix="¥"
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="日均成本"
            value={data.averageDailyCost}
            precision={2}
            prefix="¥"
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="成本增长率"
            value={data.costGrowthRate}
            precision={2}
            suffix="%"
            valueStyle={{ color: data.costGrowthRate > 0 ? '#cf1322' : '#3f8600' }}
          />
        </Col>
      </Row>

      <Card title="成本趋势" style={{ marginTop: 16 }}>
        <Line {...costTrendConfig} />
      </Card>

      <Card title="成本分布" style={{ marginTop: 16 }}>
        <Pie {...costBreakdownConfig} />
      </Card>
    </div>
  );
};

export default ReportCostSection; 