import { request } from '@/utils/request';
import type { WorkflowTemplate } from '@/pages/workflow/editor/types';

export interface SaveWorkflowParams {
  name: string;
  description?: string;
  nodes: any[];
  edges: any[];
  tags?: string[];
}

export async function saveWorkflow(data: Partial<WorkflowTemplate>) {
  return request<WorkflowTemplate>('/api/workflows', {
    method: 'POST',
    data,
  });
}

export async function updateWorkflow(id: string, data: Partial<WorkflowTemplate>) {
  return request<WorkflowTemplate>(`/api/workflows/${id}`, {
    method: 'PUT',
    data,
  });
}

export async function getWorkflow(id: string) {
  return request<WorkflowTemplate>(`/api/workflows/${id}`);
}

export async function getWorkflowList() {
  return request<WorkflowTemplate[]>('/api/workflows');
}

export async function deleteWorkflow(id: string) {
  return request<void>(`/api/workflows/${id}`, {
    method: 'DELETE',
  });
} 