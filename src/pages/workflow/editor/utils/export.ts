import { Node, Edge } from 'reactflow';
import { WorkflowNode, WorkflowEdge, WorkflowTemplate } from '../types';

export const exportToJson = (nodes: Node[], edges: Edge[]): string => {
  const workflow: WorkflowTemplate = {
    id: `workflow-${Date.now()}`,
    name: '未命名工作流',
    description: '',
    nodes: nodes as WorkflowNode[],
    edges: edges as WorkflowEdge[],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return JSON.stringify(workflow, null, 2);
};

export const exportToImage = async (element: HTMLElement): Promise<string> => {
  const html2canvas = (await import('html2canvas')).default;
  const canvas = await html2canvas(element, {
    backgroundColor: '#ffffff',
    scale: 2,
  });
  return canvas.toDataURL('image/png');
}; 