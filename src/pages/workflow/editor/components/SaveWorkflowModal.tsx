import React from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { saveWorkflow, updateWorkflow } from '@/services/workflow';

const { Option } = Select;

interface SaveWorkflowModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  nodes: any[];
  edges: any[];
  workflowId?: string;
  initialValues?: {
    name: string;
    description?: string;
    tags?: string[];
  };
}

const SaveWorkflowModal: React.FC<SaveWorkflowModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  nodes,
  edges,
  workflowId,
  initialValues,
}) => {
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const params = {
        ...values,
        nodes,
        edges,
      };

      if (workflowId) {
        await updateWorkflow(workflowId, params);
        message.success('工作流更新成功');
      } else {
        await saveWorkflow(params);
        message.success('工作流保存成功');
      }

      onSuccess();
      onCancel();
    } catch (error) {
      message.error('保存失败');
    }
  };

  return (
    <Modal
      title={workflowId ? '更新工作流' : '保存工作流'}
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        preserve={false}
      >
        <Form.Item
          name="name"
          label="工作流名称"
          rules={[{ required: true, message: '请输入工作流名称' }]}
        >
          <Input placeholder="请输入工作流名称" />
        </Form.Item>
        <Form.Item
          name="description"
          label="描述"
        >
          <Input.TextArea rows={4} placeholder="请输入工作流描述" />
        </Form.Item>
        <Form.Item
          name="tags"
          label="标签"
        >
          <Select mode="tags" placeholder="请输入标签">
            <Option value="AI">AI</Option>
            <Option value="自动化">自动化</Option>
            <Option value="数据处理">数据处理</Option>
            <Option value="API集成">API集成</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SaveWorkflowModal; 