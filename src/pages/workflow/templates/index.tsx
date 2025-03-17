import React, { useState } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, Select, Tag, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { WorkflowTemplate } from '../editor/types';

const { Option } = Select;

const WorkflowTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingTemplate, setEditingTemplate] = useState<WorkflowTemplate | null>(null);

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => (
        <Tag color="blue">{category || '未分类'}</Tag>
      ),
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => (
        <Space>
          {tags?.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </Space>
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
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            查看
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingTemplate(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (template: WorkflowTemplate) => {
    setEditingTemplate(template);
    form.setFieldsValue(template);
    setIsModalVisible(true);
  };

  const handleDelete = (template: WorkflowTemplate) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除模板"${template.name}"吗？`,
      onOk: () => {
        setTemplates(templates.filter((t) => t.id !== template.id));
        message.success('删除成功');
      },
    });
  };

  const handleView = (template: WorkflowTemplate) => {
    // TODO: 实现查看模板详情
    console.log('查看模板:', template);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingTemplate) {
        // 更新模板
        setTemplates(
          templates.map((t) =>
            t.id === editingTemplate.id
              ? { ...t, ...values, updatedAt: new Date().toISOString() }
              : t
          )
        );
        message.success('更新成功');
      } else {
        // 创建新模板
        const newTemplate: WorkflowTemplate = {
          id: `template-${Date.now()}`,
          ...values,
          nodes: [],
          edges: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setTemplates([...templates, newTemplate]);
        message.success('创建成功');
      }
      setIsModalVisible(false);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  return (
    <div>
      <Card
        title="工作流模板"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新建模板
          </Button>
        }
      >
        <Table columns={columns} dataSource={templates} rowKey="id" />
      </Card>

      <Modal
        title={editingTemplate ? '编辑模板' : '新建模板'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入模板名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea />
          </Form.Item>
          <Form.Item name="category" label="分类">
            <Select>
              <Option value="chat">对话</Option>
              <Option value="completion">补全</Option>
              <Option value="embedding">嵌入</Option>
              <Option value="custom">自定义</Option>
            </Select>
          </Form.Item>
          <Form.Item name="tags" label="标签">
            <Select mode="tags" placeholder="请输入标签">
              <Option value="常用">常用</Option>
              <Option value="推荐">推荐</Option>
              <Option value="示例">示例</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default WorkflowTemplates; 