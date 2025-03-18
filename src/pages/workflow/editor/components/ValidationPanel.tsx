import React from 'react';
import { List, Tag, Typography } from 'antd';
import { Panel } from 'reactflow';
import { ValidationError } from '../types/validation';
import '../styles/validation.css';

const { Text } = Typography;

interface ValidationPanelProps {
  errors: ValidationError[];
  onErrorClick?: (error: ValidationError) => void;
}

const ValidationPanel: React.FC<ValidationPanelProps> = ({ errors, onErrorClick }) => {
  const getErrorColor = (type: ValidationError['type']) => {
    switch (type) {
      case 'connection':
        return 'red';
      case 'configuration':
        return 'orange';
      case 'cycle':
        return 'purple';
      case 'parameter':
        return 'blue';
      default:
        return 'default';
    }
  };

  const getErrorIcon = (type: ValidationError['type']) => {
    switch (type) {
      case 'connection':
        return '🔌';
      case 'configuration':
        return '⚙️';
      case 'cycle':
        return '🔄';
      case 'parameter':
        return '📝';
      default:
        return '❌';
    }
  };

  return (
    <Panel
      position="top-right"
      className="validation-panel"
      title={`验证结果 (${errors.length} 个问题)`}
    >
      <List
        size="small"
        dataSource={errors}
        renderItem={(error) => (
          <List.Item
            className="validation-error-item"
            onClick={() => onErrorClick?.(error)}
          >
            <List.Item.Meta
              avatar={<span className="error-icon">{getErrorIcon(error.type)}</span>}
              title={
                <div className="error-title">
                  <Tag color={getErrorColor(error.type)}>{error.type}</Tag>
                  <Text>{error.message}</Text>
                </div>
              }
              description={error.details && <Text type="secondary">{error.details}</Text>}
            />
          </List.Item>
        )}
      />
    </Panel>
  );
};

export default ValidationPanel; 