import React, { useEffect, useMemo } from 'react';
import { Card, Row, Col, Spin, Radio, Statistic, Tooltip } from 'antd';
import { Line, Column } from '@ant-design/charts';
import { useModel } from '@umijs/max';
import { InfoCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ModelPerformanceData } from '@/services/dashboard';
import ExportToolbar from '@/components/ExportToolbar';

// 生成模拟数据
const generateMockData = (timeRange: [dayjs.Dayjs, dayjs.Dayjs]): ModelPerformanceData[] => {
  const models = ['GPT-4', 'Claude 2', 'Gemini Pro', 'LLaMA 2'];
  const data: ModelPerformanceData[] = [];
  
  // 每2小时生成一个数据点，而不是每小时
  let currentTime = timeRange[0];
  while (currentTime.isBefore(timeRange[1])) {
    models.forEach(modelName => {
      const baseResponseTime = {
        'GPT-4': 800,
        'Claude 2': 600,
        'Gemini Pro': 400,
        'LLaMA 2': 1000
      }[modelName] || 500;
      
      const baseSuccessRate = {
        'GPT-4': 0.98,
        'Claude 2': 0.97,
        'Gemini Pro': 0.95,
        'LLaMA 2': 0.93
      }[modelName] || 0.95;
      
      const baseQualityScore = {
        'GPT-4': 9.5,
        'Claude 2': 9.2,
        'Gemini Pro': 8.8,
        'LLaMA 2': 8.5
      }[modelName] || 8.5;
      
      const baseCostPerToken = {
        'GPT-4': 0.00012,
        'Claude 2': 0.00008,
        'Gemini Pro': 0.00006,
        'LLaMA 2': 0.00003
      }[modelName] || 0.0001;

      data.push({
        modelName,
        timestamp: currentTime.toISOString(),
        responseTime: baseResponseTime + (Math.random() - 0.5) * 50, // 减小随机波动范围
        successRate: Math.min(1, Math.max(0, baseSuccessRate + (Math.random() - 0.5) * 0.02)), // 减小波动
        qualityScore: Math.min(10, Math.max(0, baseQualityScore + (Math.random() - 0.5) * 0.5)), // 减小波动
        tokenCount: Math.floor(Math.random() * 500) + 250, // 减少token数量
        costPerToken: baseCostPerToken + (Math.random() - 0.5) * 0.000005 // 减小波动
      });
    });
    currentTime = currentTime.add(2, 'hour'); // 每2小时一个数据点
  }
  return data;
};

const ModelComparison: React.FC = () => {
  const {
    modelPerformanceData,
    modelLoading,
    timeRange,
    granularity,
    fetchModelPerformanceData,
  } = useModel('dashboard');

  useEffect(() => {
    fetchModelPerformanceData?.();
  }, [timeRange, granularity, fetchModelPerformanceData]);

  // 使用真实数据或模拟数据
  const performanceData = useMemo(() => {
    // 总是使用模拟数据，因为API还未实现
    return generateMockData(timeRange);
  }, [timeRange]);

  // 计算每个模型的平均指标
  const modelAverages = useMemo(() => {
    const models = [...new Set(performanceData.map(item => item.modelName))];
    return models.map(modelName => {
      const modelData = performanceData.filter(item => item.modelName === modelName);
      return {
        modelName,
        avgResponseTime: modelData.reduce((sum, item) => sum + item.responseTime, 0) / modelData.length,
        avgSuccessRate: modelData.reduce((sum, item) => sum + item.successRate, 0) / modelData.length,
        avgQualityScore: modelData.reduce((sum, item) => sum + item.qualityScore, 0) / modelData.length,
        avgTokenCount: modelData.reduce((sum, item) => sum + item.tokenCount, 0) / modelData.length,
        avgCostPerToken: modelData.reduce((sum, item) => sum + item.costPerToken, 0) / modelData.length,
      };
    });
  }, [performanceData]);

  const [selectedMetric, setSelectedMetric] = React.useState<'responseTime' | 'successRate' | 'qualityScore'>('responseTime');

  const metricOptions = [
    { label: '响应时间', value: 'responseTime' },
    { label: '成功率', value: 'successRate' },
    { label: '质量评分', value: 'qualityScore' },
  ];

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

  const trendConfig = {
    ...commonChartConfig,
    data: performanceData.map(item => ({
      ...item,
      timestamp: dayjs(item.timestamp).format('MM-DD HH:mm'),
    })),
    xField: 'timestamp',
    yField: selectedMetric,
    seriesField: 'modelName',
  };

  const comparisonConfig = {
    data: modelAverages,
    xField: 'modelName',
    yField: selectedMetric === 'responseTime' ? 'avgResponseTime' :
            selectedMetric === 'successRate' ? 'avgSuccessRate' : 'avgQualityScore',
  };

  const defaultFields = [
    'modelName',
    'responseTime',
    'successRate',
    'qualityScore',
    'tokenCount',
    'costPerToken',
  ];

  const fieldLabels = {
    modelName: '模型名称',
    responseTime: '响应时间(ms)',
    successRate: '成功率(%)',
    qualityScore: '质量评分',
    tokenCount: 'Token数量',
    costPerToken: '每Token成本',
  };

  return (
    <Spin spinning={modelLoading}>
      <Card
        title="模型性能对比"
        extra={
          <Radio.Group
            value={selectedMetric}
            onChange={e => setSelectedMetric(e.target.value)}
            optionType="button"
            buttonStyle="solid"
            options={metricOptions}
          />
        }
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <ExportToolbar
              data={performanceData}
              filename={`model-performance-${dayjs().format('YYYY-MM-DD')}`}
              title="模型性能数据"
              columns={[
                { title: '模型名称', dataIndex: 'modelName' },
                { title: '响应时间(ms)', dataIndex: 'responseTime' },
                { title: '成功率(%)', dataIndex: 'successRate' },
                { title: '质量评分', dataIndex: 'qualityScore' },
                { title: 'Token数量', dataIndex: 'tokenCount' },
                { title: '每Token成本', dataIndex: 'costPerToken' },
              ]}
            />
          </Col>
          {modelAverages.map(model => (
            <Col span={8} key={model.modelName}>
              <Card size="small">
                <Statistic
                  title={
                    <span>
                      {model.modelName}
                      <Tooltip title="平均每次调用的成本">
                        <InfoCircleOutlined style={{ marginLeft: 8 }} />
                      </Tooltip>
                    </span>
                  }
                  value={(model.avgTokenCount * model.avgCostPerToken).toFixed(4)}
                  suffix="USD/调用"
                  precision={4}
                />
              </Card>
            </Col>
          ))}
          <Col span={24}>
            <Card title="趋势对比" size="small">
              <Line {...trendConfig} height={300} />
            </Card>
          </Col>
          <Col span={24}>
            <Card title="平均值对比" size="small">
              <Column {...comparisonConfig} height={300} />
            </Card>
          </Col>
        </Row>
      </Card>
    </Spin>
  );
};

export default ModelComparison; 