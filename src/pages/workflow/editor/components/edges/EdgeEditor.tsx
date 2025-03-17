import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Switch, Button, Space, message, Tooltip, Select } from 'antd';
import { DeleteOutlined, PlusOutlined, DragOutlined, EditOutlined } from '@ant-design/icons';
import { Edge, useStore, Node, ReactFlowState } from 'reactflow';
import { WorkflowNode } from '../../types';

interface EdgeEditorProps {
  edge: Edge;
  visible: boolean;
  onClose: () => void;
  onUpdate: (edge: Edge) => void;
  onDelete: (edgeId: string) => void;
}

const EdgeEditor: React.FC<EdgeEditorProps> = ({
  edge,
  visible,
  onClose,
  onUpdate,
  onDelete,
}) => {
  const [form] = Form.useForm();
  const [controlPoints, setControlPoints] = useState<{ x: number; y: number }[]>(
    edge.data?.controlPoints || []
  );
  const [isDragging, setIsDragging] = useState(false);
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [labelText, setLabelText] = useState(edge.data?.label || '');

  // 获取画布状态
  const nodes = useStore((state: ReactFlowState) => state.nodes as WorkflowNode[]);

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        label: edge.data?.label || '',
        color: edge.data?.color || '#b1b1b7',
        width: edge.data?.width || 2,
        animated: edge.data?.animated || true,
        style: edge.data?.style || 'default',
      });
      setControlPoints(edge.data?.controlPoints || []);
      setLabelText(edge.data?.label || '');
    }
  }, [visible, edge, form]);

  const handleSubmit = () => {
    form.validateFields().then(values => {
      const updatedEdge = {
        ...edge,
        data: {
          ...edge.data,
          ...values,
          controlPoints,
          label: labelText,
        },
      };
      onUpdate(updatedEdge);
      onClose();
    });
  };

  const handleDelete = () => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条连线吗？',
      onOk: () => {
        onDelete(edge.id);
        onClose();
      },
    });
  };

  const addControlPoint = () => {
    const sourceNode = nodes.find((n: WorkflowNode) => n.id === edge.source);
    const targetNode = nodes.find((n: WorkflowNode) => n.id === edge.target);
    
    if (sourceNode && targetNode) {
      const newPoint = {
        x: (sourceNode.position.x + targetNode.position.x) / 2,
        y: (sourceNode.position.y + targetNode.position.y) / 2,
      };
      setControlPoints([...controlPoints, newPoint]);
    }
  };

  const removeControlPoint = (index: number) => {
    setControlPoints(controlPoints.filter((_, i) => i !== index));
  };

  const updateControlPoint = (index: number, field: 'x' | 'y', value: number) => {
    const newPoints = [...controlPoints];
    newPoints[index] = { ...newPoints[index], [field]: value };
    setControlPoints(newPoints);
  };

  const handlePointDragStart = (index: number) => {
    setIsDragging(true);
    setSelectedPointIndex(index);
  };

  const handlePointDragEnd = () => {
    setIsDragging(false);
    setSelectedPointIndex(null);
  };

  const handlePointDrag = (index: number, x: number, y: number) => {
    if (isDragging && selectedPointIndex === index) {
      updateControlPoint(index, 'x', x);
      updateControlPoint(index, 'y', y);
    }
  };

  const toggleLabelEdit = () => {
    setIsEditingLabel(!isEditingLabel);
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLabelText(e.target.value);
  };

  return (
    <Modal
      title="编辑连线"
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item label="标签">
          <Space>
            {isEditingLabel ? (
              <Input
                value={labelText}
                onChange={handleLabelChange}
                onBlur={toggleLabelEdit}
                autoFocus
              />
            ) : (
              <span onClick={toggleLabelEdit} style={{ cursor: 'pointer' }}>
                {labelText || '点击添加标签'}
              </span>
            )}
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={toggleLabelEdit}
            />
          </Space>
        </Form.Item>

        <Form.Item label="颜色" name="color">
          <Input type="color" />
        </Form.Item>

        <Form.Item label="宽度" name="width">
          <InputNumber min={1} max={5} />
        </Form.Item>

        <Form.Item label="样式" name="style">
          <Select
            options={[
              { label: '默认', value: 'default' },
              { label: '直线', value: 'straight' },
              { label: '折线', value: 'step' },
              { label: '平滑', value: 'smoothstep' },
              { label: '曲线', value: 'curve' },
              { label: '自定义', value: 'custom' },
            ]}
          />
        </Form.Item>

        <Form.Item label="动画效果" name="animated" valuePropName="checked">
          <Switch />
        </Form.Item>

        {form.getFieldValue('style') === 'custom' && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Button type="dashed" onClick={addControlPoint} block icon={<PlusOutlined />}>
                添加控制点
              </Button>
            </div>
            {controlPoints.map((point, index) => (
              <Space key={index} style={{ marginBottom: 8 }}>
                <Tooltip title="拖动调整位置">
                  <Button
                    type="text"
                    icon={<DragOutlined />}
                    onMouseDown={() => handlePointDragStart(index)}
                    onMouseUp={handlePointDragEnd}
                    onMouseLeave={handlePointDragEnd}
                  />
                </Tooltip>
                <InputNumber
                  value={point.x}
                  onChange={(value) => updateControlPoint(index, 'x', value || 0)}
                  placeholder="X坐标"
                />
                <InputNumber
                  value={point.y}
                  onChange={(value) => updateControlPoint(index, 'y', value || 0)}
                  placeholder="Y坐标"
                />
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removeControlPoint(index)}
                />
              </Space>
            ))}
          </div>
        )}

        <Form.Item>
          <Space>
            <Button type="primary" onClick={handleSubmit}>
              保存
            </Button>
            <Button danger onClick={handleDelete}>
              删除
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EdgeEditor; 