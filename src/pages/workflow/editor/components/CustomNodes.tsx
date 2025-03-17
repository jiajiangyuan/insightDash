import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, Typography } from 'antd';
import { 
  ApiOutlined, 
  CodeOutlined, 
  DatabaseOutlined, 
  FunctionOutlined, 
  RobotOutlined, 
  SendOutlined, 
  SyncOutlined,
  BranchesOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { NodeType } from '../types';

const { Text } = Typography;

interface CustomNodeData {
  label: string;
  type?: NodeType;
}

const getNodeIcon = (type: NodeType) => {
  const iconStyle = { fontSize: 20 };
  
  switch (type) {
    case 'input':
      return <SendOutlined style={iconStyle} />;
    case 'output':
      return <ApiOutlined style={iconStyle} />;
    case 'llm':
      return <RobotOutlined style={iconStyle} />;
    case 'prompt':
      return <CodeOutlined style={iconStyle} />;
    case 'data':
      return <DatabaseOutlined style={iconStyle} />;
    case 'condition':
      return <BranchesOutlined style={iconStyle} />;
    case 'loop':
      return <ReloadOutlined style={iconStyle} />;
    case 'function':
      return <FunctionOutlined style={iconStyle} />;
    case 'api':
      return <ApiOutlined style={iconStyle} />;
    default:
      return null;
  }
};

const getNodeColor = (type: NodeType) => {
  switch (type) {
    case 'input':
      return { primary: '#389e0d', secondary: '#f6ffed', border: '#b7eb8f', text: '#237804' };
    case 'output':
      return { primary: '#cf1322', secondary: '#fff1f0', border: '#ffa39e', text: '#a8071a' };
    case 'llm':
      return { primary: '#096dd9', secondary: '#e6f7ff', border: '#91d5ff', text: '#0050b3' };
    case 'prompt':
      return { primary: '#531dab', secondary: '#f9f0ff', border: '#d3adf7', text: '#391085' };
    case 'data':
      return { primary: '#d48806', secondary: '#fffbe6', border: '#ffe58f', text: '#ad6800' };
    case 'condition':
      return { primary: '#08979c', secondary: '#e6fffb', border: '#87e8de', text: '#006d75' };
    case 'loop':
      return { primary: '#c41d7f', secondary: '#fff0f6', border: '#ffadd2', text: '#9e1068' };
    case 'function':
      return { primary: '#1d39c4', secondary: '#f0f5ff', border: '#adc6ff', text: '#10239e' };
    case 'api':
      return { primary: '#d46b08', secondary: '#fff7e6', border: '#ffd591', text: '#ad4e00' };
    default:
      return { primary: '#8c8c8c', secondary: '#fafafa', border: '#f0f0f0', text: '#595959' };
  }
};

const CustomNode: React.FC<NodeProps<CustomNodeData>> = ({ data, selected, type }) => {
  const nodeType = type as NodeType;
  const colors = getNodeColor(nodeType);
  const icon = getNodeIcon(nodeType);

  const handleStyle = {
    width: 8,
    height: 8,
    background: colors.primary,
    border: `2px solid ${colors.border}`,
    opacity: 1,
  };

  // 输入连接点
  const renderInputHandle = () => (
    <Handle
      type="target"
      position={Position.Top}
      style={{
        ...handleStyle,
        top: -4,
      }}
      isConnectable={true}
    />
  );

  // 输出连接点
  const renderOutputHandle = () => (
    <Handle
      type="source"
      position={Position.Bottom}
      style={{
        ...handleStyle,
        bottom: -4,
      }}
      isConnectable={true}
    />
  );

  // 条件节点的左右连接点
  const renderConditionHandles = () => (
    <>
      <Handle
        type="source"
        position={Position.Left}
        style={{
          ...handleStyle,
          left: -4,
        }}
        id="left"
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{
          ...handleStyle,
          right: -4,
        }}
        id="right"
        isConnectable={true}
      />
    </>
  );

  return (
    <div style={{ position: 'relative' }}>
      {/* 除了输入节点外，其他所有节点都有输入连接点 */}
      {nodeType !== 'input' && renderInputHandle()}
      
      <Card
        size="small"
        style={{
          width: 180,
          backgroundColor: colors.secondary,
          borderColor: selected ? colors.primary : colors.border,
          borderWidth: selected ? 2 : 1,
          borderStyle: 'solid',
          borderRadius: 8,
          boxShadow: selected ? `0 0 8px ${colors.border}` : 'none',
          transition: 'all 0.3s ease',
          zIndex: 1,
        }}
        bodyStyle={{
          padding: '8px 12px',
        }}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 8,
        }}>
          <div style={{ 
            color: colors.text,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {icon}
          </div>
          <Text
            style={{ 
              color: colors.text,
              fontSize: 14,
              fontWeight: 600,
              margin: 0,
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {data.label}
          </Text>
        </div>
      </Card>

      {/* 除了输出节点外，其他所有节点都有输出连接点 */}
      {nodeType !== 'output' && renderOutputHandle()}
      
      {/* 条件节点额外有左右连接点 */}
      {nodeType === 'condition' && renderConditionHandles()}
    </div>
  );
};

export default CustomNode; 