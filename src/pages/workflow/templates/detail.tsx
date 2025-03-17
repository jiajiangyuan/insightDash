import React from 'react';
import { Card, Descriptions, Button, Space, Tag } from 'antd';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { WorkflowTemplate } from '../editor/types';
import WorkflowPreview from '../components/WorkflowPreview';

const WorkflowTemplateDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // TODO: 从API获取模板数据
  const template: WorkflowTemplate = {
    id: id || '',
    name: '示例模板',
    description: '这是一个示例工作流模板',
    category: 'chat',
    tags: ['常用', '推荐'],
    nodes: [
      {
        id: 'input-1',
        type: 'input',
        position: { x: 100, y: 100 },
        data: { label: '输入', config: {} },
      },
      {
        id: 'llm-1',
        type: 'llm',
        position: { x: 300, y: 100 },
        data: { label: 'LLM', config: { model: 'gpt-3.5-turbo' } },
      },
      {
        id: 'output-1',
        type: 'output',
        position: { x: 500, y: 100 },
        data: { label: '输出', config: {} },
      },
    ],
    edges: [
      {
        id: 'edge-1',
        source: 'input-1',
        target: 'llm-1',
        type: 'smoothstep',
        animated: true,
      },
      {
        id: 'edge-2',
        source: 'llm-1',
        target: 'output-1',
        type: 'smoothstep',
        animated: true,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return (
    <div>
      <Card
        title={
          <Space>
            <Button
              type="link"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/workflow/templates')}
            >
              返回
            </Button>
            <span>模板详情</span>
          </Space>
        }
        extra={
          <Space>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(`/workflow/templates/edit/${id}`)}
            >
              编辑
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                // TODO: 实现删除逻辑
                navigate('/workflow/templates');
              }}
            >
              删除
            </Button>
          </Space>
        }
      >
        <Descriptions bordered>
          <Descriptions.Item label="名称">{template.name}</Descriptions.Item>
          <Descriptions.Item label="描述">{template.description}</Descriptions.Item>
          <Descriptions.Item label="分类">
            <Tag color="blue">{template.category}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="标签">
            <Space>
              {template.tags?.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {new Date(template.createdAt).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="更新时间">
            {new Date(template.updatedAt).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="节点数量" span={2}>
            {template.nodes.length}
          </Descriptions.Item>
          <Descriptions.Item label="连线数量" span={2}>
            {template.edges.length}
          </Descriptions.Item>
        </Descriptions>

        <Card title="工作流预览" style={{ marginTop: 16 }}>
          <WorkflowPreview
            nodes={template.nodes}
            edges={template.edges}
            readOnly={true}
          />
        </Card>
      </Card>
    </div>
  );
};

export default WorkflowTemplateDetail; 