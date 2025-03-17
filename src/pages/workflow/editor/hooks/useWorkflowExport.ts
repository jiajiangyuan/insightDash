import { useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import { WorkflowTemplate } from '../types';

export const useWorkflowExport = () => {
  const exportToJSON = useCallback((nodes: Node[], edges: Edge[], name: string, description: string) => {
    const template: WorkflowTemplate = {
      id: Date.now().toString(),
      name,
      description,
      nodes,
      edges,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const jsonString = JSON.stringify(template, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name.toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const exportToImage = useCallback((container: HTMLElement) => {
    // 使用 html2canvas 将画布转换为图片
    import('html2canvas').then(({ default: html2canvas }) => {
      html2canvas(container, {
        backgroundColor: '#ffffff',
        scale: 2,
      }).then(canvas => {
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = url;
        link.download = 'workflow.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    });
  }, []);

  return {
    exportToJSON,
    exportToImage,
  };
}; 