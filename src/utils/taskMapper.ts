/**
 * Utilidades para mapear entre tipos del backend y del frontend
 */

import type { Task, BackendTask, TaskStatus, BackendTaskStatus } from '../types';

/**
 * Mapea el estado del backend al estado del frontend
 */
export const mapBackendStatusToFrontend = (status?: BackendTaskStatus | null): TaskStatus => {
  switch (status) {
    case 'TODO':
      return 'pending';
    case 'DOING':
      return 'in-progress';
    case 'DONE':
      return 'completed';
    default:
      return 'pending';
  }
};

/**
 * Mapea el estado del frontend al estado del backend
 */
export const mapFrontendStatusToBackend = (status: TaskStatus): BackendTaskStatus => {
  switch (status) {
    case 'pending':
      return 'TODO';
    case 'in-progress':
      return 'DOING';
    case 'completed':
      return 'DONE';
    case 'cancelled':
      return 'TODO'; // El backend no tiene cancelled, lo mapeamos a TODO
    default:
      return 'TODO';
  }
};

/**
 * Convierte una tarea del backend al formato del frontend
 */
export const mapBackendTaskToFrontend = (backendTask: BackendTask, defaultPriority: Task['priority'] = 'medium'): Task => {
  return {
    id: backendTask.id,
    title: backendTask.title,
    description: backendTask.description || undefined,
    dueDate: backendTask.dueDate ? new Date(backendTask.dueDate) : undefined,
    status: mapBackendStatusToFrontend(backendTask.status),
    priority: defaultPriority, // El backend no tiene priority, usamos un valor por defecto
    category: undefined, // El backend no tiene category
    estimatedTime: undefined, // El backend no tiene estimatedTime
    completedAt: backendTask.status === 'DONE' && backendTask.updatedAt 
      ? new Date(backendTask.updatedAt) 
      : undefined,
    createdAt: backendTask.createdAt,
    updatedAt: backendTask.updatedAt,
  };
};

/**
 * Convierte una tarea del frontend al formato del backend para crear/actualizar
 */
export const mapFrontendTaskToBackend = (task: Partial<Task>): Partial<BackendTask> => {
  const backendTask: Partial<BackendTask> = {};

  if (task.title !== undefined) backendTask.title = task.title;
  if (task.description !== undefined) backendTask.description = task.description || null;
  if (task.status !== undefined) backendTask.status = mapFrontendStatusToBackend(task.status);
  if (task.dueDate !== undefined) {
    backendTask.dueDate = task.dueDate 
      ? (typeof task.dueDate === 'string' ? task.dueDate : task.dueDate.toISOString())
      : null;
  }

  return backendTask;
};

