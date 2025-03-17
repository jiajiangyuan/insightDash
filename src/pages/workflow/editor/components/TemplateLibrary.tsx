import React from 'react';
import { Card, List, Button, Modal, Form, Input, Tag, Space, Select } from 'antd';
import { WorkflowTemplate } from '../types';

interface TemplateLibraryProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (template: WorkflowTemplate) => void;
  onSave: (template: Partial<WorkflowTemplate>) => void;
}

const defaultTemplates: WorkflowTemplate[] = [
  {
    id: 'template-1',
    name: '情感分析工作流',
    description: '使用 LLM 进行文本情感分析',
    tags: ['NLP', '情感分析'],
    nodes: [
      {
        id: 'input-1',
        type: 'input',
        position: { x: 100, y: 100 },
        data: {
          label: '文本输入',
          description: '输入需要分析的文本',
          dataType: 'text',
          required: true
        }
      },
      {
        id: 'prompt-1',
        type: 'prompt',
        position: { x: 100, y: 250 },
        data: {
          label: '情感分析提示词',
          description: '构建情感分析提示词',
          template: '请分析以下文本的情感倾向：{{text}}。请用JSON格式返回，包含情感（positive/negative/neutral）和置信度（0-1）。',
          variables: ['text']
        }
      },
      {
        id: 'llm-1',
        type: 'llm',
        position: { x: 100, y: 400 },
        data: {
          label: 'GPT分析',
          description: '使用GPT进行情感分析',
          model: 'gpt-3.5-turbo',
          temperature: 0.7,
          maxTokens: 1000
        }
      },
      {
        id: 'condition-1',
        type: 'condition',
        position: { x: 100, y: 550 },
        data: {
          label: '情感判断',
          description: '根据情感分类处理',
          condition: '{{sentiment}} === "positive"',
          trueBranch: '积极情感处理',
          falseBranch: '消极情感处理'
        }
      },
      {
        id: 'output-1',
        type: 'output',
        position: { x: 300, y: 700 },
        data: {
          label: '分析结果输出',
          description: '输出情感分析结果'
        }
      }
    ],
    edges: [
      {
        id: 'edge-1',
        source: 'input-1',
        target: 'prompt-1',
        type: 'default'
      },
      {
        id: 'edge-2',
        source: 'prompt-1',
        target: 'llm-1',
        type: 'default'
      },
      {
        id: 'edge-3',
        source: 'llm-1',
        target: 'condition-1',
        type: 'default'
      },
      {
        id: 'edge-4',
        source: 'condition-1',
        target: 'output-1',
        type: 'default'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'template-2',
    name: '数据处理工作流',
    description: '数据清洗和转换流程',
    tags: ['数据处理', 'ETL'],
    nodes: [
      {
        id: 'input-1',
        type: 'input',
        position: { x: 100, y: 100 },
        data: {
          label: 'JSON输入',
          description: '输入需要处理的JSON数据',
          dataType: 'json',
          required: true
        }
      },
      {
        id: 'function-1',
        type: 'function',
        position: { x: 100, y: 250 },
        data: {
          label: '数据清洗',
          description: '清洗和验证JSON数据',
          functionName: 'cleanData',
          parameters: JSON.stringify({
            removeNull: true,
            validateSchema: true
          })
        }
      },
      {
        id: 'api-1',
        type: 'api',
        position: { x: 100, y: 400 },
        data: {
          label: '数据转换API',
          description: '调用外部API进行数据转换',
          endpoint: 'https://api.example.com/transform',
          method: 'POST',
          headers: JSON.stringify({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify({
            format: 'csv',
            options: {
              delimiter: ','
            }
          })
        }
      },
      {
        id: 'output-1',
        type: 'output',
        position: { x: 100, y: 550 },
        data: {
          label: '处理结果输出',
          description: '输出处理后的数据'
        }
      }
    ],
    edges: [
      {
        id: 'edge-1',
        source: 'input-1',
        target: 'function-1',
        type: 'default'
      },
      {
        id: 'edge-2',
        source: 'function-1',
        target: 'api-1',
        type: 'default'
      },
      {
        id: 'edge-3',
        source: 'api-1',
        target: 'output-1',
        type: 'default'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const TemplateLibrary: React.FC<TemplateLibraryProps> = ({
  visible,
  onClose,
  onSelect,
  onSave,
}) => {
  const [saveModalVisible, setSaveModalVisible] = React.useState(false);
  const [form] = Form.useForm();

  const handleSaveTemplate = async () => {
    try {
      const values = await form.validateFields();
      onSave({
        ...values,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setSaveModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  return (
    <>
      <Modal
        title="工作流模板库"
        open={visible}
        onCancel={onClose}
        width={800}
        footer={[
          <Button key="save" type="primary" onClick={() => setSaveModalVisible(true)}>
            保存为模板
          </Button>,
          <Button key="close" onClick={onClose}>
            关闭
          </Button>,
        ]}
      >
        <List
          grid={{ gutter: 16, column: 2 }}
          dataSource={defaultTemplates}
          renderItem={(template) => (
            <List.Item>
              <Card
                title={template.name}
                extra={
                  <Button type="link" onClick={() => onSelect(template)}>
                    使用
                  </Button>
                }
              >
                <p>{template.description}</p>
                <Space>
                  {template.tags?.map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </Space>
              </Card>
            </List.Item>
          )}
        />
      </Modal>

      <Modal
        title="保存为模板"
        open={saveModalVisible}
        onOk={handleSaveTemplate}
        onCancel={() => setSaveModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="模板名称"
            rules={[{ required: true, message: '请输入模板名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
            rules={[{ required: true, message: '请输入描述' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="tags" label="标签">
            <Select mode="tags" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default TemplateLibrary; 