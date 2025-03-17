import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Button, Space, Tag, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { getWorkflow } from '@/services/workflow';
import type { WorkflowTemplate } from '../editor/types';

const WorkflowDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState<WorkflowTemplate | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWorkflow = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await getWorkflow(id);
        setWorkflow(data);
      } catch (error) {
        message.error('获取工作流详情失败');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflow();
  }, [id]);

  if (!workflow) {
    return null;
  }

  return (
    <Card
      title={
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/workflow/list')}
          >
            返回
          </Button>
          <span>工作流详情</span>
        </Space>
      }
      loading={loading}
    >
      <Descriptions bordered>
        <Descriptions.Item label="名称">{workflow.name}</Descriptions.Item>
        <Descriptions.Item label="描述">{workflow.description}</Descriptions.Item>
        <Descriptions.Item label="标签">
          {workflow.tags?.map((tag) => (
            <Tag key={tag} color="blue">
              {tag}
            </Tag>
          ))}
        </Descriptions.Item>
        <Descriptions.Item label="创建时间">
          {new Date(workflow.createdAt).toLocaleString()}
        </Descriptions.Item>
        <Descriptions.Item label="更新时间">
          {new Date(workflow.updatedAt).toLocaleString()}
        </Descriptions.Item>
        <Descriptions.Item label="节点数量">{workflow.nodes.length}</Descriptions.Item>
        <Descriptions.Item label="连接数量">{workflow.edges.length}</Descriptions.Item>
      </Descriptions>

      <div style={{ marginTop: 24 }}>
        <h3>节点列表</h3>
        <Card>
          {workflow.nodes.map((node) => (
            <Card.Grid key={node.id} style={{ width: '25%', textAlign: 'center' }}>
              <div style={{ padding: 8 }}>
                <div>{node.data.label}</div>
                <div style={{ color: '#999' }}>{node.type}</div>
              </div>
            </Card.Grid>
          ))}
        </Card>
      </div>
    </Card>
  );
};

export default WorkflowDetail; 