import React from 'react';
import { Card, Empty } from 'antd';
import { NodeTypes, WorkflowNode } from '../types';
import IOConfig from '../configs/IOConfig';
import LLMConfig from '../configs/LLMConfig';
import PromptConfig from '../configs/PromptConfig';
import ConditionConfig from '../configs/ConditionConfig';
import DataConfig from '../configs/DataConfig';
import LoopConfig from '../configs/LoopConfig';
import './styles/configPanel.css';

interface ConfigPanelProps {
  selectedNode?: WorkflowNode | null;
  onConfigChange?: (nodeId: string, config: any) => void;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({
  selectedNode,
  onConfigChange,
}) => {
  if (!selectedNode) {
    return (
      <div className="config-panel">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="请选择一个节点进行配置"
        />
      </div>
    );
  }

  const handleConfigChange = (config: any) => {
    onConfigChange?.(selectedNode.id, config);
  };

  const renderConfig = () => {
    const type = selectedNode.data.type;
    const config = selectedNode.data.config;

    switch (type) {
      case NodeTypes.INPUT:
        return <IOConfig type="input" config={config} onChange={handleConfigChange} />;
      case NodeTypes.OUTPUT:
        return <IOConfig type="output" config={config} onChange={handleConfigChange} />;
      case NodeTypes.LLM:
        return <LLMConfig config={config} onChange={handleConfigChange} />;
      case NodeTypes.PROMPT:
        return <PromptConfig config={config} onChange={handleConfigChange} />;
      case NodeTypes.CONDITION:
        return <ConditionConfig config={config} onChange={handleConfigChange} />;
      case NodeTypes.DATA_PROCESS:
        return <DataConfig config={config} onChange={handleConfigChange} />;
      case NodeTypes.LOOP:
        return <LoopConfig config={config} onChange={handleConfigChange} />;
      default:
        return <Empty description="暂不支持该节点类型的配置" />;
    }
  };

  return (
    <div className="config-panel">
      <Card
        title={`${selectedNode.data.label} 配置`}
        className="config-card"
        bordered={false}
      >
        {renderConfig()}
      </Card>
    </div>
  );
};

export default ConfigPanel; 