import React, { useCallback, useState } from 'react';
import { Button, Space, Select, Modal, message, Input, Switch, Tooltip } from 'antd';
import ReactFlow, {
  Node,
  Edge,
  Connection,
  Controls,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  EdgeTypes,
  NodeTypes,
  NodeProps,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  Panel,
  BackgroundVariant,
  useStore,
} from 'reactflow';
import {
  BaseEdge,
  StraightEdge,
  StepEdge,
  SmoothStepEdge,
} from '@reactflow/core';
import 'reactflow/dist/style.css';
import CustomNode from './components/CustomNodes';
import NodePanel from './components/NodePanel';
import NodeConfigPanel from './components/NodeConfigPanel';
import ExecutionStatusPanel from './components/ExecutionStatus';
import TemplateLibrary from './components/TemplateLibrary';
import { validateWorkflow, ValidationError } from './utils/validation';
import { exportToJson, exportToImage } from './utils/export';
import SaveWorkflowModal from './components/SaveWorkflowModal';
import { WorkflowNode, WorkflowEdge, NodeConfig, NodeType, WorkflowTemplate } from './types';
import { PlayCircleOutlined, SaveOutlined, ExportOutlined, AppstoreOutlined, BorderOutlined, PlusOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { WorkflowExecutor, ExecutionStatus } from './utils/workflowExecutor';
import { LLMService } from './services/llmService';
import { useWorkflowStore } from './store/workflowStore';
import { useWorkflowTemplates } from './hooks/useWorkflowTemplates';
import { useWorkflowHistory } from './hooks/useWorkflowHistory';
import { useWorkflowValidation } from './hooks/useWorkflowValidation';
import { useWorkflowExecution } from './hooks/useWorkflowExecution';
import { useWorkflowExport } from './hooks/useWorkflowExport';
import { useWorkflowImport } from './hooks/useWorkflowImport';
import { useWorkflowAutoLayout } from './hooks/useWorkflowAutoLayout';
import { useWorkflowGridSnap } from './hooks/useWorkflowGridSnap';
import CustomEdge from './components/edges/CustomEdge';
import './styles/edges.css';

const nodeTypes: NodeTypes = {
  input: CustomNode,
  output: CustomNode,
  llm: CustomNode,
  prompt: CustomNode,
  data: CustomNode,
  condition: CustomNode,
  loop: CustomNode,
  function: CustomNode,
  api: CustomNode,
};

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
};

const defaultNodes: WorkflowNode[] = [
  {
    id: 'input-1',
    type: 'input',
    position: { x: 100, y: 100 },
    data: {
      label: '输入节点',
      description: '工作流的起始节点',
    },
  },
  {
    id: 'llm-1',
    type: 'llm',
    position: { x: 400, y: 100 },
    data: {
      label: 'LLM节点',
      description: '语言模型处理节点',
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
    },
  },
  {
    id: 'output-1',
    type: 'output',
    position: { x: 700, y: 100 },
    data: {
      label: '输出节点',
      description: '工作流的结束节点',
    },
  },
];

const defaultEdges: WorkflowEdge[] = [
  {
    id: 'edge-1',
    source: 'input-1',
    target: 'llm-1',
    type: 'default',
    animated: true,
  },
  {
    id: 'edge-2',
    source: 'llm-1',
    target: 'output-1',
    type: 'default',
    animated: true,
  },
];

const defaultEdgeOptions = {
  type: 'custom',
  animated: true,
  data: {
    style: 'smoothstep',
    color: '#b1b1b7',
    width: 2,
    label: '',
  },
};

const WorkflowEditor: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [edgeStyle, setEdgeStyle] = useState<'default' | 'straight' | 'step' | 'smoothstep'>('smoothstep');
  const [edgeColor, setEdgeColor] = useState('#b1b1b7');
  const [edgeWidth, setEdgeWidth] = useState(2);
  const [edgeLabel, setEdgeLabel] = useState('');
  const [edgeAnimated, setEdgeAnimated] = useState(true);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [workflowId, setWorkflowId] = useState<string>();
  const [workflowName, setWorkflowName] = useState<string>('');
  const [templateLibraryVisible, setTemplateLibraryVisible] = useState(false);
  const [executionStatus, setExecutionStatus] = useState<ExecutionStatus[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [gridSnap, setGridSnap] = useState(true);
  const [gridSize, setGridSize] = useState(20);
  const [autoLayout, setAutoLayout] = useState(false);
  const [isConfigPanelVisible, setIsConfigPanelVisible] = useState(false);

  // 使用自定义 hooks
  const { snapToGrid, getSnappedPosition } = useWorkflowGridSnap(gridSize);
  const { applyAutoLayout } = useWorkflowAutoLayout();

  const onConnect = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target) return;
    
    const newEdge: WorkflowEdge = {
      ...connection,
      id: `edge-${Date.now()}`,
      type: 'custom',
      animated: edgeAnimated,
      data: {
        style: edgeStyle,
        color: edgeColor,
        width: edgeWidth,
        label: edgeLabel,
      },
    };
    setEdges((eds) => [...eds, newEdge]);
  }, [edgeStyle, edgeColor, edgeWidth, edgeLabel, edgeAnimated]);

  // 处理拖拽放置
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = document.querySelector('.react-flow')?.getBoundingClientRect();
      if (!reactFlowBounds) return;

      const type = event.dataTransfer.getData('application/reactflow') as NodeType;
      if (!type) return;

      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      const newNode: WorkflowNode = {
        id: `node-${Date.now()}`,
        type,
        position,
        data: {
          label: `新${type}节点`,
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  // 处理拖拽悬停
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // 处理节点选择
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node as WorkflowNode);
  }, []);

  // 处理节点更新
  const onNodeUpdate = useCallback((nodeId: string, data: NodeConfig) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === nodeId ? { ...n, data } : n))
    );
  }, [setNodes]);

  // 处理节点删除
  const onNodeDelete = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    setSelectedNode(null);
  }, [setNodes, setEdges]);

  // 处理保存
  const handleSave = useCallback(() => {
    const errors = validateWorkflow(nodes, edges);
    if (errors.length > 0) {
      setValidationErrors(errors);
      setShowValidationModal(true);
      return;
    }
    setSaveModalVisible(true);
  }, [nodes, edges]);

  // 处理保存成功
  const handleSaveSuccess = useCallback(() => {
    message.success('工作流保存成功');
    setSaveModalVisible(false);
  }, []);

  // 处理导出为JSON
  const handleExportJson = useCallback(() => {
    exportToJson(nodes, edges);
  }, [nodes, edges]);

  // 处理导出为图片
  const handleExportImage = useCallback(() => {
    const flowElement = document.querySelector('.react-flow');
    if (flowElement) {
      exportToImage(flowElement as HTMLElement);
    }
  }, []);

  const handleStartExecution = useCallback(async () => {
    try {
      setIsExecuting(true);
      setExecutionStatus([]);

      // 验证工作流
      const errors = validateWorkflow(nodes, edges);
      if (errors.length > 0) {
        Modal.error({
          title: '工作流验证失败',
          content: (
            <ul>
              {errors.map((error, index) => (
                <li key={index}>{error.message}</li>
              ))}
            </ul>
          ),
        });
        return;
      }

      // 创建工作流执行器
      const executor = new WorkflowExecutor(nodes, edges, (status) => {
        setExecutionStatus(status);
      });

      // 执行工作流
      const result = await executor.execute();

      if (result.success) {
        message.success('工作流执行完成');
        // 这里可以处理执行结果
        console.log('执行结果:', result.outputs);
      } else {
        message.error(`工作流执行失败: ${result.error}`);
      }
    } catch (error) {
      message.error(`执行出错: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsExecuting(false);
    }
  }, [nodes, edges]);

  const handleTemplateSelect = useCallback((template: WorkflowTemplate) => {
    setNodes(template.nodes);
    setEdges(template.edges);
    setTemplateLibraryVisible(false);
  }, []);

  const handleTemplateSave = useCallback((template: Partial<WorkflowTemplate>) => {
    // 这里可以添加保存模板到后端的逻辑
    console.log('保存模板:', template);
    setTemplateLibraryVisible(false);
  }, []);

  // 节点变化处理
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      if (gridSnap) {
        // 处理节点位置变化，应用网格对齐
        const snappedChanges = changes.map(change => {
          if (change.type === 'position' && change.position) {
            return {
              ...change,
              position: getSnappedPosition(change.position),
            };
          }
          return change;
        });
        onNodesChange(snappedChanges);
      } else {
        onNodesChange(changes);
      }
    },
    [gridSnap, getSnappedPosition, onNodesChange]
  );

  // 应用自动布局
  const handleAutoLayout = useCallback(() => {
    const layoutedNodes = applyAutoLayout(nodes);
    setNodes(layoutedNodes);
  }, [nodes, applyAutoLayout, setNodes]);

  // 重置画布
  const handleResetCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    setIsConfigPanelVisible(false);
    setExecutionStatus({});
  }, [setNodes, setEdges]);

  // 渲染工具栏
  const renderToolbar = () => (
    <Panel position="top-left" className="workflow-toolbar">
      <Space>
        <Tooltip title="添加节点">
          <Button icon={<PlusOutlined />} onClick={() => setTemplateLibraryVisible(true)} />
        </Tooltip>
        <Tooltip title="保存工作流">
          <Button icon={<SaveOutlined />} onClick={handleTemplateSave} />
        </Tooltip>
        <Tooltip title="执行工作流">
          <Button icon={<PlayCircleOutlined />} onClick={handleStartExecution} />
        </Tooltip>
        <Tooltip title="删除选中节点">
          <Button icon={<DeleteOutlined />} onClick={onNodeDelete} />
        </Tooltip>
        <Tooltip title="重置画布">
          <Button icon={<ReloadOutlined />} onClick={handleResetCanvas} />
        </Tooltip>
        <Tooltip title="网格对齐">
          <Switch checked={gridSnap} onChange={setGridSnap} />
        </Tooltip>
        <Tooltip title="自动布局">
          <Switch checked={autoLayout} onChange={handleAutoLayout} />
        </Tooltip>
        <Select
          value={edgeStyle}
          onChange={setEdgeStyle}
          style={{ width: 120 }}
          options={[
            { label: '默认', value: 'default' },
            { label: '直线', value: 'straight' },
            { label: '折线', value: 'step' },
            { label: '平滑', value: 'smoothstep' },
          ]}
        />
      </Space>
    </Panel>
  );

  // 渲染连线配置面板
  const renderEdgeConfig = () => (
    <Panel position="top-right" className="edge-config-panel">
      <Space direction="vertical" style={{ background: 'white', padding: '10px', borderRadius: '4px' }}>
        <div>
          <div>连线样式</div>
          <Select
            value={edgeStyle}
            onChange={setEdgeStyle}
            style={{ width: 120 }}
            options={[
              { label: '默认', value: 'default' },
              { label: '直线', value: 'straight' },
              { label: '折线', value: 'step' },
              { label: '平滑', value: 'smoothstep' },
            ]}
          />
        </div>
        <div>
          <div>连线颜色</div>
          <Input
            type="color"
            value={edgeColor}
            onChange={(e) => setEdgeColor(e.target.value)}
            style={{ width: 120 }}
          />
        </div>
        <div>
          <div>连线宽度</div>
          <Select
            value={edgeWidth}
            onChange={setEdgeWidth}
            style={{ width: 120 }}
            options={[
              { label: '细线', value: 1 },
              { label: '正常', value: 2 },
              { label: '粗线', value: 3 },
            ]}
          />
        </div>
        <div>
          <div>连线标签</div>
          <Input
            value={edgeLabel}
            onChange={(e) => setEdgeLabel(e.target.value)}
            placeholder="输入标签"
            style={{ width: 120 }}
          />
        </div>
        <div>
          <div>动画效果</div>
          <Switch checked={edgeAnimated} onChange={setEdgeAnimated} />
        </div>
      </Space>
    </Panel>
  );

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <NodePanel />
      <div style={{ flex: 1, position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          fitView
          attributionPosition="bottom-left"
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={gridSize}
            size={1}
            color="#aaa"
            style={{ backgroundColor: '#f8f8f8' }}
          />
          <Controls />
          <MiniMap />
          {renderToolbar()}
          {renderEdgeConfig()}
        </ReactFlow>
        {selectedNode && (
          <NodeConfigPanel
            node={selectedNode}
            onUpdate={onNodeUpdate}
            onDelete={onNodeDelete}
          />
        )}
        <ExecutionStatusPanel
          nodes={nodes}
          edges={edges}
          status={executionStatus}
        />
        <TemplateLibrary
          visible={templateLibraryVisible}
          onClose={() => setTemplateLibraryVisible(false)}
          onSelect={handleTemplateSelect}
          onSave={handleTemplateSave}
        />
        <Modal
          title="验证错误"
          open={showValidationModal}
          onOk={() => setShowValidationModal(false)}
          onCancel={() => setShowValidationModal(false)}
        >
          <ul>
            {validationErrors.map((error, index) => (
              <li key={index}>{error.message}</li>
            ))}
          </ul>
        </Modal>
        <SaveWorkflowModal
          visible={saveModalVisible}
          onCancel={() => setSaveModalVisible(false)}
          onSuccess={handleSaveSuccess}
          nodes={nodes}
          edges={edges}
          workflowId={workflowId}
          initialValues={{ name: workflowName }}
        />
      </div>
    </div>
  );
};

export default WorkflowEditor; 