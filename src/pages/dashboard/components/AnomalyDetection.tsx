import React from 'react';
import { Card, Space } from 'antd';
import AnomalyConfig from './AnomalyConfig';
import AnomalyVisuals from './AnomalyVisuals';
import AnomalyPrediction from './AnomalyPrediction';
import AnomalyList from './AnomalyList';

const AnomalyDetection: React.FC = () => {
  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Card title="异常检测配置" style={{ marginBottom: 16 }}>
        <AnomalyConfig />
      </Card>

      <Card title="异常检测统计" style={{ marginBottom: 16 }}>
        <AnomalyVisuals />
      </Card>

      <Card title="异常预测" style={{ marginBottom: 16 }}>
        <AnomalyPrediction />
      </Card>

      <Card title="异常列表">
        <AnomalyList />
      </Card>
    </Space>
  );
};

export default AnomalyDetection; 