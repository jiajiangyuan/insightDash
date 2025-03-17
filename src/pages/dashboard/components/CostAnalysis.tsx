import React, { useEffect } from 'react';
import { Card, Row, Col, Statistic, Spin, Select, Tooltip } from 'antd';
import { Line, Pie, Column } from '@ant-design/charts';
import { useModel } from '@umijs/max';
import { InfoCircleOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { CostAnalysisData } from '@/types/cost';
import ExportToolbar from '@/components/ExportToolbar';

const { Option } = Select;

interface CostDistributionItem {
  type: string;
  value: number;
}

const CostAnalysis: React.FC = () => {
  const {
    costData = {
      costTrend: [],
      costBreakdown: [],
      totalCost: 0,
      averageDailyCost: 0,
      costGrowthRate: 0,
    },
    costLoading: loading,
    timeRange,
    setTimeRange,
    granularity,
    fetchCostData,
  } = useModel('dashboard');

  useEffect(() => {
    fetchCostData();
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

  // 计算总成本
  const totalCost = React.useMemo(() => {
    if (!costData?.costTrend?.length) return 0;
    return costData.costTrend.reduce((sum, item) => sum + (Number(item.cost) || 0), 0);
  }, [costData]);

  // 计算成本分布
  const costDistribution = React.useMemo(() => {
    if (!costData?.costTrend?.length) return [];
    
    const distribution: CostDistributionItem[] = [
      { type: '计算资源', value: 0 },
      { type: '存储资源', value: 0 },
      { type: '网络资源', value: 0 },
      { type: '其他', value: 0 },
    ];

    costData.costTrend.forEach(item => {
      const cost = Number(item.cost) || 0;
      // 根据成本类型分配
      if (item.type === 'compute') {
        distribution[0].value += cost;
      } else if (item.type === 'storage') {
        distribution[1].value += cost;
      } else if (item.type === 'network') {
        distribution[2].value += cost;
      } else {
        distribution[3].value += cost;
      }
    });

    return distribution.filter(item => item.value > 0);
  }, [costData]);

  const trendConfig = {
    data: costData?.costTrend || [],
    xField: 'timestamp',
    yField: 'cost',
    seriesField: 'type',
    animation: false,
    smooth: false,
    point: {
      size: 3,
      shape: 'circle',
    },
  };

  const pieConfig = {
    data: [
      { type: '计算资源', value: 4500 },
      { type: '存储资源', value: 2800 },
      { type: '网络资源', value: 1200 },
      { type: '其他', value: 800 },
    ],
    angleField: 'value',
    colorField: 'type',
    label: {
      text: 'value',
      position: 'outside',
    },
  };

  const modelConfig = {
    data: [
      { type: 'GPT-4', cost: 3200 },
      { type: 'GPT-3.5', cost: 2800 },
      { type: 'Claude', cost: 1800 },
      { type: '其他', cost: 1500 },
    ],
    xField: 'type',
    yField: 'cost',
  };

  const costDistributionConfig = {
    data: costDistribution,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
  };

  return (
    <Spin spinning={loading}>
      <Card title="成本分析">
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <ExportToolbar
              data={costData?.costTrend || []}
              filename={`成本分析_${dayjs().format('YYYY-MM-DD_HH-mm')}`}
              title="成本分析数据"
              columns={[
                { title: '时间', dataIndex: 'timestamp' },
                { title: '成本($)', dataIndex: 'cost' },
                { title: '类型', dataIndex: 'type' },
              ]}
            />
          </Col>
          <Col span={8}>
            <Card size="small">
              <Statistic
                title={
                  <span>
                    总成本
                    <Tooltip title="当前时间范围内的总成本">
                      <InfoCircleOutlined style={{ marginLeft: 8 }} />
                    </Tooltip>
                  </span>
                }
                value={costData?.totalCost || 0}
                precision={4}
                prefix="$"
                suffix={
                  <span style={{ fontSize: 14, marginLeft: 8 }}>
                    {(costData?.costGrowthRate || 0) > 0 ? (
                      <span style={{ color: '#ff4d4f' }}>
                        <ArrowUpOutlined /> {(costData?.costGrowthRate || 0).toFixed(1)}%
                      </span>
                    ) : (
                      <span style={{ color: '#52c41a' }}>
                        <ArrowDownOutlined /> {Math.abs(costData?.costGrowthRate || 0).toFixed(1)}%
                      </span>
                    )}
                  </span>
                }
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <Statistic
                title={
                  <span>
                    日均成本
                    <Tooltip title="平均每日成本">
                      <InfoCircleOutlined style={{ marginLeft: 8 }} />
                    </Tooltip>
                  </span>
                }
                value={costData?.averageDailyCost || 0}
                precision={4}
                prefix="$"
              />
            </Card>
          </Col>
          <Col span={24}>
            <Card title="成本趋势" size="small">
              <Line {...trendConfig} height={300} />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="成本构成" size="small">
              <Pie {...pieConfig} height={300} />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="模型成本分布" size="small">
              <Column {...modelConfig} height={300} />
            </Card>
          </Col>
        </Row>
      </Card>
    </Spin>
  );
};

export default CostAnalysis; 