import React, { useEffect, useState } from 'react';
import { Table, Card, Button, Space, Tag, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getWorkflowList, deleteWorkflow } from '@/services/workflow';
import type { WorkflowTemplate } from '../editor/types';

const WorkflowList: React.FC = () => {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<WorkflowTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const data = await getWorkflowList();

      setWorkflows(data);
    } catch (error) {
      message.error('获取工作流列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
    
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteWorkflow(id);
      message.success('删除成功');
      fetchWorkflows();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: WorkflowTemplate) => (
        <a onClick={() => navigate(`/workflow/detail/${record.id}`)}>{text}</a>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => (
        <>
          {tags?.map((tag) => (
            <Tag key={tag} color="blue">
              {tag}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: WorkflowTemplate) => (
        <Space>
          <Button type="link" onClick={() => navigate(`/workflow/editor?id=${record.id}`)}>
            编辑
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="工作流列表"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/workflow/editor')}
        >
          新建工作流
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={workflows}
        rowKey="id"
        loading={loading}
      />
    </Card>
  );
};

export default WorkflowList; 