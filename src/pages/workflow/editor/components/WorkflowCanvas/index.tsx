import React, { useCallback, useState, DragEvent } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Connection,
  Background,
  Controls,
  NodeChange,
  EdgeChange,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useTheme } from 'antd-style';
import { v4 as uuidv4 } from 'uuid';
import CustomNode from './nodes/CustomNode';
import Toolbar from './Toolbar';
import ConfigPanel from './ConfigPanel';
import { NodeTypes, WorkflowNode } from './types';
import './styles/canvas.css';

const nodeTypes = {
  customNode: CustomNode,
};

interface WorkflowCanvasProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onNodesChange?: (nodes: Node[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
}

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  initialNodes = [],
  initialEdges = [],
  onNodesChange,
  onEdgesChange,
}) => {
  const theme = useTheme();
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);

  // 处理节点变化
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const updatedNodes = applyNodeChanges(changes, nodes);
      setNodes(updatedNodes);
      onNodesChange?.(updatedNodes);

      // 处理节点选择状态
      const selectChange = changes.find(
        (change) => change.type === 'select'
      );
      if (selectChange) {
        const node = nodes.find((n) => n.id === selectChange.id);
        setSelectedNode(selectChange.selected ? (node as WorkflowNode) : null);
      }
    },
    [nodes, onNodesChange]
  );

  // 处理连线变化
  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const updatedEdges = applyEdgeChanges(changes, edges);
      setEdges(updatedEdges);
      onEdgesChange?.(updatedEdges);
    },
    [edges, onEdgesChange]
  );

  // 处理连接
  const handleConnect = useCallback(
    (connection: Connection) => {
      const newEdge = {
        ...connection,
        type: 'smoothstep',
        animated: true,
        style: { stroke: theme.colorPrimary },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [theme]
  );

  // 处理节点拖拽结束
  const handleNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node, nodes: Node[]) => {
      // 实现网格对齐
      const gridSize = 20;
      const updatedNode = {
        ...node,
        position: {
          x: Math.round(node.position.x / gridSize) * gridSize,
          y: Math.round(node.position.y / gridSize) * gridSize,
        },
      };
      setNodes(
        nodes.map((n) => (n.id === updatedNode.id ? updatedNode : n))
      );
    },
    []
  );

  // 处理工具栏节点拖拽开始
  const handleToolbarDragStart = (event: DragEvent, nodeType: NodeTypes) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  // 处理拖拽放置
  const handleDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      if (!reactFlowInstance) return;

      const nodeType = event.dataTransfer.getData('application/reactflow') as NodeTypes;
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // 创建新节点
      const newNode: WorkflowNode = {
        id: uuidv4(),
        type: 'customNode',
        position,
        data: {
          label: `${nodeType} ${nodes.length + 1}`,
          type: nodeType,
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, nodes]
  );

  const handleDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // 处理节点配置变更
  const handleConfigChange = useCallback(
    (nodeId: string, config: any) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                config,
              },
            };
          }
          return node;
        })
      );
    },
    []
  );

  return (
    <div className="workflow-canvas">
      <Toolbar onDragStart={handleToolbarDragStart} />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onNodeDragStop={handleNodeDragStop}
        onInit={setReactFlowInstance}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[20, 20]}
      >
        <Background gap={20} color={theme.colorBorderSecondary} />
        <Controls />
      </ReactFlow>
      <ConfigPanel
        selectedNode={selectedNode}
        onConfigChange={handleConfigChange}
      />
    </div>
  );
};

export default WorkflowCanvas; 