import { apiFetch } from '../lib/api';
import type { Task } from '../types';

type NewTaskPayload = Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'> & {
  completedAt?: string | Date;
};

export const taskApi = {
  list: () => apiFetch<Task[]>('/tasks'),
  create: (task: NewTaskPayload) =>
    apiFetch<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    }),
  update: (id: string, updates: Partial<Task>) =>
    apiFetch<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  remove: (id: string) =>
    apiFetch<void>(`/tasks/${id}`, {
      method: 'DELETE',
    }),
};

