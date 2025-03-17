import React from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  NodeTypes,
  EdgeTypes,
  Position,
} from 'reactflow';
import {
  BaseEdge,
  getBezierPath,
  getStraightPath,
  getSmoothStepPath,
} from '@reactflow/core';
import 'reactflow/dist/style.css';
import { WorkflowNode, WorkflowEdge } from '../editor/types';
import { InputNode, OutputNode, LLMNode, PromptNode, DataNode, DefaultNode } from '../editor/components/nodes';

interface WorkflowPreviewProps {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  readOnly?: boolean;
}

const nodeTypes: NodeTypes = {
  input: InputNode,
  output: OutputNode,
  llm: LLMNode,
  prompt: PromptNode,
  data: DataNode,
  default: DefaultNode,
};

const DefaultEdge = ({ sourceX, sourceY, targetX, targetY, ...props }: any) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    targetX,
    targetY,
  });
  return <path {...props} d={edgePath} />;
};

const StraightEdge = ({ sourceX, sourceY, targetX, targetY, ...props }: any) => {
  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });
  return <path {...props} d={edgePath} />;
};

const StepEdge = ({ sourceX, sourceY, targetX, targetY, ...props }: any) => {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    borderRadius: 20,
  });
  return <path {...props} d={edgePath} />;
};

const SmoothStepEdge = ({ sourceX, sourceY, targetX, targetY, ...props }: any) => {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    borderRadius: 20,
  });
  return <path {...props} d={edgePath} />;
};

const edgeTypes: EdgeTypes = {
  default: DefaultEdge,
  straight: StraightEdge,
  step: StepEdge,
  smoothstep: SmoothStepEdge,
};

const WorkflowPreview: React.FC<WorkflowPreviewProps> = ({
  nodes,
  edges,
  readOnly = true,
}) => {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: 400 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable={!readOnly}
        panOnScroll
        zoomOnScroll
        panOnDrag
        preventScrolling
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};

export default WorkflowPreview; 