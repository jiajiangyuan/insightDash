import { message } from 'antd';
import { WorkflowTemplate } from '../editor/types';

// 模拟API调用
const mockApi = {
  saveWorkflow: async (workflow: Omit<WorkflowTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkflowTemplate> => {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 模拟成功响应
    return {
      ...workflow,
      id: `workflow-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },
  
  updateWorkflow: async (id: string, workflow: Partial<WorkflowTemplate>): Promise<WorkflowTemplate> => {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 模拟成功响应
    return {
      ...workflow,
      id,
      updatedAt: new Date().toISOString(),
    } as WorkflowTemplate;
  },
};

export const workflowService = {
  // 保存工作流
  saveWorkflow: async (workflow: Omit<WorkflowTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const result = await mockApi.saveWorkflow(workflow);
      message.success('工作流保存成功');
      return result;
    } catch (error) {
      message.error('工作流保存失败');
      throw error;
    }
  },

  // 更新工作流
  updateWorkflow: async (id: string, workflow: Partial<WorkflowTemplate>) => {
    try {
      const result = await mockApi.updateWorkflow(id, workflow);
      message.success('工作流更新成功');
      return result;
    } catch (error) {
      message.error('工作流更新失败');
      throw error;
    }
  },
}; 