import { create } from 'zustand';
import { Task } from '../types/task';

interface TaskState {
  tasks: Task[];
  addTask: (task: Task) => void;
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
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] }))
}));