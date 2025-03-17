import React from 'react';
import { Line } from '@ant-design/plots';

interface ModelPerformanceComparisonProps {
  modelData: {
    label: string;
    data: number[];
  }[];
}

const ModelPerformanceComparison: React.FC<ModelPerformanceComparisonProps> = ({ modelData }) => {
  // 转换数据格式以适应 Ant Design Plots
  const data = modelData.flatMap((model) =>
    model.data.map((value, index) => ({
      month: ['January', 'February', 'March', 'April', 'May', 'June', 'July'][index],
      value,
      model: model.label,
    }))
  );

  const config = {
    data,
    xField: 'month',
    yField: 'value',
    seriesField: 'model',
    yAxis: {
      min: 0,
    },
    legend: {
      position: 'top',
    },
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
    tooltip: {
      showMarkers: true,
    },
  };

  return <Line {...config} />;
};

export default ModelPerformanceComparison;