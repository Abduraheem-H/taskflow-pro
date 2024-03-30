import { create } from 'zustand';
import { Task, Priority } from '../types/task';

interface ColumnState {
  id: string;
  title: string;
  taskIds: string[];
}

interface TaskState {
  tasks: Record<string, Task>;
  columns: Record<string, ColumnState>;
  columnOrder: string[];
  addTask: (title: string, description: string, priority: Priority) => void;
}

const initialTasks: Record<string, Task> = {
  'task-1': {
    id: 'task-1',
    title: 'Design system audit',
    description: 'Review existing patterns and update tokens.',
    status: 'todo',
    priority: 'high',
    createdAt: Date.now(),
    tags: ['design']
  }
};

const initialColumns: Record<string, ColumnState> = {
  todo: { id: 'todo', title: 'To Do', taskIds: ['task-1'] },
  'in-progress': { id: 'in-progress', title: 'In Progress', taskIds: [] },
  review: { id: 'review', title: 'Review', taskIds: [] },
  done: { id: 'done', title: 'Done', taskIds: [] }
};

export const useTaskStore = create<TaskState>((set) => ({
  tasks: initialTasks,
  columns: initialColumns,
  columnOrder: ['todo', 'in-progress', 'review', 'done'],
  addTask: (title, description, priority) => {
    const id = `task-${Date.now()}`;
    const newTask: Task = {
      id,
      title,
      description,
      status: 'todo',
      priority,
      createdAt: Date.now(),
      tags: []
    };
    set((state) => ({
      tasks: { ...state.tasks, [id]: newTask },
      columns: {
        ...state.columns,
        todo: {
          ...state.columns.todo,
          taskIds: [...state.columns.todo.taskIds, id]
        }
      }
    }));
  }
}));