import { apiFetch } from '../lib/api';
import type { Task, BackendTask } from '../types';
import { mapBackendTaskToFrontend, mapFrontendTaskToBackend } from '../utils/taskMapper';

type NewTaskPayload = Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'> & {
  completedAt?: string | Date;
};

interface BackendTasksResponse {
  tasks: BackendTask[];
}

interface BackendTaskResponse {
  task: BackendTask;
}

export const taskApi = {
  list: async (): Promise<Task[]> => {
    const response = await apiFetch<BackendTasksResponse>('/tasks');
    return response.tasks.map((backendTask) => mapBackendTaskToFrontend(backendTask));
  },
  
  create: async (task: NewTaskPayload): Promise<Task> => {
    const backendPayload = mapFrontendTaskToBackend(task);
    const response = await apiFetch<BackendTaskResponse>('/tasks', {
      method: 'POST',
      body: JSON.stringify(backendPayload),
    });
    return mapBackendTaskToFrontend(response.task, task.priority);
  },
  
  update: async (id: string, updates: Partial<Task>, currentTask?: Task): Promise<Task> => {
    const backendPayload = mapFrontendTaskToBackend(updates);
    const response = await apiFetch<BackendTaskResponse>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(backendPayload),
    });
    // Mantener la prioridad de la tarea actual o de updates si existe
    const priority = updates.priority ?? currentTask?.priority ?? 'medium';
    return mapBackendTaskToFrontend(response.task, priority);
  },
  
  remove: async (id: string): Promise<void> => {
    await apiFetch<void>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },
};

