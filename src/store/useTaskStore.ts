import { create } from 'zustand';
import { Task, Priority } from '../types/task';

interface TaskState {
  tasks: Task[];
  addTask: (title: string, description: string, priority: Priority) => void;
}

const initialTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Design system audit',
    description: 'Review existing patterns and update tokens.',
    status: 'todo',
    priority: 'high',
    createdAt: Date.now(),
    tags: ['design']
  }
];

export const useTaskStore = create<TaskState>((set) => ({
  tasks: initialTasks,
  addTask: (title, description, priority) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      description,
      status: 'todo',
      priority,
      createdAt: Date.now(),
      tags: []
    };
    set((state) => ({ tasks: [...state.tasks, newTask] }));
  }
}));