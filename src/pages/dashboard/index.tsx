import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Tabs, Button } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import TimeRangeSelector from './components/TimeRangeSelector';
import PerformanceOverview from './components/PerformanceOverview';
import CostAnalysis from './components/CostAnalysis';
import ModelComparison from './components/ModelComparison';
import UserSessions from './components/UserSessions';
import AnomalyDetection from './components/AnomalyDetection';
import AlertHistory from './components/AlertHistory';
import HelpGuide from './components/HelpGuide';
import { useModel } from '@umijs/max';

const Dashboard: React.FC = () => {
  const [helpVisible, setHelpVisible] = useState(false);
  const { timeRange, setTimeRange } = useModel('dashboard');

  const items = [
    {
      key: 'performance',
      label: '性能概览',
      children: <PerformanceOverview />,
    },
    {
      key: 'cost',
      label: '成本分析',
      children: <CostAnalysis />,
    },
    {
      key: 'model',
      label: '模型对比',
      children: <ModelComparison />,
    },
    {
      key: 'session',
      label: '会话分析',
      children: <UserSessions />,
    },
    {
      key: 'anomaly',
      label: '异常检测',
      children: <AnomalyDetection />,
    },
    {
      key: 'alert',
      label: '告警历史',
      children: <AlertHistory />,
    },
  ];

  return (
    <PageContainer
      header={{
        title: '应用性能分析仪表板',
        extra: [
          <Button
            key="help"
            type="text"
            icon={<QuestionCircleOutlined />}
            onClick={() => setHelpVisible(true)}
          >
            使用指南
          </Button>,
        ],
      }}
    >
      <Tabs items={items} />
      <HelpGuide visible={helpVisible} onClose={() => setHelpVisible(false)} />
    </PageContainer>
  );
};

export default Dashboard;