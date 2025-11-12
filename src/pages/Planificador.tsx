/**
 * Página Planificador - Gestión de tareas y agenda
 */

import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Task, TaskPriority } from '../types';

export const Planificador = () => {
  const { tasks, addTask, updateTask, deleteTask, toggleTaskStatus } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium' as TaskPriority,
    category: '',
  });

  const handleOpenModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description || '',
        dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
        priority: task.priority,
        category: task.category || '',
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium',
        category: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingTask) {
      updateTask(editingTask.id, {
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
      });
    } else {
      addTask({
        ...formData,
        status: 'pending',
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
      });
    }
    handleCloseModal();
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'pending') return task.status !== 'completed';
    if (filter === 'completed') return task.status === 'completed';
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // Ordenar por prioridad y fecha
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    return 0;
  });

  const getPriorityColor = (priority: TaskPriority) => {
    const colors = {
      urgent: 'danger',
      high: 'warning',
      medium: 'primary',
      low: 'neutral',
    } as const;
    return colors[priority];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Planificador</h1>
          <p className="mt-2 text-neutral-600">
            Gestiona tus tareas y actividades académicas
          </p>
        </div>
        <Button onClick={() => handleOpenModal()} size="lg">
          <PlusIcon className="w-5 h-5 mr-2" />
          Nueva Tarea
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          Todas
        </Button>
        <Button
          variant={filter === 'pending' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('pending')}
        >
          Pendientes
        </Button>
        <Button
          variant={filter === 'completed' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('completed')}
        >
          Completadas
        </Button>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {sortedTasks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-neutral-500">
                {filter === 'all'
                  ? 'No hay tareas. ¡Crea tu primera tarea!'
                  : `No hay tareas ${filter === 'pending' ? 'pendientes' : 'completadas'}.`}
              </p>
            </CardContent>
          </Card>
        ) : (
          sortedTasks.map((task) => (
            <Card key={task.id} variant={task.status === 'completed' ? 'outlined' : 'default'}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 flex items-start gap-3">
                    <button
                      onClick={() => toggleTaskStatus(task.id)}
                      className="mt-1 flex-shrink-0"
                      aria-label={task.status === 'completed' ? 'Marcar como pendiente' : 'Marcar como completada'}
                    >
                      {task.status === 'completed' ? (
                        <CheckCircleIcon className="w-6 h-6 text-success" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-neutral-300 hover:border-primary-500 transition-colors" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`font-semibold text-neutral-900 ${
                          task.status === 'completed' ? 'line-through text-neutral-500' : ''
                        }`}
                      >
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-sm text-neutral-600 mt-1">{task.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <Badge variant={getPriorityColor(task.priority)} size="sm">
                          {task.priority === 'urgent'
                            ? 'Urgente'
                            : task.priority === 'high'
                            ? 'Alta'
                            : task.priority === 'medium'
                            ? 'Media'
                            : 'Baja'}
                        </Badge>
                        {task.dueDate && (
                          <div className="flex items-center gap-1 text-xs text-neutral-500">
                            <ClockIcon className="w-4 h-4" />
                            {format(new Date(task.dueDate), "d 'de' MMMM", { locale: es })}
                          </div>
                        )}
                        {task.category && (
                          <Badge variant="neutral" size="sm">
                            {task.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenModal(task)}
                      aria-label="Editar tarea"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTask(task.id)}
                      aria-label="Eliminar tarea"
                    >
                      <TrashIcon className="w-4 h-4 text-danger" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Task Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTask ? 'Editar Tarea' : 'Nueva Tarea'}
        footer={
          <>
            <Button variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} type="submit">
              {editingTask ? 'Guardar Cambios' : 'Crear Tarea'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Título"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Ej: Estudiar para el examen de matemáticas"
            required
            fullWidth
          />
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detalles adicionales..."
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Fecha de vencimiento"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              fullWidth
            />
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Prioridad
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
          </div>
          <Input
            label="Categoría (opcional)"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="Ej: Matemáticas, Proyecto, Examen"
            fullWidth
          />
        </form>
      </Modal>
    </div>
  );
};

